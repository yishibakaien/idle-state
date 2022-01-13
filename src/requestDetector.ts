
import RequestStroeInterface from './interfaces/RequestStore'
import CallbackInterface from './interfaces/Callback'

const STATUS_XHR_DONE = 4

const fetchDetector = (cb: CallbackInterface) => {

  let count = 0

  const store: RequestStroeInterface = {
    count
  }
  
  Object.defineProperty(store, 'count', {
    set(val: number) {
      count = val
      cb(count === 0)
    },
    get(): number {
      return count
    }
  })

  const oldOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function() {
    store.count++
    this.onreadystatechange = function() {
      if (this.readyState === STATUS_XHR_DONE) {
        store.count--
      }
    }
    oldOpen.apply(this, arguments)
  }

  const oldFetch = window.fetch
  
  window.fetch = function() {
    store.count++
    const args = arguments
    return new Promise((resolve, reject) => {
      oldFetch.apply(this, args).then((res: any) => {
        store.count--
        resolve(res)
      }).catch((err: any) => {
        store.count--
        reject(err)
      })
    })
  }
}

export default (cb: CallbackInterface): void => {
  fetchDetector(cb)
}
