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
    // all typechecks must always return a boolean value.
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
    var isNumber = function isNumber(value) {
        return typeof value === 'number';
    };
    var isBoolean = function isBoolean(value) {
        return typeof value === 'boolean';
    };
    var isObject = function isObject(value) {
        return !!value && value.constructor === Object;
    };
    var isNode = function isNode(value) {
        return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
    };
    var isRegExp = function isRegExp(value) {
        return value instanceof RegExp;
    };

    // there cannot be any assumptions about the environment globals so
    // node's process should not be used.
    var isBrowser = function isBrowser() {
        return typeof window !== 'undefined';
    };

    var deepCopy = function deepCopy(obj) {
        // undefined value would otherwise throw an error at parsing time.
        if (!isDefined(obj)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    };

    // will throw an error containing the message and the culprits if the
    // assertion is falsy. the message is expected to contain information
    // about the location of the error followed by a meaningful error message.
    // (ex. "router.redirect : url is not a string")
    var assert = function assert(assertion, message) {
        for (var _len = arguments.length, culprits = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            culprits[_key - 2] = arguments[_key];
        }

        var print = function print(obj) {
            // formatted printing of any culript value. it uses a custom
            // replacer function to handle functions and print them instead
            // of ignoring them. the output is also formatted and indented
            // to four spaces from the left.
            return '\n>>> ' + String(JSON.stringify(obj, function (key, value) {
                return typeof value === 'function' ? value.toString() : value;
            }, 2)).replace(/\n/g, '\n    ');
        };
        if (!assertion) {
            throw new Error('@okwolo.' + message + culprits.map(print).join(''));
        }
    };

    // this function will create a queue object which can be used to defer
    // the execution of functions.
    var makeQueue = function makeQueue() {
        var queue = [];

        // runs the first function in the queue if it exists. this specifically
        // does not call done or remove the function from the queue since there
        // is no knowledge about whether or not the function has completed. this
        // means that the queue will wait for a done signal before running any
        // other element.
        var run = function run() {
            var func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };

        // adds a function to the queue and calls run if the queue was empty.
        var add = function add(func) {
            assert(isFunction(func), 'utils.makeQueue.add : added objects must be a function', func);
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };

        // removes the first element from the queue and calls run. note that
        // it is not possible to pre-call done in order to have multiple
        // functions execute immediately.
        var done = function done() {
            // calling shift on an empty array does nothing.
            queue.shift();
            run();
        };

        return { add: add, done: done };
    };

    // a bus construct created by this function is exposed by the use interface.
    // in this context, the term event is used instead of blob.
    var makeBus = function makeBus() {
        // stores arrays of handlers for each event key.
        var handlers = {};
        // stores names from named events to enforce uniqueness.
        var names = {};

        // attaches a handler to a specific event key.
        var on = function on(type, handler) {
            assert(isString(type), 'utils.bus : handler type is not a string', type);
            assert(isFunction(handler), 'utils.bus : handler is not a function', handler);
            if (!isDefined(handlers[type])) {
                handlers[type] = [];
            }
            handlers[type].push(handler);
        };

        // accepts events and invokes the appropriate handlers for each key.
        var handle = function handle(event) {
            assert(isObject(event), 'utils.bus : event is not an object', event);
            var name = event.name;

            if (isDefined(name)) {
                assert(isString(name), 'utils.bus : event name is not a string', name);
                // early return if the name has been used before.
                if (isDefined(names[name])) {
                    return;
                }
                names[name] = true;
            }
            Object.keys(event).forEach(function (key) {
                if (!isDefined(handlers[key])) {
                    return;
                }
                handlers[key].forEach(function (handler) {
                    return handler(event[key]);
                });
            });
        };

        return Object.assign(handle, { on: on });
    };

    return {
        deepCopy: deepCopy,
        assert: assert,
        isDefined: isDefined,
        isNull: isNull,
        isArray: isArray,
        isFunction: isFunction,
        isString: isString,
        isNumber: isNumber,
        isBoolean: isBoolean,
        isObject: isObject,
        isNode: isNode,
        isRegExp: isRegExp,
        isBrowser: isBrowser,
        makeQueue: makeQueue,
        makeBus: makeBus
    };
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

// the tags appearing in this map will be represented as singletons.


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

// target is used as a callback for the string output of rendering the vdom object.
var renderToString = function renderToString(target, _vdom) {
    // string used to indent each level of the rendered dom.
    var indentString = '  ';
    assert(isFunction(target), 'server.dom.draw : target is not a function', target);
    // the return value of this function is an array of lines. the reason for
    // this is that nested tags need extra indentation and this function is
    // recursive. extra spaces can easily be appended to each line appearing
    // in the result of the render of a child.
    var render = function render() {
        var vdom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { text: '' };

        if (isDefined(vdom.text)) {
            return [vdom.text];
        }
        // the input of this function can be assumed to be proper vdom syntax
        // since it has already been parsed and "transpiled" by the dom
        // module's "build" blob.
        var tagName = vdom.tagName,
            _vdom$attributes = vdom.attributes,
            attributes = _vdom$attributes === undefined ? {} : _vdom$attributes,
            _vdom$children = vdom.children,
            children = _vdom$children === undefined ? [] : _vdom$children;

        var formattedAttributes = Object.keys(attributes).map(function (key) {
            // since the class attribute is written as className in the
            // vdom, a translation must be hardcoded.
            if (key === 'className') {
                key = 'class';
                attributes.class = attributes.className;
            }
            return key + '="' + attributes[key].toString() + '"';
        }).join(' ');
        // to correctly catch tags written with uppercase letters.
        tagName = tagName.toLowerCase();
        // early return in the case the element is a recognized singleton.
        // there it also checks that the element does not have descendents.
        if (isDefined(singletons[tagName]) && children.length < 1) {
            return ['<' + (tagName + ' ' + formattedAttributes).trim() + ' />'];
        }
        var contents = children
        // cannot use a simple map because render returns an array of lines
        // which all need to be indented.
        .reduce(function (acc, child) {
            return acc.concat(render(child));
        }, []).map(function (line) {
            return indentString + line;
        });
        return ['<' + (tagName + ' ' + formattedAttributes).trim() + '>'].concat(_toConsumableArray(contents), ['</' + tagName + '>']);
    };
    target(render(_vdom).join('\n'));
};

// blob generating function that is expected in the configuration object.
var serverRender = function serverRender() {
    return {
        name: 'okwolo-server-render',
        draw: renderToString,
        update: renderToString
    };
};

module.exports = core({
    modules: [__webpack_require__(3)],
    blobs: [
    // the dom blob is still required to parse the shorthand vdom syntax.
    // since this kit is intended to be used on a server, the extra size
    // should not be a big problem. since the blobs are added sequentially,
    // the draw and update will be overwritten.
    __webpack_require__(4), serverRender],
    options: {
        kit: 'server',
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
    makeBus = _require.makeBus;

var version = '1.3.0';

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

        var emit = makeBus();
        var use = makeBus();
        var api = { emit: emit, use: use };

        modules.forEach(function (_module) {
            _module({ emit: emit, use: use }, _window);
        });

        blobs.forEach(function (blob) {
            use(blob(_window));
        });

        var initial = {};
        var _state = initial;

        emit.on('state', function (newState) {
            _state = newState;
        });

        api.getState = function () {
            assert(_state !== initial, 'getState : cannot get state before it has been set');
            return deepCopy(_state);
        };

        if (options.modules.dom) {
            api.update = function () {
                emit({ state: _state });
            };

            if (isDefined(target)) {
                use({ target: target });
            }
        }

        if (options.modules.state) {
            api.act = function (type, params) {
                assert(type === 'SET_STATE' || _state !== initial, 'act : cannot act on state before it has been set');
                emit({ act: { state: _state, type: type, params: params } });
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
                    emit({ state: replacement(deepCopy(_state)) });
                    return;
                }
                emit({ state: replacement });
            };
        }

        if (options.modules.router) {
            api.redirect = function (path, params) {
                emit({ redirect: { path: path, params: params } });
            };

            api.show = function (path, params) {
                emit({ show: { path: path, params: params } });
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
        okwolo.version = version;
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
    var emit = _ref.emit,
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

    emit.on('state', function (newState) {
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


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isNull = _require.isNull,
    isArray = _require.isArray,
    isString = _require.isString,
    isNumber = _require.isNumber,
    isBoolean = _require.isBoolean,
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
        if (isBoolean(element)) {
            element = null;
        }
        if (isNull(element)) {
            return { text: '' };
        }
        if (isNumber(element)) {
            element = String(element);
        }
        if (isString(element)) {
            return { text: element };
        }
        assert(isArray(element), 'dom.build : vdom object is not a recognized type', element);
        if (isFunction(element[0])) {
            var props = element[1] || {};
            assert(isObject(props), 'dom.build : component\'s props is not an object', element, props);
            var _children = element[2] || [];
            assert(isArray(_children), 'dom.build : component\'s children is not an array', element, _children);
            return build(element[0](Object.assign({}, props, { children: _children })));
        }

        var _element = element,
            _element2 = _slicedToArray(_element, 3),
            tagType = _element2[0],
            attributes = _element2[1],
            children = _element2[2];

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