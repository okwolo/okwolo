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


var core = __webpack_require__(2);

module.exports = core({
    modules: [__webpack_require__(3), __webpack_require__(4), __webpack_require__(5)],
    blobs: [__webpack_require__(6), __webpack_require__(7), __webpack_require__(10)],
    options: {
        kit: 'standard',
        browser: true,
        modules: {
            state: true,
            history: true,
            dom: true,
            router: true
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
                assert(isBrowser(), 'app : must be run in a browser environment');
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
                use({ builder: builder() });
                return;
            };
        }

        return Object.assign(api.register, api);
    };

    if (isBrowser()) {
        okwolo.kit = options.kit;
        if (!isDefined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.kit] = okwolo;
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
    var canDraw = false;
    var drawToTarget = function drawToTarget() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !hasDrawn;

        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force) {
            vdom = update(target, create(state), vdom);
            return;
        }
        vdom = draw(target, create(state));
        hasDrawn = true;
    };

    exec.on('state', function (newState) {
        assert(isDefined(newState), 'dom.updateState : new state is not defined', newState);
        state = newState;
        drawToTarget();
    });

    use.on('target', function (newTarget) {
        target = newTarget;
        drawToTarget(true);
    });

    use.on('builder', function (newBuilder) {
        assert(isFunction(newBuilder), 'dom.replaceBuilder : builder is not a function', newBuilder);
        builder = newBuilder;
        drawToTarget();
    });

    use.on('draw', function (newDraw) {
        assert(isFunction(newDraw), 'dom.replaceDraw : new draw is not a function', newDraw);
        draw = newDraw;
        drawToTarget(true);
    });

    use.on('update', function (newUpdate) {
        assert(isFunction(newUpdate), 'dom.replaceUpdate : new target updater is not a function', newUpdate);
        update = newUpdate;
        drawToTarget();
    });

    use.on('build', function (newBuild) {
        assert(isFunction(newBuild), 'dom.replaceBuild : new build is not a function', newBuild);
        build = newBuild;
        drawToTarget();
    });

    use.on('prebuild', function (newPrebuild) {
        assert(isFunction(newPrebuild), 'dom.replacePrebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        drawToTarget();
    });

    use.on('postbuild', function (newPostbuild) {
        assert(isFunction(newPostbuild), 'dom.replacePostbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        drawToTarget();
    });
};

module.exports = dom;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    deepCopy = _require.deepCopy,
    makeQueue = _require.makeQueue,
    isDefined = _require.isDefined,
    isArray = _require.isArray,
    isFunction = _require.isFunction,
    isString = _require.isString;

var state = function state(_ref) {
    var exec = _ref.exec,
        use = _ref.use;

    var actions = {};
    var middleware = [];
    var watchers = [];

    var queue = makeQueue();

    var execute = function execute(state, type, params) {
        var newState = deepCopy(state);
        assert(isDefined(actions[type]), 'state.execute : action type \'' + type + '\' was not found');
        actions[type].forEach(function (currentAction) {
            var targetAddress = currentAction.target;
            if (isFunction(targetAddress)) {
                targetAddress = targetAddress(deepCopy(state), params);
                assert(isArray(targetAddress), 'state.execute : dynamic target of action ' + type + ' is not an array', targetAddress);
                targetAddress.forEach(function (address) {
                    assert(isString(address), 'state.execute : dynamic target of action ' + type + ' is not an array of strings', targetAddress);
                });
            }
            var target = deepCopy(newState);
            if (targetAddress.length > 0) {
                var reference = newState;
                targetAddress.forEach(function (key, i) {
                    assert(isDefined(target[key]), 'state.execute : target of action ' + type + ' does not exist: @state.' + targetAddress.slice(0, i + 1).join('.'));
                    if (i === targetAddress.length - 1) {
                        var newValue = currentAction.handler(target[key], params);
                        assert(isDefined(newValue), 'state.execute : result of action ' + type + ' on target @state' + targetAddress.join('.') + ' is undefined');
                        reference[key] = newValue;
                    } else {
                        target = target[key];
                        reference = reference[key];
                    }
                });
            } else {
                newState = currentAction.handler(target, params);
                assert(isDefined(newState), 'state.execute : result of action ' + type + ' on target @state is undefined');
            }
        });

        exec({ state: deepCopy(newState) });

        watchers.forEach(function (watcher) {
            watcher(deepCopy(newState), type, params);
        });

        queue.done();
    };

    var apply = function apply(state, type, params) {
        var funcs = [function () {
            var _state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state;

            var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

            var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : params;

            execute(_state, _type, _params);
        }];
        middleware.reverse().forEach(function (currentMiddleware, index) {
            funcs[index + 1] = function () {
                var _state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state;

                var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

                var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : params;

                state = _state;
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], deepCopy(_state), _type, _params);
            };
        });
        funcs[middleware.length](deepCopy(state), type, params);
    };

    exec.on('act', function () {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            state = _ref2.state,
            type = _ref2.type,
            _ref2$params = _ref2.params,
            params = _ref2$params === undefined ? {} : _ref2$params;

        assert(isString(type), 'state.act : action type is not a string', type);
        assert(isDefined(state), 'state.act : cannot call action ' + type + ' on an undefined state', state);
        queue.add(function () {
            apply(state, type, params);
        });
    });

    use.on('action', function (action) {
        [].concat(action).forEach(function (item) {
            var type = item.type,
                handler = item.handler,
                target = item.target;

            assert(isString(type), 'state.use.action : action\'s type is not a string', item, type);
            assert(isFunction(handler), 'state.use.action : handler for action ' + type + ' is not a function', item, handler);
            if (isArray(target)) {
                target.forEach(function (address) {
                    assert(isString(address), 'state.use.action : target of action ' + type + ' is not an array of strings', item, target);
                });
            } else {
                assert(isFunction(target), 'state.use.action : target of action ' + type + ' is not valid', target);
            }
            if (actions[type] === undefined) {
                actions[type] = [item];
            } else {
                actions[type].push(item);
            }
        });
    });

    use.on('middleware', function (_middleware) {
        [].concat(_middleware).forEach(function (item) {
            assert(isFunction(item), 'state.use.middleware : middleware is not a function', item);
            middleware.push(item);
        });
    });

    use.on('watcher', function (watcher) {
        [].concat(watcher).forEach(function (item) {
            assert(isFunction(item), 'state.use.watcher : watcher is not a function', item);
            watchers.push(item);
        });
    });
};

