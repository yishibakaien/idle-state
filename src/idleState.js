const events = [
  'scroll',
  'mousedown',
  'mousemove',
  'mousewheel',
  'keydown',
  'touchmove',
  'touchstart',
  'wheel',
]

const STATE_INITIAL = 0
const STATE_START = 1
const STATE_STOP = 2

class Idle {
  constructor(callback, timeout) {
    if (isNaN(timeout)) {
      timeout = 100000
    }

    this.loop = true
    this.await = 100
    this.taskQueue = []
    this.taskIndex = 0
    this.timer = null
  }

  start() {}

  stop() {}

  pause() {}

  resume() {}

  addTask(task) {
    if (typeof task !== 'function') {
      return
    }
    this.taskQueue.push(task)
  }

  _dispose() {
    if (this.state === STATE_INITIAL) {
      return this
    }

    this.state = STATE_INITIAL
    clearTimeout(this.timer)
    this.taskQueue = null
    this.timer = null

    return this
  }

  _runTask() {
    if (
      !this.taskQueue ||
      !this.taskQueue.length ||
      this.state !== STATE_INITIAL
    ) {
      return
    }

    if (this.taskIndex === this.taskQueue.length && !this.loop) {
      this._dispose()
      return
    }
  }

  _nextTask() {
    this.taskIndex++
  }
}

export default Idle
