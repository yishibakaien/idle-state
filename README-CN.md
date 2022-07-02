[English doc](./README.md) | [中文文档](./README-CN.md)

# 介绍

探测浏览器是否处于空闲状态，0 依赖，4.7kb 大小，强大的 API，灵感来源于 `idle-timeout` 库。

# 我能做什么

- 探测浏览器是否处于空闲中（无网络请求发起、无用户触发 DOM 事件），并在浏览器空闲时执行一系列任务
- 自动暂停/重启任务（队列）

# 安装

通过 npm 或 yarn 安装

```shell
npm install idle-state -S
```

```shell
yarn add idle-state -S
```

通过 `<script>` 标签直接引用

> 您可以在 `/dist/idle-state.min.js` 目录直接下载

```html
<script src="https://xxx.xx.xx/idle-state.min.js"></script>
```

# 使用

直接传一个任务方法作为回调方法

```js
import idle from 'idle-state'

const foo = () => {
  console.log('do task foo.')
}
// 直接传一个任务方法，`foo` 将在浏览器空闲时被调用
idle(foo)
```

传一个任务队列

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// `task1` 和 `task2` 将会在浏览器空闲时，按照顺序被依次调用
idle([task1, task2])
```

以 `options` 配置项的形式传参

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')

// `options.tasks` 任务数组，该方式与任务队列传参是同样的效果，`task1` 和 `task2` 将在浏览器空闲时，被依次调用
idle({
  tasks: [task1, task2],
})
```

以回调方法 + 配置项的形式传参

```js
import idle from 'idle-state'

const task1 = () => console.log('do task1.')
const task2 = () => console.log('do task2.')
// 在这个例子中 `task1` 和 `task2` 实际将被转化为 [task1, task2] 的形式，按顺序被调用
idle(task1, { tasks: [task2] })
```

# 参数文档

`idle` 方法有两个参数

```js
import idle from 'idle-state'

idle(callback, options)
```

- `callback` - 可以是一个方法或者是方法数组
  - `[Function]` - 被认为是一个任务
  - `[Function-array]` - 被认为是一个任务数组
- `options [Object]` - 配置任务将被如何运行
  - `target [Element | Element-Array]` - `target` 需要是一个 `node` 节点，默认值是 `document` 对象，它将被侦听, 它的状态将决定当前是否处于空闲状态
  - `tasks [Function-array]` - 任务数组
  - `timeout [Number]` - 浏览器进入空闲状态后，与真正开始执行任务的间隔，经过 `timeout` 毫秒将开始执行任务
  - `interval [Number]` - 每一个任务的执行间隔(毫秒)
  - `loop [Boolean]` - 任务是否需要循环执行
  - `mousemoveDetect [Boolean]` - 是否需要监听浏览器的`onmousemove` 事件，因为该事件在浏览器中会被高频率的触发，为了不影响性能，我们将它单独作为一个配置项提供给用户选择是否需要监听它，默认值为`false`(不监听)
  - `reqeustDetect` [Boolean] - 是否监听当前浏览器正在发起请求(`ajax` 或者 `fetch`)，开启后当浏览器正在发起网络请求时，将暂停任务执行，默认值为 `true`(监听)
  - `events [EventName-array]` - 需要被监听的 DOM 事件名称数组， 默认值为 `['scroll', 'keydown', 'touchmove', 'touchstart', 'click']`
  - `onPause [Function]` - 当任务暂停执行时，触发该回调方法
  - `onResume [Function]` - 当任务由 `暂停` 转为 `重新开始` 时，触发该回调方法
  - `onDispose [Function]` - 当任务被销毁时(被销毁的任务资源将被释放，事件监听将移除，无法重新启动)，将触发该回调函数

# options 默认值

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

# 实例 API 方法

你可以调用 `idle()` 方法取得一个实例

```js
import idle from 'idle-state'

const instance = idle(() => {})
```

`instance`

- `.pause(callback)` - 暂停任务运行
- `.resume(callback)` - 被暂停的任务重新启动
- `.dispose(callback)` - 释放所有资源，清除任务(队列)，移除 target 上被监听的事件，调用该方法后将无法使用 `resume` 方法重启任务
- `.push(task-function)` - 实时往任务队列尾部插入一个方法
- `.timeout(time)` - 当浏览器进入空闲状态后，经过 `timeout` (单位毫秒) 时间后开始执行任务
- `.interval(time)` - 多个任务间执行时间间隔(单位毫秒)，默认值 1000
- `.loop(boolean)` - 任务是否需要循环执行默认值 `false`
- `.isIdle` - 获取当前浏览器空闲状态，返回 `true` 或 `false`

> **`callback` 参数通过实例 API 传参 (例如 `instance.pause(callback)` ) 会比 `options` (例如 `options.onPause`) 中定义的优先级更高，将会覆盖后者**

## 实例 API 方法使用文档

`.pause(callback)`

```js
// 直接暂停任务
instnce.pause()

// 暂停任务的同时调用回调方法
instance.pause(() => console.log('task paused.'))
```

`.resume(callback)`

```js
// 暂停的任务重启（只有被暂停的任务才能重启）
instance.resume()

// 暂停的任务重启的同时调用回调方法
instance.resume(() => console.log('paused task re-running.'))
```

`.dispose(callback)`

```js
// 终止任务，释放所有资源，并移除绑定事件（不能被 `.resume()` 方法重启任务）
instance.dispose()

// 终止任务的同时调用回调方法
instance.dispose(() => console.log('tasks stoped.'))
```

`.push(task)`

```js
const task = () => console.log('I am a task.')
// 往任务队列尾部插入一个任务，`task` 需要是一个方法
instance.push(task)
```

`.timeout(time)`

```js
// 浏览器进入空闲状态后，等待 `time` 毫秒后开始执行任务
instance.timeout(2000)
```

`.interval(time)`

```js
// 多个任务间的执行间隔时间，默认值为 1000 毫秒
instance.interval(1000)
```

`.loop(boolean)`

```js
// 是否需要循环执行任务
instance.loop(true)
```

# 获取当前浏览器空闲状态

```js
import idle from 'idle-state'

const instance = idle(() => {})

// 通过 `.isIdle` 获取当前浏览器空闲状态
instance.isIdle // =>  `true` 或 `false`
```

在默认配置情况下，当浏览器在触发 `['scroll', 'keydown', 'touchmove', 'touchstart', 'click']` 这些事件或者当前有发起网络请求(`ajax` 或 `fetch`) 时，将会取到 `false`. 您可以通过 `options.events` 来配置需要监听的浏览器事件, 您传入的 `options.events` 将会替换掉默认值。您还可以通过 `options.requestDetect` 配置项来控制是否监听网络请求

# 查看项目示例

```shell
npm run dev
```

# 构建项目

```shell
npm run build
```
