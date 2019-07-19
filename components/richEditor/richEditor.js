Component({
  properties: {
    content: {
      type: String,
      value: '',
      observer(content) {
        console.log(content);
        if (this.editorCtx) {
          this.editorCtx.setContents(content);
        }
      }
    },
    defaultContent: {
      type: String,
      value: '',
      observer(content) {
      }
    }
  },
  data: {
    rich: ''
  },
  methods: {
    readOnlyChange() {
      this.setData({
        readOnly: !this.data.readOnly
      });
    },
    onEditorReady() {
      const that = this;
      wx.createSelectorQuery()
        .in(this)
        .select('#editor')
        .context(function(res) {
          res.context.setContents({html:that.properties.content});
          that.editorCtx = res.context;
        })
        .exec();
    },
    format(e) {
      let { name, value } = e.target.dataset;
      if (!name) return;
      this.editorCtx.format(name, value);
    },
    insertImage() {
      const that = this;
      wx.chooseImage({
        count: 3,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          that.uploadImgs(res.tempFilePaths).then(pic => {
            pic.forEach((src, index) => {
              that.editorCtx.insertImage({
                src: src,
                data: {
                  id: `abcd${index}`,
                  role: 'god'
                },
                success: function() {
                  console.log('insert image success');
                }
              });
            });
          });
        }
      });
    },
    editorChange(detail) {
      console.log(detail);
      this.setData({
        rich: detail.detail.html
      });
      this.triggerEvent('contentChange', {value:detail.detail.html});
    },
    uploadImgs(arr) {
      let self = this;
      return Promise.all(
        arr.map(i => {
          return new Promise(function(resolve, reject) {
            wx.uploadFile({
              url: getApp().globalData.url + '/api/files',
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
  },
  created() {
    setTimeout(()=>{
      this.data.content=this.data.defaultContent;
    },10)
  }
});