module.exports = state;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isString = _require.isString,
    isObject = _require.isObject,
    isFunction = _require.isFunction,
    makeQueue = _require.makeQueue;

var router = function router(_ref, _window) {
    var exec = _ref.exec,
        use = _ref.use;

    var isHosted = _window.document.origin !== null && _window.document.origin !== 'null';

    var baseUrl = '';

    var store = void 0;
    var register = void 0;
    var fetch = void 0;

    var hasMatched = false;

    var queue = makeQueue();

    var safeFetch = function safeFetch() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        assert(isFunction(fetch), 'router.fetch : fetch is not a function', fetch);
        fetch.apply(undefined, [store].concat(args));
    };

    var removeBaseUrl = function removeBaseUrl(path) {
        return path.replace(new RegExp('\^' + baseUrl), '') || '';
    };

    var currentPath = _window.location.pathname;
    if (!isHosted) {
        currentPath = '';
    }

    // handle back/forward events
    _window.onpopstate = function () {
        currentPath = removeBaseUrl(_window.location.pathname);
        safeFetch(currentPath);
    };

    // fetch wrapper that makes the browser aware of the url change
    exec.on('redirect', function () {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref2.path,
            _ref2$params = _ref2.params,
            params = _ref2$params === undefined ? {} : _ref2$params;

        assert(isString(path), 'router.redirect : path is not a string', path);
        assert(isObject(params), 'router.redirect : params is not an object', params);
        queue.add(function () {
            currentPath = path;
            if (isHosted) {
                /* edge doesn't care that the file is local and will allow pushState.
                    it also includes "/C:" in the location.pathname, but adds it to
                    the path given to pushState. which means it needs to be removed here */
                _window.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
            } else {
                console.log('@okwolo/router:: path changed to\n>>> ' + currentPath);
            }
            safeFetch(currentPath, params);
            queue.done();
        });
    });

    // fetch wrapper which does not change the url
    exec.on('show', function () {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref3.path,
            _ref3$params = _ref3.params,
            params = _ref3$params === undefined ? {} : _ref3$params;

        assert(isString(path), 'router.show : path is not a string', path);
        assert(isObject(params), 'router.show : params is not an object', params);
        queue.add(function () {
            safeFetch(path, params);
            queue.done();
        });
    });

    // register wrapper that runs the current page's url against new routes
    use.on('route', function () {
        var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref4.path,
            callback = _ref4.callback;

        assert(isString(path), 'router.use.route : path is not a string', path);
        assert(isFunction(callback), 'router.use.route : callback is not a function', path, callback);
        assert(isFunction(register), 'route.use.route : register is not a function', register);
        store = register(store, path, callback);
        if (!hasMatched) {
            hasMatched = !!safeFetch(currentPath);
        }
    });

    // replace the base url, adjust the current and try to fetch with the new url
    use.on('base', function (base) {
        assert(isString(base), 'router.use.base : base url is not a string', base);
        baseUrl = base;
        currentPath = removeBaseUrl(currentPath);
        safeFetch(currentPath);
    });

    use.on('register', function (_register) {
        assert(isFunction(_register), 'router.use.register : register is not a function', register);
        register = _register;
    });

    use.on('fetch', function (_fetch) {
        assert(isFunction(_fetch), 'router.use.fetch : fetch is not a function', fetch);
        fetch = _fetch;
    });
};

