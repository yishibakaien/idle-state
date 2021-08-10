import {
  isArray,
  isFunction,
  isObject,
  uniqueArray,
  next,
  noop,
} from './utils.js'

const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

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

  #isIdle = false
  #timer = null
  #status = STATUS_START
  #index = 0

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
    if (isArray(events)) {
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

    this._start()
  }

  // controller of running tasks
  _run() {
    const { tasks, loop } = this.options

    if (this.#status !== STATUS_START) {
      return
    }

    if (!tasks.length) {
      this.dispose()
    }

    const isLastTask = this.#index === tasks.length - 1

    const task = tasks[this.#index]

    next(task)

    if (loop && isLastTask) {
      this.#index = 0
      this._start()
    }

    if (!loop && isLastTask) {
      this.dispose()
    }

    if (!isLastTask) {
      this.#index++
      this._start()
    }
  }

  _clearTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  // start running tasks
  _start() {
    this._clearTimer()

    const { interval, timeout } = this.options

    const time = this.#isIdle ? interval : timeout

    this.#timer = setTimeout(() => {
      this.#isIdle = true
      this._run()
    }, time)
  }

  eventHandler() {
    this.#isIdle = false
    this._start()
  }

  /**
   * pause running tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  pause(cb) {
    if (this.#status === STATUS_START) {
      this.#status = STATUS_PAUSE
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
    if (this.#status === STATUS_PAUSE) {
      this.#status = STATUS_START
      const callback = cb || this.options.onResume
      next(callback)
      this._start()
    }
  }

  // dispose the resource & remove events handler
  dispose(cb) {
    this.#status = STATUS_STOP
    this._clearTimer()
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

  // set tasks running interval
  interval(interval) {
    this.options.interval = interval
  }

  // set loop option
  loop(value) {
    this.options.loop = value
  }

  // get current idle status
  isIdle() {
    return this.#isIdle
  }
}

export default function (...args) {
  return new Detector(...args)
}
