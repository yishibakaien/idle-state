const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

const isFunction = (fn) => typeof fn === 'function'

const isObject = (obj) =>
  Object.prototype.toString.call(obj) === '[object Object]'

const isArray = (obj) =>
  Object.prototype.toString.call(obj) === '[object Array]'

const uniqueArray = (arr) => {
  const ret = []
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) === i) {
      ret.push(arr[i])
    }
  }
  return ret
}

const next = (callback) => isFunction(callback) && callback()

const noop = () => {}

class Detector {
  static events = [
    'scroll',
    'keydown',
    'touchmove',
    'touchstart',
    'click',
    // 'mousedown',
    // 'wheel',
    // 'mousewheel',
    // 'mousemove',
  ]

  isIdle = false
  timer = null
  status = STATUS_START
  currentTaskIndex = 0

  eventHandler = this.eventHandler.bind(this)

  constructor(task, options = {}) {
    if (isObject(task)) {
      Object.assign(options, task)
    }

    if (isArray(task)) {
      if (isArray(options.tasks)) {
        options.tasks = task.concat(options.tasks)
      } else {
        options.tasks = task
      }
    }

    // transform all tasks to a task array
    if (isFunction(task)) {
      if (isArray(options.tasks)) {
        options.tasks = [task].concat(options.tasks)
      } else {
        options.tasks = [task]
      }
    }

    const { events } = options
    if (isArray(events) && events) {
      Detector.events = Detector.events.concat(events)
    }

    this.options = {
      target: document.body,
      timeout: 3000,
      interval: 1000,
      loop: false,
      enableMousemove: false,
      tasks: [],
      events: [],
      onDispose: noop,
      onPause: noop,
      onResume: noop,
      ...options,
    }

    /**
     * mousemove events are frequently triggered in the browser,
     * so put it configurable
     */
    if (this.options.enableMousemove) {
      Detector.events.push('mousemove')
    }

    // remove repeat event
    Detector.events = uniqueArray(Detector.events)

    const element = this.options.target

    Detector.events.forEach((event) => {
      element.addEventListener(event, this.eventHandler)
    })

    this.start()
  }

  // controller of running tasks
  run() {
    const { tasks, loop } = this.options

    if (this.status !== STATUS_START) {
      return
    }

    if (!tasks.length) {
      this.dispose()
    }

    const isLastTask = this.currentTaskIndex === tasks.length - 1

    const task = tasks[this.currentTaskIndex]

    next(task)

    if (loop && isLastTask) {
      this.currentTaskIndex = 0
      this.start()
    }

    if (!loop && isLastTask) {
      this.dispose()
    }

    if (!isLastTask) {
      this.currentTaskIndex++
      this.start()
    }
  }

  /**
   * pause running tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  pause(cb) {
    if (this.status === STATUS_START) {
      this.status = STATUS_PAUSE
      const callback = cb || this.options.onPause
      next(callback)
    }
  }

  /**
   * resume paused tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  resume(cb) {
    if (this.status === STATUS_PAUSE) {
      this.status = STATUS_START
      const callback = cb || this.options.onResume
      next(callback)
      this.start()
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  eventHandler() {
    this.isIdle = false
    this.start()
  }

  // start running tasks
  start() {
    this.clearTimer()

    const { interval, timeout } = this.options

    const time = this.isIdle ? interval : timeout

    this.timer = setTimeout(() => {
      this.isIdle = true
      this.run()
    }, time)
  }

  // dispose the resource & remove events handler
  dispose(cb) {
    this.status = STATUS_STOP
    this.clearTimer()
    const element = this.options.target
    Detector.events.forEach((evt) => {
      element.removeEventListener(evt, this.eventHandler)
    })
    const callback = cb || this.options.onDispose
    next(callback)
  }

  // convenience options for `dispose` API
  stop(...args) {
    this.dispose.apply(this, args)
  }

  // convenience options for `dispose` API
  destroy(...args) {
    this.dispose.apply(this, args)
  }

  // push a task
  push(task) {
    if (isFunction(task)) {
      this.options.tasks.push(task)
    }
  }

  // set tasks running timeout
  timeout(timeout) {
    this.options.timeout = timeout
  }

  // set task running interval
  interval(interval) {
    this.options.interval = interval
  }

  // set loop option
  loop(value) {
    this.options.loop = value
  }
}

export default function (...args) {
  return new Detector(...args)
}
