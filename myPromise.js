class myPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error(`${executor} is not a function`)
    }
    this._status = 'pending'
    this._value = undefined
    this._onFulfilledCallback = []
    this._onRejectedCallback = []
    try {
      executor(this.resolve, this.reject)
    } catch(e) {
      reject(e)
    }
  }
  resolve(value) {
    if (this._status === 'pending') {
      this._status = 'fulfilled'
      this._value = value
    }
  }
  reject(err) {
    if (this._status === 'pending') {
      this._status = 'rejected'
      this._value = err
    }
  }
  then(onResolved, onRejected) {
    if (this._status === 'pending') {
      this._onFulfilledCallback.push(onResolved)
    }
  }
}