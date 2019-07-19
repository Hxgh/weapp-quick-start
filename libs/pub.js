/**
 * pub 业务函数
 *
 * @function getShare 分享过滤
 * @function getNodesRef 获取页面节点信息
 * @function previewImage wx.previewImage会触发onShow，此方法结合isPreview避免触发
 * @function isPreview onShow(){if(isPreview()){//dosomething}}
 * @function uploadFiles 多图上传
 *
 */
const app = getApp();
const pub = {
  getShare(options = {}) {
    return Object.assign(
      {
        imageUrl: '/img/logo.png',
        title: 'weapp',
        path: `pages/index/index`
      },
      options
    );
  },
  getNodesRef(target, opt = {}) {
    const { properties, computedStyle } = opt;
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        [`${target[0] == '.' ? 'selectAll' : 'select'}`](`${target}`)
        .fields(
          {
            id: true,
            dataset: true,
            rect: true,
            size: true,
            scrollOffset: true,
            properties: properties,
            computedStyle: computedStyle,
            context: true
          },
          res => {
            if (res) {
              resolve(res);
            } else {
              reject(`未找到节点：${target}`);
            }
          }
        )
        .exec();
    });
  },
  toPreview: false,
  previewImage(options = {}) {
    if (!options.urls || options.urls.length == 0) return;
    this.toPreview = true;
    wx.previewImage(options);
  },
  isPreview() {
    if (this.toPreview) {
      this.toPreview = false;
      return false;
    }
    return true;
  },
  uploadFiles(arr) {
    return Promise.all(
      arr.map(i => {
        return new Promise(function(resolve, reject) {
          wx.uploadFile({
            url: app.store.api.base + app.store.api.file,
            filePath: i,
            name: 'file',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res) {
              if (res.data) {
                res = JSON.parse(res.data);
                if (res.code == 200) {
                  resolve(res.data.url);
                } else {
                  reject(res);
                }
              } else {
                reject(res);
              }
            },
            fail(err) {
              reject(err);
            }
          });
        });
      })
    );
  }
};
export default pub;
