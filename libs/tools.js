/**
 * tools 全局工具函数：!!!禁止包含业务代码，理论上只存放纯js处理逻辑
 * 
 * @function getDateTime 获取时间
 * @function getTimestamp 获取时间戳
 * @function clone 克隆对象
 * @function reverseString 反转字符串
 * @function addZero 数字补0
 */

const tools = {
  getDateTime(t = +new Date(), sep1 = "-", sep2 = ":") {
    return new Date(t + 8 * 3600 * 1000)
      .toJSON()
      .substr(0, 19)
      .replace("T", " ")
      .replace(/-/g, sep1)
      .replace(/:/g, sep2);
  },
  getTimestamp(t) {
    if (t) {
      return +new Date(t).getTime() / 1e3;
    }
    return t;
  },
  clone(obj) {
    if (typeof obj == "object") {
      return JSON.parse(JSON.stringify(obj));
    }
    return obj;
  },
  reverseString(s) {
    return s
      .toString()
      .split("")
      .reverse()
      .join("");
  },
  addZero(num, len = 2) {
    if (Number(num)) {
      return (Array(len).join("0") + num).slice(-len);
    }
    return Math.pow(10, len)
      .toString()
      .substr(1);
  },
  typeofFun(val){
    if(typeof val == 'object'){
      return Object.prototype.toString.call(val)
    }else{
      return typeof val
    }
  }
};

export default tools;
