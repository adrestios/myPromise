class myPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error(`${executor} is not a function`)
    }
    self = this
    self._status = 'pending'
    self._value = undefined
    self._onFulfilledCallback = []
    self._onRejectedCallback = []
    self.resolve = this._resolve.bind(this)
    self.reject = this._reject.bind(this)
    try {
      executor(this._resolve, this._reject)
    } catch(e) {
      this.reject(e)
    }
  }
  _resolve(value) {
    setTimeout(() => {debugger
      if (self._status === 'pending') {
        self._status = 'fulfilled'
        self._value = value
      }
      for(var i = 0; i < self._onFulfilledCallback.length; i++) {
        self._onFulfilledCallback[i](value)
      }
    })
  }
  _reject(err) {
    setTimeout(() => {
      if (self._status === 'pending') {
        self._status = 'rejected'
        self._value = err
      }
      for (var i = 0; i < self._onRejectedCallback.length; i++) {
        self._onRejectedCallback[i](reason)
      }
    })
  }
  //resolvePromise(promise, x, resolve, reject) {
  //  if (promise === x) {
  //    throw new TypeError('promise and x can not refer to the same object')
  //  }
  //  if (x instanceof myPromise) {
  //    if (x.status === 'pending') {
  //      x.then(v=> {
  //        resolvePromise(promise, v, resolve, reject)
  //      }, )
  //    }
  //  }
  //  if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
  //    try {
  //    let then = x.then
  //      if (typeof then = 'function') {
  //        then.call(x, )
  //      }
  //    } catch(e) {
  //      reject(e)
  //    }
  //  }
  //}
  then(onResolved, onRejected) {debugger
    var self = this
    onResolved = typeof onResolved === 'function' ? onResolved : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r}
    if (self._status === 'fulfilled') {
      return new myPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            var x = onResolved(self._value)
            if (x instanceof myPromise) {
              x.then(resolve, reject)
            }
            resolve(x)
          } catch(e) {
            reject(e)
          }
        })
      })
    }
    if (self._status === 'rejected') {
      return new myPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            var x = onRejected(self._value)
            if (x instanceof myPromise) {
              x.then(resolve, reject)
            }
          } catch(e) {
            reject(e)
          }
        })
      })
    }
    if (self._status === 'pending') {
      return new myPromise((resolve, reject) => {
        self._onFulfilledCallback.push((value) => {
          try {
            var pv = onResolved(self._value)
            if (pv instanceof myPromise) {
              pv.then(resolve, reject)
            }
          } catch(e) {
            reject(e)
          }
        })
        self._onRejectedCallback.push((err) => {
          try {
            var pv = onRejected(self._value)
            if (pv instanceof myPromise) {
              pv.then(resolve, reject)
            }
          } catch(e) {
            reject(e)
          }
        })
      })
    }
  }
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
  finally(onFinally) {
    return this.then(value => {
      setTimeout(onFinally)
      return value
    }, reason => {
      setTimeout(onFinally)
      throw reason
    }) 
  }
  static resolve(value) {
    if (value instanceof myPromise) {
      return value
    }
    return new myPromise(resolve => resolve(value))
  }
  static reject(value) {
    if (value instanceof myPromise) {
      return value
    }
    return new myPromise((resolve, reject) => reject(value))
  }
  static all(list) {
    return new myPromise((resolve, reject) => {
      let listLength = list.length
      let resolvedValue = []
      for (let [index, value] of list.entries()) {
        this.resolve(value).then(value => {
          resolvedValue[index] = value
        if (index === listLength - 1) {
          resolve(resolvedValue)
        }
        }, e => {
          reject(e)
        })
      }
    })
  }
  static race(list) {
    return new myPromise((resolve, reject) => {
      for (let value of list) {
        this.resolve(value).then(value => {
          resolve(value)
        }, e => {
          reject(e)
        })
      }
    })
  }
}