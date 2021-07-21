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
  constructor(tasks, timeout) {
    if (isNaN(timeout)) {
      timeout = 100000
    }

    this.state = STATE_INITIAL
    this.loop = true
    this.await = 100
    this.taskQueue = tasks || []
    this.taskIndex = 0
    this.timer = null
  }

  start() {
    if (this.state === STATE_START) {
      return this
    }
    if (!this.taskQueue || !this.taskQueue.length) {
      return this
    }
    this.state = STATE_START

    this._runTask()
    return this
  }

  stop() {
    this._dispose()
  }

  pause() {
    if (this.state === STATE_START) {
      this.state = STATE_STOP
    }
    return this
  }

  resume() {
    if (this.state === STATE_STOP) {
      this.state = STATE_START
    }
    return this
  }

  addTask(task) {
    if (typeof task !== 'function') {
      return
    }
    this.taskQueue.push(task)
    return this
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
      this.state !== STATE_START
    ) {
      return
    }

    if (this.taskIndex === this.taskQueue.length) {
      this._dispose()
      return
    }

    const task = this.taskQueue[this.taskIndex]
    this._syncTask(task)
  }

  /**
   * consider all tasks as sync
   */
  _syncTask(task) {
    task()
    this._nextTask()
  }

  _asyncTask(task) {}

  _nextTask(task) {
    this.taskIndex++

    const wait = this.wait || 0

    if (wait) {
      setTimeout(this._runTask, wait)
    } else {
      this._runTask()
    }
  }
}

export default Idle
