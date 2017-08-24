/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = function utils() {
    var isDefined = function isDefined(value) {
        return value !== undefined;
    };
    var isNull = function isNull(value) {
        return value === null;
    };
    var isArray = function isArray(value) {
        return Array.isArray(value);
    };
    var isFunction = function isFunction(value) {
        return typeof value === 'function';
    };
    var isString = function isString(value) {
        return typeof value === 'string';
    };
    var isObject = function isObject(value) {
        return !!value && value.constructor === Object;
    };
    var isNode = function isNode(value) {
        return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
    };

    var isBrowser = function isBrowser() {
        if (typeof window !== 'undefined') {
            return true;
        }
    };

    var deepCopy = function deepCopy(obj) {
        if (!isDefined(obj)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    };

    var assert = function assert(assertion, message) {
        for (var _len = arguments.length, culprits = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            culprits[_key - 2] = arguments[_key];
        }

        var print = function print(obj) {
            return '\n>>> ' + String(JSON.stringify(obj, function (key, value) {
                return typeof value === 'function' ? value.toString() : value;
            }, 2)).replace(/\n/g, '\n    ');
        };
        if (!assertion) {
            if (culprits.length > 0) {
                message += culprits.map(print).join('');
            }
            throw new Error('@okwolo.' + message);
        }
    };

    var makeQueue = function makeQueue() {
        var queue = [];
        var run = function run() {
            var func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };
        var add = function add(func) {
            assert(isFunction(func), 'utils.makeQueue.add : added objects must be a function', func);
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };
        var done = function done() {
            queue.shift();
            run();
        };
        return { add: add, done: done };
    };

    var bus = function bus(queue) {
        var handlers = {};
        var names = {};

        var on = function on(type, handler) {
            assert(isString(type), 'utils.bus : handler type is not a string', type);
            assert(isFunction(handler), 'utils.bus : handler is not a function', handler);
            if (!isDefined(handlers[type])) {
                handlers[type] = [];
            }
            handlers[type].push(handler);
        };

        var handle = function handle(event) {
            assert(isObject(event), 'utils.bus : event is not an object', event);
            var name = event.name;

            if (isDefined(name)) {
                assert(isString(name), 'utils.bus : event name is not a string', name);
                if (isDefined(names[name])) {
                    return;
                }
                names[name] = true;
            }
            Object.keys(event).forEach(function (key) {
                if (!isDefined(handlers[key])) {
                    return;
                }
                if (queue) {
                    queue.add(function () {
                        handlers[key].forEach(function (handler) {
                            return handler(event[key]);
                        });
                        queue.done();
                    });
                    return;
                }
                handlers[key].forEach(function (handler) {
                    return handler(event[key]);
                });
            });
        };

        return Object.assign(handle, { on: on });
    };

    return { deepCopy: deepCopy, assert: assert, isDefined: isDefined, isNull: isNull, isArray: isArray, isFunction: isFunction, isString: isString, isObject: isObject, isNode: isNode, isBrowser: isBrowser, makeQueue: makeQueue, bus: bus };
};

module.exports = utils;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var core = __webpack_require__(2);

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

var singletons = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};

var renderToString = function renderToString(target, _vdom) {
    assert(isFunction(target), 'server.dom.draw : target is not a function', target);
    var render = function render() {
        var vdom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { text: '' };

        if (isDefined(vdom.text)) {
            return [vdom.text];
        }
        var tagName = vdom.tagName,
            _vdom$attributes = vdom.attributes,
            attributes = _vdom$attributes === undefined ? {} : _vdom$attributes,
            _vdom$children = vdom.children,
            children = _vdom$children === undefined ? [] : _vdom$children;

        var formattedAttributes = Object.keys(attributes).map(function (key) {
            return key + '="' + attributes[key].toString() + '"';
        }).join(' ');
        if (isDefined(singletons[tagName])) {
            return ['<' + (tagName + ' ' + formattedAttributes).trim() + ' />'];
        }
        return ['<' + (tagName + ' ' + formattedAttributes).trim() + '>'].concat(_toConsumableArray(children.reduce(function (acc, child) {
            return acc.concat(render(child));
        }, []).map(function (line) {
            return '  ' + line;
        })), ['</' + tagName + '>']);
    };
    target(render(_vdom).join('\n'));
};

var serverRender = {
    name: 'okwolo-server-render',
    draw: renderToString,
    update: renderToString
};

