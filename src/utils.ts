export const isFunction = (fn: () => void) => typeof fn === 'function'

export const isObject = (obj?: any) =>
  Object.prototype.toString.call(obj) === '[object Object]'

export const isArray = (obj?: any) =>
  Object.prototype.toString.call(obj) === '[object Array]'

// unique array item
export const uniqueArray = (arr?: any) => {
  if (!isArray(arr)) {
    return []
  }

  const ret = []
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) === i) {
      ret.push(arr[i])
    }
  }
  return ret
}

export const next = (callback: any) => isFunction(callback) && callback()

export const noop = () => {}
