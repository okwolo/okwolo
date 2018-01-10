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


// internal function that wraps JSON.stringify

var prettyPrint = function prettyPrint(obj) {
    // uses a custom replacer to correctly handle functions
    var stringified = JSON.stringify(obj, function (key, value) {
        return typeof value === 'function' ? value.toString() : value;
    }, 2);

    // stringified value is passed through the String constructor to
    // correct for the "undefined" case. each line is then indented.
    var indented = String(stringified).replace(/\n/g, '\n    ');

    return '\n>>> ' + indented;
};

// all typechecks should only return bools.
module.exports.isDefined = function (value) {
    return value !== undefined;
};

module.exports.isNull = function (value) {
    return value === null;
};

module.exports.isArray = function (value) {
    return Array.isArray(value);
};

module.exports.isFunction = function (value) {
    return typeof value === 'function';
};

module.exports.isString = function (value) {
    return typeof value === 'string';
};

module.exports.isNumber = function (value) {
    return typeof value === 'number';
};

module.exports.isBoolean = function (value) {
    return typeof value === 'boolean';
};

module.exports.isObject = function (value) {
    return !!value && value.constructor === Object;
};

module.exports.isNode = function (value) {
    return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
};

module.exports.isRegExp = function (value) {
    return value instanceof RegExp;
};

// there cannot be any assumptions about the environment globals so
// node's process should not be used.
module.exports.isBrowser = function () {
    return typeof window !== 'undefined';
};

module.exports.deepCopy = function (obj) {
    // undefined value would otherwise throw an error at parsing time.
    if (obj === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(obj));
};

// will throw an error containing the message and the culprits if the
// assertion is falsy. the message is expected to contain information
// about the location of the error followed by a meaningful error message.
// (ex. "router.redirect : url is not a string")
module.exports.assert = function (assertion, message) {
    for (var _len = arguments.length, culprits = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        culprits[_key - 2] = arguments[_key];
    }

    if (!assertion) {
        throw new Error('@okwolo.' + message + culprits.map(prettyPrint).join(''));
    }
};

