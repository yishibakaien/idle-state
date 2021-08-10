import {
  isArray,
  isFunction,
  isObject,
  uniqueArray,
  next,
  noop,
} from './utils'

import OptionsInterface from './interfaces/Options'

const STATUS_START = 1
const STATUS_PAUSE = 2
const STATUS_STOP = 3

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
  private index: number = 0
  protected _eventHandler = this.eventHandler.bind(this)

  public constructor(task: any , options?: OptionsInterface) {
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

    // remove repeat event
    this.events = uniqueArray(this.events)

    const element = this.options.target

    this.events.forEach((event): void => {
      element.addEventListener(event, this._eventHandler)
    })

    this.start()
  }

  // controller of running tasks
  protected run(): void {
    const { tasks, loop } = this.options

    if (this.status !== STATUS_START) {
      return
    }

    if (!tasks.length) {
      this.dispose()
    }

    const isLastTask = this.index === tasks.length - 1

    const task = tasks[this.index]

    next(task)

    if (loop && isLastTask) {
      this.index = 0
      this.start()
    }

    if (!loop && isLastTask) {
      this.dispose()
    }

    if (!isLastTask) {
      this.index++
      this.start()
    }
  }

  protected clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  // start running tasks
  protected start(): void {
    this.clearTimer()

    const { interval, timeout } = this.options

    const time = this.isIdle ? interval : timeout

    this.timer = setTimeout(() => {
      this.isIdle = true
      this.run()
    }, time)
  }

  protected eventHandler(): void {
    this.isIdle = false
    this.start()
  }

  /**
   * pause running tasks
   * callback passed by this has a higher priority than options
   * @param {Function} cb
   */
  public pause(cb?: ()=> void) {
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
  public resume(cb?: ()=> void) {
    if (this.status === STATUS_PAUSE) {
      this.status = STATUS_START
      const callback = cb || this.options.onResume
      next(callback)
      this.start()
    }
  }

  // dispose the resource & remove events handler
  public dispose(cb?: ()=> void) {
    this.status = STATUS_STOP
    this.clearTimer()
    const element = this.options.target
    this.events.forEach((evt) => {
      element.removeEventListener(evt, this._eventHandler)
    })
    const callback = cb || this.options.onDispose
    next(callback)
  }

  // push a task
  public push(task: ()=> void) {
    if (isFunction(task)) {
      this.options.tasks.push(task)
    }
  }

  // set tasks running timeout
  public timeout(timeout: number) {
    this.options.timeout = timeout
  }

  // set tasks running interval
  public interval(interval: number) {
    this.options.interval = interval
  }

  // set loop option
  public loop(value: boolean) {
    this.options.loop = value
  }
}
