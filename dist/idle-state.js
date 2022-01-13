(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.idle = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var isFunction = function (fn) { return typeof fn === 'function'; };
    var isObject = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    };
    var isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    var isNodeElement = function (target) { return target.nodeType === 1; };
    // unique array item
    var uniqueArray = function (arr) {
        if (!isArray(arr)) {
            return [];
        }
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr.indexOf(arr[i]) === i) {
                ret.push(arr[i]);
            }
        }
        return ret;
    };
    var next = function (callback) { return isFunction(callback) && callback(); };
    var noop = function () { };

    var STATUS_XHR_DONE = 4;
    var fetchDetector = function (cb) {
        var count = 0;
        var store = {
            count: count
        };
        Object.defineProperty(store, 'count', {
            set: function (val) {
                count = val;
                cb(count === 0);
            },
            get: function () {
                return count;
            }
        });
        var oldOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            store.count++;
            this.onreadystatechange = function () {
                if (this.readyState === STATUS_XHR_DONE) {
                    store.count--;
                }
            };
            oldOpen.apply(this, arguments);
        };
        var oldFetch = window.fetch;
        window.fetch = function () {
            var _this = this;
            store.count++;
            var args = arguments;
            return new Promise(function (resolve, reject) {
                oldFetch.apply(_this, args).then(function (res) {
                    store.count--;
                    resolve(res);
                }).catch(function (err) {
                    store.count--;
                    reject(err);
                });
            });
        };
    };
    var requestDetector = (function (cb) {
        fetchDetector(cb);
    });

    var EventDetector = /** @class */ (function () {
        function EventDetector(target, events, callback) {
            this.target = isNodeElement(target) ? [target] : target;
            this.events = events;
            this.callback = callback.bind(this);
            this.eventHandler = this.handler.bind(this);
            this.init();
        }
        EventDetector.prototype.init = function () {
            var _this = this;
            this.events.forEach(function (evt) {
                _this.target.forEach(function (ele) {
                    ele.addEventListener(evt, _this.eventHandler);
                });
            });
        };
        EventDetector.prototype.handler = function () {
            this.callback();
        };
        EventDetector.prototype.dispose = function () {
            var _this = this;
            this.events.forEach(function (evt) {
                _this.target.forEach(function (ele) {
                    ele.removeEventListener(evt, _this.eventHandler);
                });
            });
        };
        return EventDetector;
    }());

    var _a;
    var STATUS_START = 1;
    var STATUS_PAUSE = 2;
    var STATUS_STOP = 3;
    // private props
    var _index = Symbol('index');
    // private api
    var _start = Symbol('start');
    var _run = Symbol('run');
    var _clearTimer = Symbol('clearTimer');
    var _eventHandler = Symbol('eventHandler');
    var IdleState = /** @class */ (function () {
        function IdleState(task, options) {
            var _this = this;
            this.defaultevents = [
                'scroll',
                'keydown',
                'touchmove',
                'touchstart',
                'click',
            ];
            this.isIdle = false;
            this.timer = null;
            this.status = STATUS_START;
            this[_a] = 0;
            this._eventHandler = this[_eventHandler].bind(this);
            if (isObject(task)) {
                Object.assign(options, task);
            }
            if (isArray(task)) {
                if (isArray(options.tasks)) {
                    options.tasks = task.concat(options.tasks);
                }
                else {
                    options.tasks = task;
                }
            }
            // transform all tasks to a task array
            if (isFunction(task)) {
                if (isArray(options.tasks)) {
                    options.tasks = [task].concat(options.tasks);
                }
                else {
                    options.tasks = [task];
                }
            }
            var events = options.events;
            if (isArray(events) && events.length > 0) {
                this.events = events;
            }
            else {
                this.events = this.defaultevents;
            }
            this.options = __assign({ target: document.body, timeout: 3000, interval: 1000, loop: false, mousemoveDetect: false, reqeustDetect: true, tasks: [], events: [], onDispose: noop, onPause: noop, onResume: noop }, options);
            /**
             * mousemove events are frequently triggered in the browser,
             * so put it configurable
             */
            if (this.options.mousemoveDetect) {
                this.events.push('mousemove');
            }
            if (this.options.reqeustDetect) {
                requestDetector(function (isRequestIdle) {
                    isRequestIdle && _this._eventHandler();
                });
            }
            // remove repeat event
            this.events = uniqueArray(this.events);
            var element = this.options.target;
            this.eventDetector = new EventDetector(element, this.events, this._eventHandler);
            this[_start]();
        }
        // controller of running tasks
        IdleState.prototype[(_a = _index, _run)] = function () {
            var _b = this.options, tasks = _b.tasks, loop = _b.loop;
            if (this.status !== STATUS_START) {
                return;
            }
            if (!tasks.length) {
                this.dispose();
            }
            var isLastTask = this[_index] === tasks.length - 1;
            var task = tasks[this[_index]];
            next(task);
            if (loop && isLastTask) {
                this[_index] = 0;
                this[_start]();
            }
            if (!loop && isLastTask) {
                this.dispose();
            }
            if (!isLastTask) {
                this[_index]++;
                this[_start]();
            }
        };
        IdleState.prototype[_clearTimer] = function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        };
        // start running tasks
        IdleState.prototype[_start] = function () {
            var _this = this;
            this[_clearTimer]();
            var _b = this.options, interval = _b.interval, timeout = _b.timeout;
            var time = this.isIdle ? interval : timeout;
            this.timer = setTimeout(function () {
                _this.isIdle = true;
                _this[_run]();
            }, time);
        };
        IdleState.prototype[_eventHandler] = function () {
            this.isIdle = false;
            this[_start]();
        };
        /**
         * pause running tasks
         * callback passed by this has a higher priority than options
         * @param {Function} cb
         */
        IdleState.prototype.pause = function (cb) {
            if (this.status === STATUS_START) {
                this.status = STATUS_PAUSE;
                var callback = cb || this.options.onPause;
                next(callback);
                return this;
            }
        };
        /**
         * resume paused tasks
         * callback passed by this has a higher priority than options
         * @param {Function} cb
         */
        IdleState.prototype.resume = function (cb) {
            if (this.status === STATUS_PAUSE) {
                this.status = STATUS_START;
                var callback = cb || this.options.onResume;
                next(callback);
                this[_start]();
                return this;
            }
        };
        // dispose the resource & remove events handler
        IdleState.prototype.dispose = function (cb) {
            this.status = STATUS_STOP;
            this[_clearTimer]();
            this.eventDetector.dispose();
            var callback = cb || this.options.onDispose;
            next(callback);
        };
        // push a task
        IdleState.prototype.push = function (task) {
            if (isFunction(task)) {
                this.options.tasks.push(task);
            }
            return this;
        };
        // set tasks running timeout
        IdleState.prototype.timeout = function (timeout) {
            this.options.timeout = timeout;
            return this;
        };
        // set tasks running interval
        IdleState.prototype.interval = function (interval) {
            this.options.interval = interval;
            return this;
        };
        // set loop option
        IdleState.prototype.loop = function (value) {
            this.options.loop = value;
            return this;
        };
        return IdleState;
    }());

    function index (task, options) {
        return new IdleState(task, options);
    }

    return index;

})));
//# sourceMappingURL=idle-state.js.map
