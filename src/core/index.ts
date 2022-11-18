import { DefaultOptions, Options, TrackerConfig } from "../types/index"
import { createHistoryEvent } from "../utils/pv"

// DOM事件监听

// 主要是给需要监听的元素添加一个属性 用来区分是否需要监听 target-key
/***定义一个需要监听的dom元素事件集合
 * @click  鼠标点击事件
 * @dblclick 鼠标双击事件
 * @contextmenu 鼠标右键事件
 * @mousedown 鼠标按下事件
 * @mouseup 鼠标松开事件
 * @mouseenter 只有在鼠标指针穿过被选元素时，才会触发 mouseenter 事件。
 * @mouseover 不论鼠标指针穿过被选元素或其子元素，都会触发 mouseover 事件。
 * @mouseout 不论鼠标指针离开被选元素还是任何子元素，都会触发 mouseout 事件。
 * @mouseleave 只有在鼠标指针离开被选元素时，才会触发 mouseleave 事件。
****/ 
const MouseEventList: string[] = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover']

export default class Tracker {
    public data: Options
    constructor (options: Options) {
      this.data = Object.assign(this.initDef(), options)
      this.installTracker()
    }
    
    private initDef ():DefaultOptions {
       window.history['pushState'] = createHistoryEvent('pushState')
       window.history['replaceState'] = createHistoryEvent('replaceState')
       return <DefaultOptions> {
             sdkVersion: TrackerConfig.version,
             historyTracker: false,
             hashTracker:false,
             domTracker: false,
             jsError: false
       }
    }
   
    // 暴露一个接口给用户传uuid 也就是用户id
   public setUserId <T extends DefaultOptions['uuid']>(uuid: T) {
       this.data.uuid = uuid
   }
    // 暴露一个接口给用户传透传字段 也就是用户自定义参数
   public setExtra <T extends DefaultOptions['extra']>(extra: T) {
       this.data.extra = extra
   }

  //  定义一个用户手动上报的函数
   public sendTracker <T> (data:T) {
      this.reportTracker(data)
   }

  // 监听定义的所有事件函数
  private  targetKeyReport () {
     MouseEventList.forEach(ev => {
        window.addEventListener(ev, (e) => {
           const target = e.target as HTMLElement
           const targetKey = target.getAttribute('target-key')
           if(targetKey) {
              this.reportTracker({
                event: ev,
                targetKey
              })
           }
        })
     })
  }


   /** 定义一个路由函数循环监听事件 
    * @mouseEventList 监听事件的集合
    * @targetKey 与后台约定的监听key
    * @data 
   **/
   private captureEvens <T>(mouseEventList: string[], targetKey: string, data?:T) {
        mouseEventList.forEach(event => {
          window.addEventListener(event, () => {
             console.log(`监听到了正在发生${event}事件`)
             this.reportTracker({
                event,
                targetKey,
                data
             })
          })
        })
   }

   // 初始化执行监听路由变动事件
   private installTracker () {
        if(this.data.historyTracker) {
           this.captureEvens(['pushState', 'replaceState', 'popstate'], 'history-pv')
        }
        if(this.data.hashTracker) {
           this.captureEvens(['hashchange'], 'hash-pv')
        }
        if(this.data.domTracker) {
           this.targetKeyReport()
        }
        if (this.data.jsError) {
           this.jsError()
        }

   }

  // 定义一个错误集合并执行
  private jsError () {
     this.errorEvent()
     this.promiseReject()
  } 

  // 捕获js报错
  private errorEvent () {
    window.addEventListener('error', (event) => {
       this.reportTracker({
          event: 'error',
          targetKey: 'message',
          message: event.message
       })
     })
  }

  // 捕获promise 错误
  private promiseReject () {
    window.addEventListener('unhandledrejection', (event) => {
       event.promise.catch(error => {
           this.reportTracker({
             event: 'promise',
             targetKey: 'message',
             message: error
           })
       })
    })
  }

  // 用来上报
   private reportTracker <T>(data:T) {
      const params = Object.assign(this.data, data, {time: new Date().getTime()})  
      // 定义请求头的参数类型
      let headers = {
         type: 'application/x-www-form-urlencoded'
      }
      // 因为 navigator.sendBeacon 不能接受json参数 
      let blob = new Blob([JSON.stringify(params)], headers)
      // 调取接口 上报信息
       navigator.sendBeacon(this.data.requestUrl, blob)
   }


}
