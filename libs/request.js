const app = getApp();
const store = app.store;

/**
 * 登录
 * @return {promise} res rej
 */

function login() {
  return new Promise((res, rej) => {
    // 微信登录
    wx.login({
      success(r1) {
        if (r1.code) {
          // 获取token
          requestPromise({
            url: store.url.login,
            data: {
              code: r1.code,
              ...store.share
            },
            method: 'POST'
          })
            .then(r2 => {
              if (r2.code == 200) {
                // 保存token和认证信息
                store.auth = Object.assign({}, store.auth, r2.data);
                res(r2);
              } else {
                rej(
                  failFilter({
                    type: 'auth.success',
                    detail: r2
                  })
                );
                //全局处理错误信息
              }
            })
            .catch(err => {
              rej(err);
            });
        } else {
          rej(
            failFilter({
              type: 'wx.login.success',
              detail: r1
            })
          );
        }
      },
      fail(err) {
        rej(
          failFilter({
            type: 'wx.login.fail',
            detail: err
          })
        );
      }
    });
  });
}

/**
 * 获取token
 * @return {promise} token
 */

const loginQueue = [];
let isLoginning = false;

function getToken() {
  return new Promise((res, rej) => {
    // 本地token缺失，重新登录
    if (!store.auth.token) {
      loginQueue.push({ res, rej });

      if (!isLoginning) {
        isLoginning = true;

        login()
          .then(r1 => {
            isLoginning = false;
            while (loginQueue.length) {
              loginQueue.shift().res(r1);
            }
          })
          .catch(err => {
            isLoginning = false;
            while (loginQueue.length) {
              loginQueue.shift().rej(err);
            }
          });
      }
    } else {
      res(store.auth.token);
    }
  });
}

/**
 * 判断请求状态是否成功
 * @param {Number} status
 * @return {Boolen}
 */

function isHttpSuccess(status) {
  return (status >= 200 && status < 300) || status === 304;
}

/**
 * promise请求
 * @param options 参考wx.request
 * @return {promise} res
 */

function requestPromise(options = {}) {
  //注入可能用到的success，fail
  const { success, fail } = options;

  // 注入header
  const header = Object.assign(
    {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + store.auth.token
    },
    options.header
  );
  // 注入url头
  const url = `${store.url.base}${options.url}`;

  return new Promise((res, rej) => {
    wx.request(
      Object.assign({}, options, {
        header,
        url,
        success(r) {
          const isSuccess = isHttpSuccess(r.statusCode);
          if (isSuccess) {
            // 成功的请求状态
            if (success) {
              success(r.data);
              return;
            }
            res(r.data);
          } else {
            const err = failFilter({
              type: 'wx.request.success',
              detail: r,
              options
            });
            if (fail) {
              fail(err);
              return;
            }
            rej(err);
          }
        },
        fail(e) {
          const err = failFilter({
            type: 'wx.request.fail',
            detail: e,
            options
          });
          if (fail) {
            fail(err);
            return;
          }
          rej(err);
        }
      })
    );
  });
}

/**
 * 全局错误处理
 * @param {Object} err
 * @return {Object} detail 如果未进行过滤，则为接口返回的数据
 */

const tips = {
  1: '后端大哥开小差去了，请联系管理员',
  'wx.login.success': '登陆错误',
  'wx.login.fail': '登陆失败',
  'auth.success': '登陆凭证校验错误',
  'wx.request.success': '请求错误',
  'wx.request.fail': '请求失败'
};

function failFilter(err = {}) {
  //提炼报错
  const { type, detail, options } = err;
  const title = tips[type] || tips[1];
  //清空请求缓存
  if (options) {
    interceptorEnd(options);
  }
  //提示
  wx.hideLoading();
  wx.showToast({
    title: `${title}${detail.statusCode || ''}`,
    icon: 'none',
    duration: 4000
  });
  return detail;
}

/**
 * ajax保持登陆
 * @param {Object} option = {}，参考wx.request；
 * @param {Boolen} keepLogin = false
 * @return {promise} res
 */
function reqKeepLogin(options = {}, keepLogin = true) {
  if (keepLogin) {
    return new Promise((res, rej) => {
      getToken()
        .then(r1 => {
          // 获取token成功之后，发起请求
          requestPromise(options)
            .then(r2 => {
              if (r2.code === 401) {
                // 登录状态无效，则重新走一遍登录流程
                // 销毁本地已失效的token
                store.auth.token = '';

                getToken().then(r3 => {
                  requestPromise(options)
                    .then(res)
                    .catch(rej);
                });
              } else {
                res(r2);
              }
            })
            .catch(rej);
        })
        .catch(rej);
    });
  } else {
    // 不需要token，直接发起请求
    return requestPromise(options);
  }
}

