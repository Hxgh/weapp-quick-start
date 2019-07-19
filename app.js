App({
  onLaunch(opt) {
    let self = this;
    //管理小程序更新
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {
      //发现新版本
      if (res.hasUpdate) {
        //loading
        wx.showLoading({
          mask: true,
          title: '正在更新版本'
        });
        //新版本下载成功后触发onUpdateReady函数
        updateManager.onUpdateReady(function() {
          wx.hideLoading();
          wx.showModal({
            title: '更新提示',
            content: '版本更新完成，重启应用继续使用吧！',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                //强制小程序重启并使用新版本
                updateManager.applyUpdate();
              }
            }
          });
        });
        //新版本下载失败后触发onUpdateReady函数
        updateManager.onUpdateFailed(function() {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '更新失败，请将小程序删除，再通过搜索重新打开！',
            showCancel: false
          });
        });
      }
    });

    //把onLaunch的opt注入在store
    self.store.options = opt;
    //抓取系统信息存放在store
    wx.getSystemInfo({
      success: function(res) {
        self.store.system = res;
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，调用getUserInfo获取头像昵称
          wx.getUserInfo({
            success: res => {
              // 把userInfo注入在store
              self.store.userInfo = res.userInfo;
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          });
        }
      }
    });
  },
  onShow(opt) {
    console.log('App onShow', opt);
  },
  onHide(opt) {
    console.log('App onHide', opt);
  },
  onError(e) {
    console.log('App onError', e);
  },
  /**
   * 全局对象
   * @param {Object} url url地址
   * @param {Object} auth 认证相关信息
   * @param {Object} options 小程序启动时的参数，与 wx.getLaunchOptionsSync 一致。
   * @param {Object} system 设备信息
   * @param {Object} share 分享信息
   * @param {Object} app 业务层面的数据
   */
  store: {
    url: {
      base: 'http://weapp.com',
      login: '/login',
      file: '/file',
      err: '/err'
    },
    auth: {
      token: ''
    },
    options: {},
    system: {},
    userInfo: {},
    share: {},
    app: {}
  }
});