module.exports = router;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isNull = _require.isNull,
    isArray = _require.isArray,
    isString = _require.isString,
    isNode = _require.isNode,
    isObject = _require.isObject,
    isFunction = _require.isFunction,
    makeQueue = _require.makeQueue;

var blob = function blob(_window) {
    // recursively creates DOM elements from vdom object
    var render = function render(velem) {
        if (isDefined(velem.text)) {
            velem.DOM = _window.document.createTextNode(velem.text);
            return velem;
        }
        var element = _window.document.createElement(velem.tagName);
        Object.keys(velem.attributes).forEach(function (attribute) {
            element[attribute] = velem.attributes[attribute];
        });
        Object.keys(velem.children).forEach(function (key) {
            velem.children[key] = render(velem.children[key]);
            element.appendChild(velem.children[key].DOM);
        });
        velem.DOM = element;
        return velem;
    };

    // initial draw to container
    var draw = function draw(target, vdom) {
        assert(isNode(target), 'dom.draw : target is not a DOM node', target);
        if (!isDefined(vdom)) {
            vdom = { text: '' };
        }
        vdom = render(vdom);
        _window.requestAnimationFrame(function () {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    /* shallow diff of two objects which returns an array of the
        modified keys (functions always considered different)*/
    var diff = function diff(original, successor) {
        return Object.keys(Object.assign({}, original, successor)).filter(function (key) {
            var valueOriginal = original[key];
            var valueSuccessor = successor[key];
            return !(valueOriginal !== Object(valueOriginal) && valueSuccessor !== Object(valueSuccessor) && valueOriginal === valueSuccessor);
        });
    };

    // update vdom and real DOM to new state
    var update = function update(target, newVdom, vdom) {
        assert(isNode(target), 'dom.update : target is not a DOM node', target);
        // using a queue to clean up deleted nodes after diffing finishes
        var queue = makeQueue();
        _window.requestAnimationFrame(function () {
            queue.add(function () {
                _update(vdom, newVdom, { DOM: target, children: [vdom] }, 0);
                queue.done();
            });
        });
        // recursive function to update an element according to new state
        var _update = function _update(original, successor, originalParent, parentIndex) {
            if (!isDefined(original) && !isDefined(successor)) {
                return;
            }
            // add
            if (!isDefined(original)) {
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
                return;
            }
            // remove
            if (!isDefined(successor)) {
                originalParent.DOM.removeChild(original.DOM);
                queue.add(function () {
                    delete originalParent.children[parentIndex];
                    queue.done();
                });
                return;
            }
            // replace
            if (original.tagName !== successor.tagName) {
                var oldDOM = original.DOM;
                var newVDOM = render(successor);
                originalParent.DOM.replaceChild(newVDOM.DOM, oldDOM);
                /* need to manually delete to preserve reference to past object */
                if (isDefined(newVDOM.text)) {
                    originalParent.children[parentIndex].DOM = newVDOM.DOM;
                    originalParent.children[parentIndex].text = newVDOM.text;
                    delete originalParent.children[parentIndex].tagName;
                    delete originalParent.children[parentIndex].attributes;
                    delete originalParent.children[parentIndex].children;
                } else {
                    originalParent.children[parentIndex].DOM = newVDOM.DOM;
                    delete originalParent.children[parentIndex].text;
                    originalParent.children[parentIndex].tagName = newVDOM.tagName;
                    originalParent.children[parentIndex].attributes = newVDOM.attributes;
                    originalParent.children[parentIndex].children = newVDOM.children;
                }
                return;
            }
            // edit
            if (original.DOM.nodeType === 3) {
                if (original.text !== successor.text) {
                    original.DOM.nodeValue = successor.text;
                    original.text = successor.text;
                }
            } else {
                var attributesDiff = diff(original.attributes, successor.attributes);
                if (attributesDiff.length !== 0) {
                    attributesDiff.forEach(function (key) {
                        original.attributes[key] = successor.attributes[key];
                        original.DOM[key] = successor.attributes[key];
                    });
                }
            }
            var keys = Object.keys(original.children || {}).concat(Object.keys(successor.children || {}));
            var visited = {};
            keys.forEach(function (key) {
                if (visited[key] === undefined) {
                    visited[key] = true;
                    _update(original.children[key], successor.children[key], original, key);
                }
            });
        };
        return vdom;
    };

    var classnames = function classnames() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return args.map(function (arg) {
            if (isString(arg)) {
                return arg;
            } else if (isArray(arg)) {
                return classnames.apply(undefined, _toConsumableArray(arg));
            } else if (isObject(arg)) {
                return classnames(Object.keys(arg).map(function (key) {
                    return arg[key] && key;
                }));
            }
        }).filter(Boolean).join(' ');
    };

    // build vdom from builder output
    var build = function build(element) {
        if (isNull(element)) {
            return { text: '' };
        }
        if (isString(element)) {
            return { text: element };
        }
        assert(isArray(element), 'dom.build : vdom object is not an array or string', element);
        if (isFunction(element[0])) {
            var props = element[1] || {};
            assert(isObject(props), 'dom.build : component\'s props is not an object', element, props);
            var _children = element[2] || [];
            assert(isArray(_children), 'dom.build : component\'s children is not an array', element, _children);
            return build(element[0](Object.assign({}, props, { children: _children })));
        }

        var _element = _slicedToArray(element, 3),
            tagType = _element[0],
            attributes = _element[1],
            children = _element[2];

        assert(isString(tagType), 'dom.build : tag property is not a string', element, tagType);
        // capture groups: tagName, id, className, style
        var match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
        assert(isArray(match), 'dom.build : tag property cannot be parsed', tagType);

        var _match = _slicedToArray(match, 5),
            tagName = _match[1],
            id = _match[2],
            className = _match[3],
            style = _match[4];

        if (attributes == null) {
            attributes = {};
        }
        assert(isObject(attributes), 'dom.build : attributes is not an object', element, attributes);
        if (isDefined(id) && !isDefined(attributes.id)) {
            attributes.id = id.trim();
        }
        if (isDefined(attributes.className) || isDefined(className)) {
            attributes.className = classnames(attributes.className, className).replace(/\./g, ' ').replace(/  +/g, ' ').trim();
        }
        if (isDefined(style)) {
            if (!isDefined(attributes.style)) {
                attributes.style = style;
            } else {
                attributes.style += ';' + style;
                attributes.style = attributes.style.replace(/;;/g, ';');
            }
        }
        if (isDefined(children)) {
            assert(isArray(children), 'dom.build : children of vdom object is not an array', element, children);
        } else {
            children = [];
        }
        return {
            tagName: tagName,
            attributes: attributes,
            children: children.map(build)
        };
    };

    return { name: '@okwolo/dom', draw: draw, update: update, build: build };
};

module.exports = blob;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pathToRegexp = __webpack_require__(8);

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isArray = _require.isArray;

var blob = function blob(_window) {
    var register = function register() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var callback = arguments[2];

        if (!isArray(store)) {
            store = [];
        }
        store.push({
            pattern: pathToRegexp(path, [], { strict: true }),
            callback: callback
        });
        return store;
    };

    var fetch = function fetch() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        assert(isArray(store), 'router.fetch : store is not an array', store);
        var found = false;
        store.find(function (registeredPath) {
            var test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            found = true;
            test.shift();
            registeredPath.pattern.keys.forEach(function (key, i) {
                params[key.name] = test[i];
            });
            registeredPath.callback(params);
            return found;
        });
        return found;
    };

    return { name: '@okwolo/router', register: register, fetch: fetch };
};

