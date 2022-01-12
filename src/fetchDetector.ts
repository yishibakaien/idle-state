
interface Stroe {
  count: number
}

interface callback {
  (bol: boolean): void
}

const fetchDetector = (cb: callback) => {

  let count = 0

  const store: Stroe = {
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

  XMLHttpRequest.prototype.open = function () {
    store.count++
    this.addEventListener(
      'readystatechange',
      () => {
        if (this.readyState === 4) {
          store.count--
        }
      },
      false
    )
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

export default (cb: callback): void => {
  fetchDetector(cb)
}
