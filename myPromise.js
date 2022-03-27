const STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

let i = 0
class myPromise {
  constructor(executor) {
    this.status = STATUS.PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
    this.i = ++i

    const resolve = (v) => {
      if(this.status === STATUS.PENDING) {
        this.value = v;
        this.status = STATUS.FULFILLED;

        this.resolveCallbacks.forEach(fn => fn());
      }
    }

    const reject = (r) => {
      if(this.status === STATUS.PENDING) {
        this.reason = r;
        this.status = STATUS.REJECTED;

        this.rejectCallbacks.forEach(fn => fn());
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onResolved, onRejected) {
    const _onResolved = typeof onResolved === 'function' ? onResolved : value => value;
    const _onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    const promise2 = new myPromise((resolve, reject) => {
      if(this.status === STATUS.REJECTED) {
        setTimeout(() => {
          try {
            const reason = _onRejected(this.reason);
            resolvePromise(promise2, reason, resolve, reject);
          } catch (error) {
            reject(error);
          } 
        });
      };
      if(this.status === STATUS.FULFILLED) {
        setTimeout(() => {
          try {
            const value = _onResolved(this.value)
            resolvePromise(promise2, value, resolve, reject);
          } catch (error) {
            reject(error);
          } 
        });
      }
      if(this.status === STATUS.PENDING) {
        this.resolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              const value = _onResolved(this.value)
              resolvePromise(promise2, value, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.rejectCallbacks.push(() => {
          setTimeout(() => {
            try {
              const reason = _onRejected(this.reason);
              resolvePromise(promise2, reason, resolve, reject);
            } catch (error) {
              reject(error);
            } 
          });
        })
      }
    });
    return promise2;
  }

  catch(reject) {
    return this.then(null, reject);
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if(promise === x) {
    reject(new TypeError('chaining xxx'))
  }
  let called;
  if((typeof x === 'object' && x !== null) || (typeof x === 'function')) {
    try {
      const then = x.then;
      if(typeof then === 'function') {
        then.call(x, y => {
          if(!called) {
            called = true;
            resolvePromise(promise, y, resolve, reject);
          }
        }, r => {
          if(!called) {
            called = true;
            reject(r);
          }
        })
      } else {
        resolve(x);
      }
      
    } catch (error) {
      if(!called) {
        called = true;
        reject(error);
      }
    }
  } else {
    resolve(x);
  }
}

myPromise.defer = myPromise.deferred = function () {
  let dfd = {};
  dfd.promise = new myPromise((resolve,reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
  })
  return dfd;
}

module.exports = myPromise;