const events = [
  'scroll',
  'mousedown',
  'mousemove',
  'mousewheel',
  'keydown',
  'touchmove',
  'touchstart',
  'wheel',
  'click',
]

// const STATUS_INITIAL = 0
const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

let i = 0

export default class Detector {
  timer = null
  isIdle = false
  status = STATUS_START

  constructor(callback, options = {}) {
    if (typeof callback === 'function') {
      options.callback = callback
    }

    this.options = {
      target: document.body,
      timeout: 1000,
      loop: false,
      ...options,
    }

    const element = this.options.target
    this.eventHandler = this.start.bind(this)
    events.forEach((event) => {
      element.addEventListener(event, this.eventHandler)
    })

    this.start()
  }

  run() {
    const { callback, loop } = this.options
    console.warn('run: ', `isIdle--${this.isIdle}, status--${this.status}`)
    if (this.status === STATUS_START) {
      callback()
      if (loop) {
        this.start()
      }
    }
  }

  pause() {
    this.status = STATUS_PAUSE
  }

  resume() {
    if (this.status === STATUS_PAUSE) {
      this.status = STATUS_START
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
    console.error(`start: ${++i}, isIdle--${this.isIdle}`)
    this.timer = setTimeout(() => {
      this.run()
    }, this.options.timeout)
  }

  dispose(fn) {
    this.status = STATUS_STOP
    this.clearTimer()
    const element = this.options.target
    events.forEach((evt) => {
      element.removeEventListener(evt, this.eventHandler)
    })
    typeof fn === 'function' && fn()
  }

  stop(...args) {
    this.dispose.apply(this, args)
  }

  destroy(...args) {
    this.dispose.apply(this, args)
  }

  loop(value) {
    this.options.loop = value
  }
}
