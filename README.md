# introduce

A library for detecting idle state of browser. None dependency, size of 4kb. With powerful APIs. -- inspired by `idle-timeout`.

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

just a callback, it will be called while browser idling

```js
import idle from 'idle-state'

// just a callback
idle(() => {
  console.log('do task.')
})
```

pass a task-array

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// tasks-array
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
idle(task1, { tasks: [task2] })
// actually task1 & task2 will be converted to an tasks-array [task1, task2]
```

# document

The `idle` function tasks two arguments

- `callback` - can be a function or function-array
  - `[Function]` - considered a single task
  - `[Function-array]` - considered a tasks-array
- `options [Object]` - configuration of how task running
  - `target [Element]` - the `target` would be watched, which determines whether the state is idling
  - `tasks [Function-array]` - tasks-array
  - `timeout [Number]` - the duration after the browser enters the idle state, at which time the task begins to execute
  - `interval [Number]` - interval of task runing
  - `loop [Boolean]` - should task(s) runs loopy
  - `enableMousemove [Boolean]` - should detect mousemove event. Mousemove events are frequently triggered in the browser, so put it configurable
  - `events [EventName-array]` - name of events, which would be concated with default value
  - `onPause [Function]` - called on tasks pause
  - `onResume` - called on tasks resume
  - `onDispose` - called on tasks dispose

# options default value

```js
const noop = () => {}

const defaultOptions = {
  target: document.body,
  tasks: [],
  timeout: 3000,
  interval: 1000,
  loop: false,
  enableMousemove: false,
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

> **the `callback` passed by `methods` ( such as `pause(callback)` ) has a higher priority than `options` ( such as `options.onPause` )**

`pause(callback)`

```js
instance.pause(() => console.log('task paused.'))
// or just pause
instnce.pause()
```

`resume(callback)`

```js
instance.resume(() => console.log('paused task re-running.'))
// or just resume
instance.resume()
```

`dispose(callback)`

```js
instance.dispose(() => console.log('tasks stoped.'))
// or just dispose
instance.dispose()
```

`push(task)`

```js
const task = () => console.log('I am a task.')
// task should be a function
instance.push(task)
```

`timeout(time)`

```js
instance.timeout(2000)
```

`loop(boolean)`

```js
instance.loop(true)
```

# get current idle state

```js
import idle from 'idle-state'

const instance = idle(() => {})

// you can get current state by
console.log(instance.isIdle) // => get a Boolean value
```

# demo

```shell
npm run dev
```

# build

```shell
npm run build
```
