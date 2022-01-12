import {
  isArray,
  isFunction,
  isObject,
  uniqueArray,
  next,
  noop,
} from './utils'

import OptionsInterface from './interfaces/Options'
import fetchDetector  from './fetchDetector'

const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

// private props
const _index = Symbol('index')

// private api
const _start = Symbol('start')
const _run = Symbol('run')
const _clearTimer = Symbol('clearTimer')
const _eventHandler = Symbol('eventHandler')

export default class Detector {
  protected events: string[] = [
    'scroll',
    'keydown',
    'touchmove',
    'touchstart',
    'click',
  ]

  protected options: OptionsInterface
  protected isIdle: boolean = false
  protected timer: ReturnType<typeof setTimeout> | null = null
  private status: number = STATUS_START
  private [_index]: number = 0
  protected _eventHandler = this[_eventHandler].bind(this)

  constructor(task: any , options?: OptionsInterface) {
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
      this.events = this.events.concat(events)
    }

    this.options = {
      target: document.body,
      timeout: 3000,
      interval: 1000,
      loop: false,
      enableMousemove: false,
      enableReqeustDetect: true,
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
      this.events.push('mousemove')
    }

    if (this.options.enableMousemove) {
      fetchDetector((isFetchIdle) => {
        isFetchIdle && this._eventHandler()
      })
    }

    // remove repeat event
    this.events = uniqueArray(this.events)

    const element = this.options.target

    this.events.forEach((event): void => {
      element.addEventListener(event, this._eventHandler)
    })
  
    this[_start]()
  }

  // controller of running tasks
  private [_run](): void {
    const { tasks, loop } = this.options

    if (this.status !== STATUS_START) {
      return
    }

    if (!tasks.length) {
      this.dispose()
    }

    const isLastTask = this[_index] === tasks.length - 1

    const task = tasks[this[_index]]

    next(task)

    if (loop && isLastTask) {
      this[_index] = 0
      this[_start]()
    }

    if (!loop && isLastTask) {
      this.dispose()
    }

    if (!isLastTask) {
      this[_index]++
      this[_start]()
    }
  }

  private [_clearTimer](): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  // start running tasks
  private [_start](): void {
    this[_clearTimer]()

    const { interval, timeout } = this.options

    const time = this.isIdle ? interval : timeout

    this.timer = setTimeout(() => {
      this.isIdle = true
      this[_run]()
    }, time)
  }

  private [_eventHandler](): void {
    this.isIdle = false
    this[_start]()
  }

  /**
   * pause running tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  pause(cb?: () => void) {
    if (this.status === STATUS_START) {
      this.status = STATUS_PAUSE
      const callback = cb || this.options.onPause
      next(callback)
      return this
    }
  }

  /**
   * resume paused tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  resume(cb?: () => void) {
    if (this.status === STATUS_PAUSE) {
      this.status = STATUS_START
      const callback = cb || this.options.onResume
      next(callback)
      this[_start]()
      return this
    }
  }

  // dispose the resource & remove events handler
  dispose(cb?: () => void): void {
    this.status = STATUS_STOP
    this[_clearTimer]()
    const element = this.options.target
    this.events.forEach((evt) => {
      element.removeEventListener(evt, this._eventHandler)
    })
    const callback = cb || this.options.onDispose
    next(callback)
  }

  // push a task
  push(task: () => void) {
    if (isFunction(task)) {
      this.options.tasks.push(task)
    }
    return this
  }

  // set tasks running timeout
  timeout(timeout: number) {
    this.options.timeout = timeout
    return this
  }

  // set tasks running interval
  interval(interval: number) {
    this.options.interval = interval
    return this
  }

  // set loop option
  loop(value: boolean) {
    this.options.loop = value
    return this
  }
}