module.exports = core({
    modules: [__webpack_require__(3)],
    blobs: [serverRender],
    options: {
        bundle: 'server',
        browser: false,
        modules: {
            state: false,
            history: false,
            dom: true,
            router: false
        }
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    isFunction = _require.isFunction,
    isDefined = _require.isDefined,
    assert = _require.assert,
    deepCopy = _require.deepCopy,
    isBrowser = _require.isBrowser,
    bus = _require.bus;

var core = function core(_ref) {
    var modules = _ref.modules,
        blobs = _ref.blobs,
        options = _ref.options;

    var okwolo = function okwolo(target, _window) {
        if (options.browser) {
            if (!isDefined(_window)) {
                assert(isBrowser(), 'app : this version of okwolo must be run in a browser environment');
                _window = window;
            }
        }

        var exec = bus();
        var use = bus();
        var api = { exec: exec, use: use };

        modules.forEach(function (_module) {
            _module({ exec: exec, use: use }, _window);
        });

        blobs.forEach(function (blob) {
            use(blob(_window));
        });

        var initial = {};
        var _state = initial;

        exec.on('state', function (newState) {
            _state = newState;
        });

        api.getState = function () {
            assert(_state !== initial, 'getState : cannot get state before it has been set');
            return deepCopy(_state);
        };

        if (options.modules.dom) {
            api.update = function () {
                exec({ state: _state });
            };

            if (isDefined(target)) {
                use({ target: target });
            }
        }

        if (options.modules.state) {
            api.act = function (type, params) {
                assert(type === 'SET_STATE' || _state !== initial, 'act : cannot act on state before it has been set');
                exec({ act: { state: _state, type: type, params: params } });
            };

            use({ action: {
                    type: 'SET_STATE',
                    target: [],
                    handler: function handler(state, params) {
                        return params;
                    }
                } });

            api.setState = function (replacement) {
                if (isFunction(replacement)) {
                    api.act('SET_STATE', replacement(deepCopy(_state)));
                    return;
                }
                api.act('SET_STATE', replacement);
            };

            if (options.modules.history) {
                api.undo = function () {
                    api.act('UNDO');
                };

                api.redo = function () {
                    api.act('REDO');
                };
            }
        } else {
            assert(!options.modules.history, 'app : cannot use history blob without the state module', options);
            api.setState = function (replacement) {
                if (isFunction(replacement)) {
                    exec({ state: replacement(deepCopy(_state)) });
                    return;
                }
                exec({ state: replacement });
            };
        }

        if (options.modules.router) {
            api.redirect = function (path, params) {
                exec({ redirect: { path: path, params: params } });
            };

            api.show = function (path, params) {
                exec({ show: { path: path, params: params } });
            };

            api.register = function (path, builder) {
                if (isFunction(path)) {
                    use({ builder: path() });
                    return;
                }
                use({ route: {
                        path: path,
                        callback: function callback(params) {
                            use({ builder: builder(params) });
                        }
                    } });
            };
        } else {
            api.register = function (builder) {
                assert(isFunction(builder), 'register : builder is not a function', builder);
                use({ builder: path() });
                return;
            };
        }

        return Object.assign(api.register, api);
    };

    if (isBrowser()) {
        okwolo.bundle = options.bundle;
        if (!isDefined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.bundle] = okwolo;
    }

    return okwolo;
};

module.exports = core;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

var dom = function dom(_ref, _window) {
    var exec = _ref.exec,
        use = _ref.use;

    var draw = void 0;
    var update = void 0;
    var build = void 0;

    var prebuild = void 0;
    var postbuild = void 0;

    var vdom = void 0;
    var target = void 0;
    var builder = void 0;
    var state = void 0;

    var create = function create(state) {
        var temp = builder(state);
        if (prebuild) {
            temp = prebuild(temp);
        }
        temp = build(temp);
        if (postbuild) {
            temp = postbuild(temp);
        }
        return temp;
    };

    var hasDrawn = false;
    var drawToTarget = function drawToTarget() {
        hasDrawn = true;
        vdom = draw(target, vdom);
    };

    var canDraw = function canDraw(callback) {
        if (isDefined(target) && isDefined(builder) && isDefined(state)) {
            callback();
        }
    };

    exec.on('state', function (newState) {
        assert(isDefined(newState), 'dom.updateState : new state is not defined', newState);
        state = newState;
        canDraw(function () {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    });

    use.on('target', function (newTarget) {
        target = newTarget;
        canDraw(drawToTarget);
    });

    use.on('builder', function (newBuilder) {
        assert(isFunction(newBuilder), 'dom.replaceBuilder : builder is not a function', newBuilder);
        builder = newBuilder;
        canDraw(function () {
            if (!hasDrawn) {
                drawToTarget();
            }
            vdom = update(target, create(state), vdom);
        });
    });

    use.on('draw', function (newDraw) {
        assert(isFunction(newDraw), 'dom.replaceDraw : new draw is not a function', newDraw);
        draw = newDraw;
        canDraw(drawToTarget);
    });

    use.on('update', function (newUpdate) {
        assert(isFunction(newUpdate), 'dom.replaceUpdate : new target updater is not a function', newUpdate);
        update = newUpdate;
    });

    use.on('build', function (newBuild) {
        assert(isFunction(newBuild), 'dom.replaceBuild : new build is not a function', newBuild);
        build = newBuild;
        canDraw(function () {
            return update(target, create(state), vdom);
        });
    });

    use.on('prebuild', function (newPrebuild) {
        assert(isFunction(newPrebuild), 'dom.replacePrebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        canDraw(function () {
            return update(target, create(state), vdom);
        });
    });

    use.on('postbuild', function (newPostbuild) {
        assert(isFunction(newPostbuild), 'dom.replacePostbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        canDraw(function () {
            return update(target, create(state), vdom);
        });
    });
};

module.exports = dom;

/***/ })
/******/ ]);