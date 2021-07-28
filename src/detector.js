const events = [
  'scroll',
  'mousedown',
  // 'mousemove',
  'mousewheel',
  'keydown',
  'touchmove',
  'touchstart',
  'wheel',
  'click',
]

const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

const isFunction = (fn) => typeof fn === 'function'
const doCallback = (callback) => isFunction(callback) && callback()
const noop = () => {}

class Detector {
  timer = null
  status = STATUS_START
  currentTaskIndex = 0

  constructor(task, options = {}) {
    this.options = {
      target: document.body,
      timeout: 1000,
      loop: false,
      enableMousemove: false,
      tasks: [],
      onStop: noop,
      onPause: noop,
      onResume: noop,
      ...options,
    }

    if (isFunction(task)) {
      this.options.tasks = [task].concat(this.options.tasks)
    }

    // mousemove events are frequently triggered in the broswer
    if (this.options.enableMousemove) {
      events.push('mousemove')
    }

    const element = this.options.target
    this.eventHandler = this.start.bind(this)
    events.forEach((event) => {
      element.addEventListener(event, this.eventHandler)
    })

    this.start()
  }

  run() {
    const { tasks, loop } = this.options
    // console.warn('run: ', `isIdle--${this.isIdle}, status--${this.status}`)
    if (this.status !== STATUS_START) {
      return
    }

    if (!tasks.length) {
      this.dispose()
    }

    const isLastTask = this.currentTaskIndex === tasks.length - 1

    const task = tasks[this.currentTaskIndex]

    task()

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

  pause(cb) {
    if (this.status === STATUS_START) {
      const callback = cb || this.options.onPause
      this.status = STATUS_PAUSE
      doCallback(callback)
    }
  }

  resume(cb) {
    if (this.status === STATUS_PAUSE) {
      this.status = STATUS_START
      const callback = cb || this.options.onResume
      doCallback(callback)
      this.start()
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  start() {
    this.clearTimer()
    // console.error(`start: ${++i}, isIdle--${this.isIdle}`)
    this.timer = setTimeout(() => {
      this.run()
    }, this.options.timeout)
  }

  dispose(cb) {
    this.status = STATUS_STOP
    this.clearTimer()
    const element = this.options.target
    events.forEach((evt) => {
      element.removeEventListener(evt, this.eventHandler)
    })
    const callback = cb || this.options.onStop
    doCallback(callback)
  }

  stop(...args) {
    this.dispose.apply(this, args)
  }

  destroy(...args) {
    this.dispose.apply(this, args)
  }

  timeout(timeout) {
    this.options.timeout = timeout
  }

  loop(value) {
    this.options.loop = value
  }
}

export default function (...args) {
  return new Detector(...args)
}
