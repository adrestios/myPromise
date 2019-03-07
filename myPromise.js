class myPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error(`${executor} is not a function`)
    }
    this._status = 'pending'
    this._value = undefined
    this._onFulfilledCallback = []
    this._onRejectedCallback = []
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)
    try {
      executor(this.resolve, this.reject)
    } catch(e) {
      this.reject(e)
    }
  }
  resolve(value) {
    if (this._status === 'pending') {
      this._status = 'fulfilled'
      this._value = value
    }
    for(var i = 0; i < this._onFulfilledCallback.length; i++) {
      this._onFulfilledCallback[i](value)
    }
  }
  reject(err) {
    if (this._status === 'pending') {
      this._status = 'rejected'
      this._value = err
    }
    for (var i = 0; i < this._onRejectedCallback.length; i++) {
      this._onRejectedCallback[i](reason)
    }
  }
  then(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r}
    if (this._status === 'fulfilled') {
      return new myPromise((resolve, reject) => {
        try {
          var pc = onResolved(this._value)
          if (pc instanceof myPromise) {
            pc.then(resolve, reject)
          }
          resolve(pc)
          console.log(resolve);
        } catch(e) {
          reject(e)
        }
      })
    }
    if (this._status === 'rejected') {
      return new myPromise((resolve, reject) => {
        try {
          var pc = onRejected(this._value)
          if (pc instanceof myPromise) {
            pc.then(resolve, reject)
          }
        } catch(e) {
          reject(e)
        }
      })
    }
    if (this._status === 'pending') {
      return new myPromise((resolve, reject) => {
        this._onFulfilledCallback.push((value) => {
          try {
            var pv = onResolved(this._value)
            if (pv instanceof myPromise) {
              pv.then(resolve, reject)
            }
          } catch(e) {
            reject(e)
          }
        })
        this._onRejectedCallback.push((err) => {
          try {
            var pv = onRejected(this)
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
}