// this function will create a queue object which can be used to defer
// the execution of functions.
module.exports.makeQueue = function () {
    var queue = [];

    // runs the first function in the queue if it exists. this specifically
    // does not call done or remove the function from the queue since there
    // is no knowledge about whether or not the function has completed. this
    // means that the queue will wait for a done signal before running any
    // other element.
    var run = function run() {
        var func = queue[0];
        if (func) {
            func();
        }
    };

    // adds a function to the queue and calls run if the queue was empty.
    var add = function add(func) {
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var core = __webpack_require__(2);

module.exports = core({
    modules: [__webpack_require__(3), __webpack_require__(4), __webpack_require__(5), __webpack_require__(6)],
    options: {
        kit: 'server',
        browser: false
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0),
    assert = _require.assert,
    isArray = _require.isArray,
    isBrowser = _require.isBrowser,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction,
    isObject = _require.isObject,
    isString = _require.isString;

// version cannot be taken from package.json because environment is not guaranteed.


var version = '3.0.0';

var makeBus = function makeBus() {
    // stores arrays of handlers for each event key.
    var handlers = {};
    // stores names from named events to enforce uniqueness.
    var names = {};

    // attaches a handler to a specific event key.
    var on = function on(type, handler) {
        assert(isString(type), 'on : handler type is not a string', type);
        assert(isFunction(handler), 'on : handler is not a function', handler);
        if (!isDefined(handlers[type])) {
            handlers[type] = [];
        }
        handlers[type].push(handler);
    };

    var send = function send(type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        assert(isString(type), 'send : event type is not a string', type);
        var eventHandlers = handlers[type];
        if (!isArray(eventHandlers)) {
            return;
        }
        for (var i = 0; i < eventHandlers.length; ++i) {
            eventHandlers[i].apply(eventHandlers, args);
        }
    };

    var use = function use(blob) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        // scopes event type to being a blob.
        if (isString(blob)) {
            send.apply(undefined, ['blob.' + blob].concat(args));
            return;
        }

        assert(isObject(blob), 'use : blob is not an object', blob);

        var name = blob.name;

        if (isDefined(name)) {
            assert(isString(name), 'utils.bus : blob name is not a string', name);
            // early return if the name has been used before.
            if (isDefined(names[name])) {
                return;
            }
            names[name] = true;
        }

        // sending all blob keys.
        var keys = Object.keys(blob);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            send('blob.' + key, blob[key]);
        }
    };

    return { on: on, send: send, use: use };
};

module.exports = function () {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _config$modules = config.modules,
        modules = _config$modules === undefined ? [] : _config$modules,
        _config$options = config.options,
        options = _config$options === undefined ? {} : _config$options;

    assert(isArray(modules), 'core : passed modules must be an array');
    assert(isObject(options), 'core : passed options must be an object');

    // if it is needed to define the window but not yet add a target, the first
    // argument can be set to undefined.
    var okwolo = function okwolo(target, global) {
        // if the kit requires the browser api, there must be a window object in
        // scope or a window object must be injected as argument.
        if (options.browser) {
            if (!isDefined(global)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                global = window;
            }
        }

        // primary function will be called when app is called, it is stored
        // outside of the app function so that it can be replaced after the
        // creation of the app object without breaking all references to app.
        var primary = function primary() {};

        // the api will be added to the app function, it is returned when a
        // new app is created.
        var app = function app() {
            return primary.apply(undefined, arguments);
        };

        Object.assign(app, makeBus());

        app.on('blob.api', function (api, override) {
            assert(isObject(api), 'on.blob.api : additional api is not an object', api);
            Object.keys(api).forEach(function (key) {
                if (!override) {
                    assert(!app[key], 'on.blob.api : cannot add key "' + key + '" because it is already defined');
                }
                app[key] = api[key];
            });
        });

        app.on('blob.primary', function (_primary) {
            assert(isFunction(_primary), 'on.blob.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach(function (_module) {
            _module({
                on: app.on,
                send: app.send
            }, global);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            app.use('target', target);
        }

        return app;
    };

    // okwolo attempts to define itself globally and includes information about
    // the version number and kit name. note that different kits can coexist,
    // but not two kits with the same name and different versions.
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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires   update       [view]
// @fires   blob.api     [core]
// @fires   blob.primary [core]
// @listens state
// @listens sync
// @listens update
// @listens blob.build
// @listens blob.builder
// @listens blob.draw
// @listens blob.target
// @listens blob.update

var _require = __webpack_require__(0),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
    var on = _ref.on,
        send = _ref.send;

    var target = void 0;
    var builder = void 0;
    var build = void 0;
    var draw = void 0;
    var update = void 0;

    // stores an object returned by the draw and update functions. Since it is
    // also passed as an argument to update, it is convenient to store some
    // information about the current application's view in this variable.
    var view = void 0;

    // a copy of the state must be kept so that the view can be re-computed as
    // soon as any part of the rendering pipeline is modified.
    var state = void 0;

    on('blob.target', function (_target) {
        target = _target;
        send('update', true);
    });

    on('blob.builder', function (_builder) {
        assert(isFunction(_builder), 'on.blob.builder : builder is not a function', _builder);
        builder = _builder;
        send('update', false);
    });

    on('blob.draw', function (_draw) {
        assert(isFunction(_draw), 'on.blob.draw : new draw is not a function', _draw);
        draw = _draw;
        send('update', true);
    });

    on('blob.update', function (_update) {
        assert(isFunction(_update), 'on.blob.update : new target updater is not a function', _update);
        update = _update;
        send('update', false);
    });

    on('blob.build', function (_build) {
        assert(isFunction(_build), 'on.blob.build : new build is not a function', _build);
        build = _build;
        send('update', false);
    });

    on('state', function (_state) {
        assert(isDefined(_state), 'on.blob.state : new state is not defined', _state);
        state = _state;
        send('update', false);
    });

    // tracks whether the app has been drawn. this information is used to
    // determing if the update or draw function should be called.
    var hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // succesfully create and render.
    var canDraw = false;

    // logs an error if the view has not been drawn after the delay since
    // the first time it was called. the update event calls this function
    // each time it cannot draw.
    var delay = 3000;
    var waitTimer = null;
    var waiting = function waiting() {
        if (waitTimer) {
            return;
        }
        waitTimer = setTimeout(function () {
            // formatting all blocking variables into an error message.
            var vals = { builder: builder, state: state, target: target };
            Object.keys(vals).forEach(function (key) {
                vals[key] = vals[key] ? 'ok' : 'waiting';
            });
            // assertion error in the timeout will not interrupt execution.
            assert(canDraw, 'view : still waiting to draw after ' + Math.round(delay / 1000) + 's', vals);
        }, delay);
    };

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    on('update', function (redraw) {
        // canDraw is saved to avoid doing the four checks on every update/draw.
        // it is assumed that once all four variables are set the first time, they
        // will never again be invalid. this should be enforced by the bus listeners.
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state)) {
                canDraw = true;
            } else {
                return waiting();
            }
        }
        if (redraw || !hasDrawn) {
            view = draw(target, build(builder(state)));
            hasDrawn = true;
            return;
        }
        view = update(target, build(builder(state)), [], view);
    });

    // message which allows for scoped updates. since the successor argument is
    // not passed through the build/builder pipeline, it's use is loosely
    // restricted to the build module (which should have a reference to itself).
    on('sync', function (address, successor) {
        assert(hasDrawn, 'view.sync : cannot sync component before app has drawn');
        view = update(target, successor, address, view);
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    send('blob.api', {
        update: function update() {
            return send('update', false);
        }
    });

    // primary functionality will be to replace buider. this is overwritten
    // by router modules to more easily associate routes to builders.
    send('blob.primary', function (init) {
        send('blob.builder', init());
    });
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires sync       [view]
// @fires blob.build [view]

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = __webpack_require__(0),
    assert = _require.assert,
    isArray = _require.isArray,
    isBoolean = _require.isBoolean,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction,
    isNull = _require.isNull,
    isNumber = _require.isNumber,
    isObject = _require.isObject,
    isString = _require.isString;

// ancestry helper which ensures immutability and handles common logic.
// ancestry list is recorded in reverse for easier access to the last (first)
// element. all elements take the form of objects with the "tag" and "key" keys
// which are not guaranteed to be defined. (ex. first list element has no key,
// but does have a tag since it is the root node)


var geneologist = function geneologist() {
    var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var formatted = null;

    // keys are only know by parents and will therefore always be added
    // before the child adds its own tag.
    var addKey = function addKey(key) {
        return geneologist([{ key: key }].concat(list));
    };

    // first tag in the list does not have a key. all subsequent tags are added
    // to the first array element (most recent descendant).
    var addTag = function addTag(tag) {
        if (list.length === 0) {
            return geneologist([{ tag: tag }]);
        }
        var l = list.slice();
        l[0].tag = tag;
        return geneologist(l);
    };

    // formats the list to be consumed by assertions.
    var f = function f() {
        // memoization to prevent unnecessarily re-running the logic.
        if (!isNull(formatted)) {
            return formatted;
        }
        formatted = 'root';
        for (var i = list.length - 1; i >= 0; --i) {
            formatted += ' -> ';
            var _list$i = list[i],
                tag = _list$i.tag,
                key = _list$i.key;
            // list elements without a tag will show the key instead.

            if (!isString(tag)) {
                formatted += '{{' + key + '}}';
                continue;
            }
            // tag's style is removed to reduce clutter.
            formatted += tag.replace(/\|\s*[^]*$/g, '| ...');
        }
        return formatted;
    };

    var keyList = function keyList() {
        var temp = [];
        if (list.length < 2) {
            return [];
        }
        // skip the last array element (tag without key)
        var start = list.length - 2;
        for (var i = start; i >= 0; --i) {
            temp.push(String(list[i].key));
        }
        return temp;
    };

    return { addKey: addKey, addTag: addTag, f: f, keyList: keyList };
};

// simulates the behavior of the classnames npm package. strings are concatenated,
// arrays are spread and objects keys are included if their value is truthy.
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

module.exports = function (_ref) {
    var send = _ref.send;

    // will build a vdom structure from the output of the app's builder funtions. this
    // output must be valid element syntax, or an expception will be thrown.
    var build = function build(element) {
        var ancestry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : geneologist();

        // boolean values will produce no visible output to make it easier to use inline
        // logical expressions without worrying about unexpected strings on the page.
        if (isBoolean(element)) {
            element = null;
        }
        // null elements will produce no visible output. undefined is intentionally not
        // handled since it is often produced as a result of an unexpected builder output
        // and it should be made clear that something went wrong.
        if (isNull(element)) {
            return { text: '' };
        }
        // in order to simplify type checking, numbers are stringified.
        if (isNumber(element)) {
            element = String(element);
        }
        // strings will produce textNodes when rendered to the browser.
        if (isString(element)) {
            return { text: element };
        }

        // the only remaining element types are formatted as arrays.
        assert(isArray(element), 'view.build : vdom object is not a recognized type', ancestry.f(), element);

        // early recursive return when the element is seen to be have the component syntax.
        if (isFunction(element[0])) {
            // leaving the props or children items undefined should not throw an error.
            var _element = element,
                _element2 = _slicedToArray(_element, 3),
                component = _element2[0],
                _element2$ = _element2[1],
                props = _element2$ === undefined ? {} : _element2$,
                _element2$2 = _element2[2],
                _children = _element2$2 === undefined ? [] : _element2$2;

            assert(isObject(props), 'view.build : component\'s props is not an object', ancestry.f(), element, props);
            assert(isArray(_children), 'view.build : component\'s children is not an array', ancestry.f(), element, _children);

            // component generator is given to update function and used to create
            // the inital version of the component.
            var gen = void 0;
            var update = function update() {
                send('sync', ancestry.keyList(), build(gen.apply(undefined, arguments), ancestry));
            };
            gen = component(Object.assign({}, props, { children: _children }), update);
            return build(gen(), ancestry);
        }

        var _element3 = element,
            _element4 = _slicedToArray(_element3, 3),
            tagType = _element4[0],
            _element4$ = _element4[1],
            attributes = _element4$ === undefined ? {} : _element4$,
            _element4$2 = _element4[2],
            childList = _element4$2 === undefined ? [] : _element4$2;

        assert(isString(tagType), 'view.build : tag property is not a string', ancestry.f(), element, tagType);
        assert(isObject(attributes), 'view.build : attributes is not an object', ancestry.f(), element, attributes);
        assert(isArray(childList), 'view.build : children of vdom object is not an array', ancestry.f(), element, childList);

        // regular expression to capture values from the shorthand element tag syntax.
        // it allows each section to be seperated by any amount of spaces, but enforces
        // the order of the capture groups (tagName #id .className | style)
        var match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
        assert(isArray(match), 'view.build : tag property cannot be parsed', ancestry.f(), tagType);
        // first element is not needed since it is the entire matched string. default
        // values are not used to avoid adding blank attributes to the nodes.

        var _match = _slicedToArray(match, 5),
            tagName = _match[1],
            id = _match[2],
            className = _match[3],
            style = _match[4];

        // priority is given to the id defined in the attributes.


        if (isDefined(id) && !isDefined(attributes.id)) {
            attributes.id = id.trim();
        }

        // class names from both the tag and the attributes are used.
        if (isDefined(attributes.className) || isDefined(className)) {
            attributes.className = classnames(attributes.className, className).replace(/\./g, ' ').replace(/  +/g, ' ').trim();
        }

        if (isDefined(style)) {
            if (!isDefined(attributes.style)) {
                attributes.style = style;
            } else {
                // extra semicolon is added if not present to prevent conflicts.
                style = (style + ';').replace(/;;$/g, ';');
                // styles defined in the attributes are given priority by being
                // placed after the ones from the tag.
                attributes.style = style + attributes.style;
            }
        }

        // ancestry is recorded to give more context to error messages
        // console.log(ancestry.f());
        ancestry = ancestry.addTag(tagType);

        // childList is converted to a children object with each child having its
        // own key. the child order is also recorded.
        var children = {};
        var childOrder = [];
        for (var i = 0; i < childList.length; ++i) {
            var childElement = childList[i];
            var key = i;
            var child = build(childElement, ancestry.addKey(key));
            // a key attribute will override the default array index key.
            if (child.attributes && 'key' in child.attributes) {
                key = child.attributes.key;
                assert(isNumber(key) || isString(key), 'view.build : invalid element key type', ancestry.f(), key);
                assert(String(key).match(/^[\w\d-_]+$/g), 'view.build : invalid character in element key', ancestry.f(), key);
            }
            // keys are normalized to strings to properly compare them.
            key = String(key);
            assert(!children[key], 'view.build : duplicate child key', ancestry.f(), key);
            childOrder.push(key);
            children[key] = child;
        }

        return {
            tagName: tagName,
            attributes: attributes,
            children: children,
            childOrder: childOrder
        };
    };

    send('blob.build', build);
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires blob.draw   [view]
// @fires blob.update [view]

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = __webpack_require__(0),
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
    assert(isFunction(target), 'view.string.draw : target is not a function', target);
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
            children = _vdom$children === undefined ? {} : _vdom$children,
            _vdom$childOrder = vdom.childOrder,
            childOrder = _vdom$childOrder === undefined ? [] : _vdom$childOrder;

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
        if (isDefined(singletons[tagName]) && childOrder.length < 1) {
            return ['<' + (tagName + ' ' + formattedAttributes).trim() + ' />'];
        }
        var contents = childOrder.map(function (key) {
            return children[key];
        })
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
module.exports = function (_ref) {
    var send = _ref.send;

    send('blob.draw', renderToString);
    send('blob.update', renderToString);
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires   state        [state]
// @fires   blob.api     [core]
// @fires   blob.handler [state]
// @listens state
// @listens blob.handler

var _require = __webpack_require__(0),
    assert = _require.assert,
    deepCopy = _require.deepCopy,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
    var on = _ref.on,
        send = _ref.send;

    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    var initial = {};
    var state = initial;

    var handler = void 0;

    // current state is monitored and stored.
    on('state', function (newState) {
        state = newState;
    });

    on('blob.handler', function (handlerGen) {
        assert(isFunction(handlerGen), 'on.blob.handler : handler generator is not a function', handlerGen);
        // handler generator is given direct access to the state.
        var _handler = handlerGen(function () {
            return state;
        });
        assert(isFunction(_handler), 'on.blob.handler : handler from generator is not a function', _handler);
        handler = _handler;
    });

    send('blob.handler', function () {
        return function (newState) {
            send('state', newState);
        };
    });

    var setState = function setState(replacement) {
        var newState = isFunction(replacement) ? replacement(deepCopy(state)) : replacement;
        handler(newState);
    };

    var getState = function getState() {
        assert(state !== initial, 'state.getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // expose module's features to the app.
    send('blob.api', {
        setState: setState,
        getState: getState
    });
};

/***/ })
/******/ ]);