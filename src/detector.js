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

const STATUS_INITIAL = 0
const STATUS_START = 1
const STATUS_STOP = 2

let i = 0

export default class Detector {
  static isIdle = false
  static timer = null
  static status = STATUS_INITIAL

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
    events.forEach((event) => {
      element.addEventListener(event, this.start.bind(this))
    })

    this.start()
  }

  run() {
    const { callback, loop } = this.options
    if (this.isIdle && this.status !== STATUS_STOP) {
      callback()
      if (loop) {
        this.start()
      }
    }
  }

  pause() {
    this.status = STATUS_STOP
  }

  resume() {
    this.status = STATUS_START
    this.start()
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  start() {
    console.log(++i)
    this.isIdle = false
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.isIdle = true
      this.run()
    }, this.options.timeout)
  }

  dispose(fn) {
    this.status = STATUS_STOP
    this.clearTimer()
    const element = this.options.target
    events.forEach((evt) => {
      element.removeEventListener(evt, this.start)
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
