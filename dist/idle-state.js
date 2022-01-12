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
            var _this = this;
            store.count++;
            this.addEventListener('readystatechange', function () {
                if (_this.readyState === 4) {
                    store.count--;
                }
            }, false);
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
    var fetchDetector$1 = (function (cb) {
        fetchDetector(cb);
    });

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
    var Detector = /** @class */ (function () {
        function Detector(task, options) {
            var _this = this;
            this.events = [
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
            if (isArray(events)) {
                this.events = this.events.concat(events);
            }
            this.options = __assign({ target: document.body, timeout: 3000, interval: 1000, loop: false, enableMousemove: false, enableReqeustDetect: true, tasks: [], events: [], onDispose: noop, onPause: noop, onResume: noop }, options);
            /**
             * mousemove events are frequently triggered in the browser,
             * so put it configurable
             */
            if (this.options.enableMousemove) {
                this.events.push('mousemove');
            }
            if (this.options.enableMousemove) {
                fetchDetector$1(function (isFetchIdle) {
                    isFetchIdle && _this._eventHandler();
                });
            }
            // remove repeat event
            this.events = uniqueArray(this.events);
            var element = this.options.target;
            this.events.forEach(function (event) {
                element.addEventListener(event, _this._eventHandler);
            });
            this[_start]();
        }
        // controller of running tasks
        Detector.prototype[(_a = _index, _run)] = function () {
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
        Detector.prototype[_clearTimer] = function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        };
        // start running tasks
        Detector.prototype[_start] = function () {
            var _this = this;
            this[_clearTimer]();
            var _b = this.options, interval = _b.interval, timeout = _b.timeout;
            var time = this.isIdle ? interval : timeout;
            this.timer = setTimeout(function () {
                _this.isIdle = true;
                _this[_run]();
            }, time);
        };
        Detector.prototype[_eventHandler] = function () {
            this.isIdle = false;
            this[_start]();
        };
        /**
         * pause running tasks
         * callback passed by this has a higher priority than options
         * @param {Function} cb
         */
        Detector.prototype.pause = function (cb) {
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
        Detector.prototype.resume = function (cb) {
            if (this.status === STATUS_PAUSE) {
                this.status = STATUS_START;
                var callback = cb || this.options.onResume;
                next(callback);
                this[_start]();
                return this;
            }
        };
        // dispose the resource & remove events handler
        Detector.prototype.dispose = function (cb) {
            var _this = this;
            this.status = STATUS_STOP;
            this[_clearTimer]();
            var element = this.options.target;
            this.events.forEach(function (evt) {
                element.removeEventListener(evt, _this._eventHandler);
            });
            var callback = cb || this.options.onDispose;
            next(callback);
        };
        // push a task
        Detector.prototype.push = function (task) {
            if (isFunction(task)) {
                this.options.tasks.push(task);
            }
            return this;
        };
        // set tasks running timeout
        Detector.prototype.timeout = function (timeout) {
            this.options.timeout = timeout;
            return this;
        };
        // set tasks running interval
        Detector.prototype.interval = function (interval) {
            this.options.interval = interval;
            return this;
        };
        // set loop option
        Detector.prototype.loop = function (value) {
            this.options.loop = value;
            return this;
        };
        return Detector;
    }());

    function index (task, options) {
        return new Detector(task, options);
    }

    return index;

})));
//# sourceMappingURL=idle-state.js.map
