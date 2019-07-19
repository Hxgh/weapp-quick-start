import { request,pub } from '../../libs/index.js';
Page({
  data: {
    list: {
      data: []
    },
    api: {
      list: '/api/list'
    }
  },
  onLoad() {
    //注入loading组件:这种操作其实可以统一管理
    this.loading = this.selectComponent('#loading');
  },
  onHide() {},
  onShow() {},
  getList() {
    request({
      url: this.data.api.list,
      data: { page: 1 },
      method: 'GET'
    })
      .then()
      .catch()
      .finally();
  },
  onShareAppMessage() {
    return pub.getShare();
  }
});
