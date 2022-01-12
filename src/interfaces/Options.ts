
export default interface Options {
  target: HTMLElement

  tasks: Array<Function>

  timeout: number

  interval: number

  loop: boolean

  enableMousemove: boolean

  enableReqeustDetect: boolean

  events: Array<string>

  onPause(): void

  onResume(): void

  onDispose(): void
}