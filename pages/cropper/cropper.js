const app = getApp();
Page({
  data: {
    src: '',
    key: '',
    width: 300, //宽度
    height: 300, //高度
    max_width: 400,
    max_height: 400,
    disable_rotate: true, //是否禁用旋转
    limit_move: false, //是否限制移动
    disable_ratio: true, //锁定比例
    disable_width: true, //锁定宽度
    disable_height: true //锁定高度
  },
  onLoad: function(options) {
    //加载组件，调起wx上传图片接口并开始剪裁
    this.cropper = this.selectComponent('#image-cropper');
    const { img, key } = this.options;
    this.setData({
      key: key || '0'
    });
    if (img) {
      this.setData({
        src: img
      });
    } else {
      this.cropper.upload();
    }
  },
  cropperload(e) {},
  loadimage(e) {
    wx.hideLoading();
    this.cropper.imgReset();
  },
  clickcut(e) {
    //图片预览
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    });
  },
  upload() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '加载中'
        });
        const tempFilePaths = res.tempFilePaths[0];
        //重置图片角度、缩放、位置
        that.cropper.imgReset();
        that.setData({
          src: tempFilePaths
        });
      }
    });
  },
  saveImg() {
    let self = this;
    this.cropper.getImg(obj => {
      app.globalData.cropperImg ? '' : (app.globalData.cropperImg = {});
      app.globalData.cropperImg[self.data.key] = obj.url;
      wx.navigateBack({
        delta: -1
      });
    });
  }
});
