/**
 * Wex 全局状态管理
 * getters() 获取全局变量：默认返回全部，传字String返回指定key，传Array返回存在的数组
 * setters() 设置指定变量
 * getApp() 返回weapp全部参数
 * 
 * !!!虽然可以使用store.state.key的方式来操作数据，但不建议这样，有违Wex设计初衷
 */

const app = getApp().store;

class Wex {
  constructor(state) {
    this.state = state;
  }
  getters(key) {
    if (typeof key == "string" && this.state[key] != undefined) {
      return this.state[key];
    }
    if (Object.prototype.toString.call(key) == "[object Array]") {
      return key.filter(i => this.state[i]).map(i => this.state[i]);
    }
    return this.state;
  }
  setters(key, value) {
    if (!key) return "key is undefined";
    this.state[key] = value;
    return this.state;
  }
  getApp(){
    return app;
  }
}

export default new Wex(app.app);
