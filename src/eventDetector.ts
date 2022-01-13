
import { isNodeElement } from './utils'

export default class EventDetector {

  eventHandler: any
  callback: () => void
  events: string[]
  target: HTMLElement[]

  constructor(
    target: any,
    events: string[],
    callback: () => void
  ) {
    
    this.target = isNodeElement(target) ? [target] : target
    this.events = events

    this.callback = callback.bind(this)
    this.eventHandler = this.handler.bind(this)

    this.init()

  }

  init() {
    this.events.forEach((evt: string) => {
      this.target.forEach((ele) => {
        ele.addEventListener(evt, this.eventHandler)
      })
    })
  }

  handler() {
    this.callback()
  }

  dispose() {
    this.events.forEach((evt: string) => {
      this.target.forEach((ele) => {
        ele.removeEventListener(evt, this.eventHandler)
      })
    })
  }
}
