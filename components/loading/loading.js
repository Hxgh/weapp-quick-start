// components/dialog/dialog.js

Component({
  /**
   * 组件的初始数据
   */
  data: {
    show:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show:function(show){
      this.setData({
        show:show
      })
    }
  }
})