/**
 * ajax过滤拦截状态
 * @param {Object} obj = {}，此次请求所带参数
 * @return {promise} obj
 */

let reqIng = []; //正在进行的请求

function interceptorFilter(obj = {}) {
  return new Promise((res, rej) => {
    if (!obj || Object.prototype.toString.call(obj) != '[object Object]') {
      rej(obj);
    }
    const objJSON = JSON.stringify(obj);
    let have = reqIng.filter(i => {
      return i == objJSON;
    });
    if (have.length != 0) {
      rej(obj);
    } else {
      reqIng.push(objJSON);
      res(obj);
    }
  });
}

/**
 * ajax过滤拦截状态
 * @param {Object} obj = {}，此次请求所带参数
 * @return {promise} obj
 */

function interceptorEnd(obj = {}) {
  const objJSON = JSON.stringify(obj);
  reqIng = reqIng.filter(i => {
    return objJSON && objJSON != i;
  });
}

/**
 * ajax重复请求拦截
 * @param {Object} option = {}，参考wx.request；
 * @param {Boolen} keepLogin = false
 * @return {promise} res
 */

function requestInterceptor(options = {}, keepLogin = true) {
  return new Promise((res, rej) => {
    interceptorFilter(options)
      .then(opt => {
        reqKeepLogin(opt, keepLogin)
          .then(r1 => {
            res(r1);
            //清理正在请求的数据值
            interceptorEnd(opt);
          })
          .catch(err => {
            rej(err);
          });
      })
      .catch(err => {
        console.log('重复请求已被拦截：', err);
        // rej(err);
      });
  });
}

/**
 * 过滤缓存状态
 * @param {Object} option = {}；
 * @return {promise} res
 */

let reqCache = []; //已缓存的请求

function reqCacheFilter(options = {}) {
  const time = new Date().getTime();
  const opt = JSON.stringify(options);
  let cache = reqCache.filter(i => {
    return i.time + 5 * 60 * 1000 > time && i.opt == opt;
  });
  return new Promise((res, rej) => {
    if (cache.length > 0) {
      res(JSON.parse(cache[0].res));
    } else {
      rej();
    }
  });
}

/**
 * 设置缓存
 * @param {Object} option = {}；
 * @param {Object} resData = {}，接口缓存的数据；
 * @return undefined
 */

function reqCacheSet(options = {}, resData = {}) {
  const time = new Date().getTime();
  const opt = JSON.stringify(options);
  const res = JSON.stringify(resData);
  reqCache = reqCache.filter((i, x) => {
    return opt && opt != i.opt;
  });
  reqCache.push({
    time: time,
    opt: opt,
    res: res
  });
}

/**
 * ajax缓存封装
 * @param {Object} option = {}，参考wx.request；
 * @param {Boolen} keepLogin = false
 * @param {Boolen} cache = false
 * @return {promise} res
 */

function requestCache(options = {}, cache = false, config) {
  const { keepLogin } = config;
  return new Promise((res, rej) => {
    if (cache) {
      reqCacheFilter(options)
        .then(res)
        .catch(() => {
          requestInterceptor(options, keepLogin)
            .then(r1 => {
              reqCacheSet(options, r1);
              res(r1, reqCache);
            })
            .catch(rej);
        });
    } else {
      requestInterceptor(options, keepLogin)
        .then(res)
        .catch(rej);
    }
  });
}

/**
 * 全局状态管理
 * @param {Boolean} loading
 * @return 参数：undefined；
 */

function requestStatus(loading) {
  setTimeout(() => {
    if (loading) {
      // console.log("正在进行的请求", reqIng);
      // console.log("已缓存的请求", reqCache);
      if (reqIng.length > 0) {
        // wx.showLoading({
        //   title: '请求数据...',
        //   mask: true
        // });
        showLoad(true);
        //loading 进度条
      } else {
        //结束loading 结束进度条
        // wx.hideLoading();
        showLoad(false);
      }
    }
  }, 0);
}

/**
 * loading插件
 * @param {Boolean} load
 */
function showLoad(load = true) {
  const pg = getCurrentPages();
  let tag = pg[pg.length - 1];
  tag.loading && tag.loading.show(load);
}

/**
 * ajax全局状态封装
 * @param {Object} option = {}，参考wx.request；
 * @param {Boolen} keepLogin = false
 * @param {Boolen} cache = false
 * @return {promise} res
 */

function request(options = {}, cache = false, config = {}) {
  let more = Object.assign(
    {
      keepLogin: true,
      loading: true
    },
    config
  );
  const { loading } = more;
  requestStatus(loading);
  return new Promise((res, rej) => {
    requestCache(options, cache, more)
      .then(r1 => {
        res(r1);
      })
      .catch(err => {
        rej(err);
      })
      .finally(() => {
        requestStatus(loading);
      });
  });
}

export default request;
