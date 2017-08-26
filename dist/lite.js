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

var createPattern = function createPattern(path) {
    var pattern = path
    // escape special characters
    .replace(/([^\w:])/g, '\\$1')
    // replace tags with a matching group
    .replace(/:(\w+)/g, '([^/]*)');
    return new RegExp('^' + pattern + '(\\?.*)?$');
};

var liteRouter = {
    name: 'okwolo-lite-router',
    register: function register() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var callback = arguments[2];

        if (!isArray(store)) {
            store = [];
        }
        store.push({
            pattern: createPattern(path),
            callback: callback
        });
        return store;
    },
    fetch: function fetch() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var found = false;
        store.find(function (registeredPath) {
            var test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            found = true;
            test.shift();
            var keys = registeredPath.toString().match(/:\w+/g);
            keys.forEach(function (key, i) {
                params[key.name] = test[i];
            });
            registeredPath.callback(params);
            return found;
        });
        return found;
    }
};

module.exports = core({
    modules: [__webpack_require__(3), __webpack_require__(4)],
    blobs: [__webpack_require__(5), liteRouter],
    options: {
        bundle: 'lite',
        browser: true,
        modules: {
            state: false,
            history: false,
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

/***/ }),
/* 4 */
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
/* 5 */
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

/***/ })
/******/ ]);