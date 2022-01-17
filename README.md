[English Doc](./README.md) | [中文文档](./README-CN.md)

# introduce

A library for detecting idle state of browser. None dependency, size of 4.7kb. With powerful APIs. -- inspired by `idle-timeout`.

# what I can do

Running some tasks while browser idling

# install

using npm or yarn

```shell
npm install idle-state -S
```

```shell
yarn add idle-state -S
```

using cdn

```html
<script src="https://xxx.xx.xx/idle-state.min.js"></script>
```

# usage

just pass a callback

```js
import idle from 'idle-state'

const foo = () => {
  console.log('do task foo.')
}
// just pass a callback, `foo` will be called while browser idling
idle(foo)
```

pass a task-array

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// tasks-array, `task1` & `task2` will be called while browser idling
idle([task1, task2])
```

config opitons or both callback & config options

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// with config
idle({
  tasks: [task1, task2],
})

// both callback & config options
// in this case task1 & task2 will be converted to an tasks-array [task1, task2]
idle(task1, { tasks: [task2] })
```

# document

The `idle` function has two arguments

- `callback` - can be a function or function-array
  - `[Function]` - considered a single task
  - `[Function-array]` - considered a tasks-array
- `options [Object]` - configuration of how task running
  - `target [Element | Element-Array]` - the `target` would be watched, which determines whether the state is idling
  - `tasks [Function-array]` - tasks-array
  - `timeout [Number]` - the duration after the browser enters the idle state, at which time the task begins to execute
  - `interval [Number]` - interval of task runing
  - `loop [Boolean]` - should task(s) runs loopy
  - `mousemoveDetect [Boolean]` - should detect mousemove event. Mousemove events are frequently triggered in the browser, so put it configurable
  - `reqeustDetect` [Boolean] - should detect requests(ajax or fetch) on browser
  - `events [EventName-array]` - name of events, which would be concated(merged) with default value (`scroll`, `keydown`, `touchmove`, `touchstart`, `click`)
  - `onPause [Function]` - called on tasks pause
  - `onResume [Function]` - called on tasks resume
  - `onDispose [Function]` - called on tasks dispose

# options default value

```js
const noop = () => {}

const defaultOptions = {
  target: document.body,
  tasks: [],
  timeout: 3000,
  interval: 1000,
  loop: false,
  mousemoveDetect: false,
  reqeustDetect: true,
  events: ['scroll', 'keydown', 'touchmove', 'touchstart', 'click'],
  onPause: noop,
  onResume: noop,
  onDispose: noop,
}
```

# methods

you can get an instance from `idle()` function

```js
import idle from 'idle-state'

const instance = idle(() => {})
```

`instance`

- `.pause(callback)` - pause tasks running
- `.resume(callback)` - resume paused tasks
- `.dispose(callback)` - dispose the resource & remove events handler
- `.push(task-function)` - push a task in current tasks-array
- `.timeout(time)` - set `options.timeout` the duration after the browser enters the idle state, at which time the task begins to execute (in milliseconds)
- `.interval(time)` - set `options.interval` the tasks running interval (in milliseconds)
- `.loop(boolean)` - set `options.loop` should the tasks runs loopy
- `.isIdle` - get current idle state, return a boolean value

> **the `callback` passed by `methods` ( such as `pause(callback)` ) has a higher priority than `options` ( such as `options.onPause` )**

`.pause(callback)`

```js
instnce.pause()

// with callback
instance.pause(() => console.log('task paused.'))
```

`.resume(callback)`

```js
instance.resume()

// with callback
instance.resume(() => console.log('paused task re-running.'))
```

`.dispose(callback)`

```js
instance.dispose()

// with callback
instance.dispose(() => console.log('tasks stoped.'))
```

`.push(task)`

```js
const task = () => console.log('I am a task.')
// task should be a function
instance.push(task)
```

`.timeout(time)`

```js
instance.timeout(2000)
```

`.interval(time)`

```js
instance.interval(2000)
```

`.loop(boolean)`

```js
instance.loop(true)
```

# get current idle state

```js
import idle from 'idle-state'

const instance = idle(() => {})

// you can get current state by
instance.isIdle // => get a Boolean value
```

it will get `false` while browser trigger event [`scroll`, `keydown`, `touchmove`, `touchstart`, `click`] by default, you can config `options.events`,
which will replace default `options.events`

# demo

```shell
npm run dev
```

# build

```shell
npm run build
```
