# introduce

A library for detecting idle state of browser. None dependency, size of 4kb. With powerful APIs.

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

// tasks array
idle([task1, task2])
```

both callback & config options

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// with config
idle({
  tasks: [task1, task2],
})

// both callback & config
idle(task1, { tasks: [task2] })
// actually task1 & task2 will be converted to an task-array [task1, task2]
```

# document

The `idle` function tasks two arguments

- `callback` -
  - `[Function]` - Considered a single task
  - `[Function-array]` - Considered a tasks-array
- `options [Object]` - Configuration of how task running
  - `target [Element]` - To watch this `target` is in idle state
  - `timeout [Number]` - Interval of task running
  - `loop [Boolean]` - Should task(s) running loopy
  - `enableMousemove [Boolean]` - Should detect mousemove event
  - `tasks [Function-array]` - Tasks-array

# methods

you can get an instance from `idle()` function

```js
import idle from 'idle-state'

const instance = idle(() => console.log('do task.'))
```

`pause(callback)` - pause tasks running

```js
instance.pause(() => console.log('task paused.'))
```

`resume(callback)` - resume paused tasks

```js
instance.resume(() => console.log('paused task re-running.'))
```

`dispose(callback)` - dispose the resource & remove events handler

```js
instance.dispose('tasks stoped')
```

`push(task)` - push a task in current tasks array

```js
const task = () => console.log('I am a task.')
instance.push(task)
```

`timeout(time)` - set the timeout (in milliseconds)

```js
instance.timeout(2000)
```

`loop(boolean)` - set taks should be looped

```js
instance.loop(false)
```

# options default value

- `options`
  - `target` - `document.body`
  - `timeout` - `1000`
  - `loop` - `true`
  - `tasks` - `[]`
  - `enableMousemove` - `false`
  - `onStop` - `noop`
  - `onPause` - `noop`
  - `onResume` - `noop`

callback passed by `methods` has a higher priority than options

```js
const noop = () => {}

const defaultOptions = {
  target: document.body,
  timeout: 1000,
  loop: false,
  enableMousemove: false,
  tasks: [],
  onStop: noop,
  onPause: noop,
  onResume: noop,
}
```
