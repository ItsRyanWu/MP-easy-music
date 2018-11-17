export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export class Event {
    constructor(){
        // 初始化事件调度中心
        this._eventCenter = {}
    }
    /**
     *
     * @param {String} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback, context){
        // 获得该事件的 callback 数组，如果不存在自动创建并向该事件分类 push callbacks 与 context
        (this._eventCenter[eventName] = this._eventCenter[eventName] || []).push({callback, context})
    }
    /**
     * 
     * @param {String} eventName 
     * @param {*} props 
     */
    emit(eventName, ...props){
        // 对该事件类的 callback 执行并带入参数
        (this._eventCenter[eventName] = this._eventCenter[eventName] || []).forEach((item)=>{
            item.callback.apply(item.context, props)
        })
    }
    /**
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    remove(eventName, ...callbackTrash){
        // 如果不传任何参数重置整个事件集则初始化整个 eventCenter
        if(arguments.length === 0){
            this._eventCenter = {}
            return
        }
        // 如果不传入特定 callback 则删除整个 event 类
        if(arguments.length === 1){
            delete this._eventCenter[eventName]
            return
        }
        // 如果传入一个不存在的事件名则提前结束
        if(!this._eventCenter[eventName]) return
        // 删除指定的 callback
        let callbacksInThisEvent = this._eventCenter[eventName];
        for (let itemToDelete of callbackTrash){
            for (let i in callbacksInThisEvent){
                if (itemToDelete === callbacksInThisEvent[i].callback) {
                    callbacksInThisEvent.splice(i, 1)
                    break
                }
            }
        }
    }
}