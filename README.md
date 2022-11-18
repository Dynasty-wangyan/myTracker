
# 前端埋点SDK

> `埋点` 就是数据采集-数据处理-数据分析和挖掘，如用户停留时间，用户哪个按钮点得多，等

- 技术架使用的ts + rollup
- 使用ts主要是编译过程中好发现问题，并减少生产代码的错误
- 使用rollup 打包更干净，而webpack 非常臃肿，可读性差。所以rollup 非常适合开发sdk和一些框架。webpack 适合开发一些项目

## 1. 目录结构设计

![目录结构图片](https://files.catbox.moe/rwjt7o.png)

## 2. 使用

- 先npm install 安装项目依赖
- 然后npm run build 生成一个dist文件夹
- html文件下script标签 则引用生成的index.js 文件
- index.esm.js -> import export
- index.cjs.js -> require exports

> 使用

```js
<script src="./dist//index.js"></script>
<script>
      import Tracker from './dist/index.cjs.js'
       new Tracker({
         requestUrl: 'http://*********',  // 后台接口地址
         historyTracker: true,  // history模式跳转是否上报
         domTracker: true,   // hash模式跳转是否上报
         jsError: true  // js 和 promise 报错异常是否上报
       })
</script>
```

> 参数说明  
```js
 /**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @historyTracker sdkVersion sdk版本
 * @historyTracker extra 透传字段
 * @jsError js 和 promise 报错异常上报
 */
export interface DefaultOptons {
    uuid: string | undefined,
    requestUrl: string | undefined,
    historyTracker: boolean,
    hashTracker: boolean,
    domTracker: boolean,
    sdkVersion: string | number,
    extra: Record<string, any> | undefined,
    jsError:boolean
}
```