module.exports = blob;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var isarray = __webpack_require__(9)

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var defaultDelimiter = options && options.delimiter || '/'
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    var next = str[index]
    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var modifier = res[6]
    var asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var partial = prefix != null && next != null && next !== prefix
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = res[2] || defaultDelimiter
    var pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
    }
  }

  return function (obj, opts) {
    var path = ''
    var data = obj || {}
    var options = opts || {}
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = '(?:' + token.pattern + ')'

      keys.push(token)

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  var delimiter = escapeString(options.delimiter || '/')
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    deepCopy = _require.deepCopy;

var history = function history() {
    var initial = {};

    var past = [];
    var current = initial;
    var future = [];

    var historyLength = 20;
    var ignorePrefix = '*';

    var undoAction = {
        type: 'UNDO',
        target: [],
        handler: function handler() {
            if (past.length > 0 && past[past.length - 1] !== initial) {
                future.push(current);
                return past.pop();
            } else {
                return current;
            }
        }
    };

    var redoAction = {
        type: 'REDO',
        target: [],
        handler: function handler() {
            if (future.length > 0) {
                past.push(current);
                return future.pop();
            } else {
                return current;
            }
        }
    };

    var resetAction = {
        type: '__RESET__',
        target: [],
        handler: function handler() {
            past = [];
            future = [];
            return current;
        }
    };

    var updateState = function updateState(state, type) {
        if (type === '__RESET__' || type[0] === ignorePrefix) {
            return;
        }
        if (type !== 'UNDO' && type !== 'REDO') {
            future = [];
            past.push(current);
            if (past.length > historyLength + 1) {
                past.shift();
            }
        }
        current = deepCopy(state);
    };

    return {
        action: [undoAction, redoAction, resetAction],
        watcher: updateState
    };
};

module.exports = history;

/***/ })
/******/ ]);