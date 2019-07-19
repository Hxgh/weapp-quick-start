/**
 * request wx.request + wx.login 等封装
 * store 全局状态管理
 * tools 工具函数
 * pub 业务函数
 *
 * dist文件夹为第三方库
 * -- moment JavaScript 日期处理类库 手动修改过源码以支持中文
 * -- polyfill 覆盖原生Promise库
 *
 * -- 自定义函数
 * 命名方法：小驼峰式命名法
 * 命名规范：前缀应当为动词
 * 命名建议：可使用常见动词约定: to go can add has is set load filter reverse split 等
 *
 */

import request from "request.js";
import store from "store.js";
import tools from "tools.js";
import pub from "pub.js";

import moment from "dist/moment.min.js";

import "dist/polyfill.min.js";
global.Promise && (Promise = global.Promise);

export { request, store, tools, pub };
export { moment };
