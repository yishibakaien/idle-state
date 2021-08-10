(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.idle = factory());
}(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

    return _classApplyDescriptorGet(receiver, descriptor);
  }

  function _classPrivateFieldSet(receiver, privateMap, value) {
    var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

    _classApplyDescriptorSet(receiver, descriptor, value);

    return value;
  }

  function _classExtractFieldDescriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to " + action + " private field on non-instance");
    }

    return privateMap.get(receiver);
  }

  function _classApplyDescriptorGet(receiver, descriptor) {
    if (descriptor.get) {
      return descriptor.get.call(receiver);
    }

    return descriptor.value;
  }

  function _classApplyDescriptorSet(receiver, descriptor, value) {
    if (descriptor.set) {
      descriptor.set.call(receiver, value);
    } else {
      if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
      }

      descriptor.value = value;
    }
  }

  var isFunction = function isFunction(fn) {
    return typeof fn === 'function';
  };
  var isObject = function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };
  var isArray = function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }; // unique array item

  var uniqueArray = function uniqueArray(arr) {
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
  var next = function next(callback) {
    return isFunction(callback) && callback();
  };
  var noop = function noop() {};

  var STATUS_START = 1;
  var STATUS_PAUSE = 2;
  var STATUS_STOP = 3;

  var _isIdle = /*#__PURE__*/new WeakMap();

  var _timer = /*#__PURE__*/new WeakMap();

  var _status = /*#__PURE__*/new WeakMap();

  var _index = /*#__PURE__*/new WeakMap();

  var Detector = /*#__PURE__*/function () {
    function Detector(task) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Detector);

      _isIdle.set(this, {
        writable: true,
        value: false
      });

      _timer.set(this, {
        writable: true,
        value: null
      });

      _status.set(this, {
        writable: true,
        value: STATUS_START
      });

      _index.set(this, {
        writable: true,
        value: 0
      });

      _defineProperty(this, "eventHandler", this.eventHandler.bind(this));

      if (isObject(task)) {
        Object.assign(options, task);
      }

      if (isArray(task)) {
        if (isArray(options.tasks)) {
          options.tasks = task.concat(options.tasks);
        } else {
          options.tasks = task;
        }
      } // transform all tasks to a task array


      if (isFunction(task)) {
        if (isArray(options.tasks)) {
          options.tasks = [task].concat(options.tasks);
        } else {
          options.tasks = [task];
        }
      }

      var events = options.events;

      if (isArray(events)) {
        Detector.events = Detector.events.concat(events);
      }

      this.options = _objectSpread2({
        target: document.body,
        timeout: 3000,
        interval: 1000,
        loop: false,
        enableMousemove: false,
        tasks: [],
        events: [],
        onDispose: noop,
        onPause: noop,
        onResume: noop
      }, options);
      /**
       * mousemove events are frequently triggered in the browser,
       * so put it configurable
       */

      if (this.options.enableMousemove) {
        Detector.events.push('mousemove');
      } // remove repeat event


      Detector.events = uniqueArray(Detector.events);
      var element = this.options.target;
      Detector.events.forEach(function (event) {
        element.addEventListener(event, _this.eventHandler);
      });

      this._start();
    } // controller of running tasks


    _createClass(Detector, [{
      key: "_run",
      value: function _run() {
        var _this$options = this.options,
            tasks = _this$options.tasks,
            loop = _this$options.loop;

        if (_classPrivateFieldGet(this, _status) !== STATUS_START) {
          return;
        }

        if (!tasks.length) {
          this.dispose();
        }

        var isLastTask = _classPrivateFieldGet(this, _index) === tasks.length - 1;

        var task = tasks[_classPrivateFieldGet(this, _index)];

        next(task);

        if (loop && isLastTask) {
          _classPrivateFieldSet(this, _index, 0);

          this._start();
        }

        if (!loop && isLastTask) {
          this.dispose();
        }

        if (!isLastTask) {

          _classPrivateFieldSet(this, _index, (+_classPrivateFieldGet(this, _index)) + 1);

          this._start();
        }
      }
    }, {
      key: "_clearTimer",
      value: function _clearTimer() {
        if (_classPrivateFieldGet(this, _timer)) {
          clearTimeout(_classPrivateFieldGet(this, _timer));

          _classPrivateFieldSet(this, _timer, null);
        }
      } // start running tasks

    }, {
      key: "_start",
      value: function _start() {
        var _this2 = this;

        this._clearTimer();

        var _this$options2 = this.options,
            interval = _this$options2.interval,
            timeout = _this$options2.timeout;
        var time = _classPrivateFieldGet(this, _isIdle) ? interval : timeout;

        _classPrivateFieldSet(this, _timer, setTimeout(function () {
          _classPrivateFieldSet(_this2, _isIdle, true);

          _this2._run();
        }, time));
      }
    }, {
      key: "eventHandler",
      value: function eventHandler() {
        _classPrivateFieldSet(this, _isIdle, false);

        this._start();
      }
      /**
       * pause running tasks
       * callback passed by this has a higher priority than options
       * @param {Function} cb
       */

    }, {
      key: "pause",
      value: function pause(cb) {
        if (_classPrivateFieldGet(this, _status) === STATUS_START) {
          _classPrivateFieldSet(this, _status, STATUS_PAUSE);

          var callback = cb || this.options.onPause;
          next(callback);
        }
      }
      /**
       * resume paused tasks
       * callback passed by this has a higher priority than options
       * @param {Function} cb
       */

    }, {
      key: "resume",
      value: function resume(cb) {
        if (_classPrivateFieldGet(this, _status) === STATUS_PAUSE) {
          _classPrivateFieldSet(this, _status, STATUS_START);

          var callback = cb || this.options.onResume;
          next(callback);

          this._start();
        }
      } // dispose the resource & remove events handler

    }, {
      key: "dispose",
      value: function dispose(cb) {
        var _this3 = this;

        _classPrivateFieldSet(this, _status, STATUS_STOP);

        this._clearTimer();

        var element = this.options.target;
        Detector.events.forEach(function (evt) {
          element.removeEventListener(evt, _this3.eventHandler);
        });
        var callback = cb || this.options.onDispose;
        next(callback);
      } // convenience options for `dispose` API

    }, {
      key: "stop",
      value: function stop() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this.dispose.apply(this, args);
      } // convenience options for `dispose` API

    }, {
      key: "destroy",
      value: function destroy() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        this.dispose.apply(this, args);
      } // push a task

    }, {
      key: "push",
      value: function push(task) {
        if (isFunction(task)) {
          this.options.tasks.push(task);
        }
      } // set tasks running timeout

    }, {
      key: "timeout",
      value: function timeout(_timeout) {
        this.options.timeout = _timeout;
      } // set tasks running interval

    }, {
      key: "interval",
      value: function interval(_interval) {
        this.options.interval = _interval;
      } // set loop option

    }, {
      key: "loop",
      value: function loop(value) {
        this.options.loop = value;
      } // get current idle status

    }, {
      key: "isIdle",
      value: function isIdle() {
        return _classPrivateFieldGet(this, _isIdle);
      }
    }]);

    return Detector;
  }();

  _defineProperty(Detector, "events", ['scroll', 'keydown', 'touchmove', 'touchstart', 'click' // 'mousedown',
  // 'wheel',
  // 'mousewheel',
  // 'mousemove',
  ]);

  function index () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _construct(Detector, args);
  }

  return index;

})));
//# sourceMappingURL=idle-state.js.map
