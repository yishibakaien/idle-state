export const isFunction = (fn) => typeof fn === 'function'

export const isObject = (obj) =>
  Object.prototype.toString.call(obj) === '[object Object]'

export const isArray = (obj) =>
  Object.prototype.toString.call(obj) === '[object Array]'

// unique array item
export const uniqueArray = (arr) => {
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

export const next = (callback) => isFunction(callback) && callback()

export const noop = () => {}
