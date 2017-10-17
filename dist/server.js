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
var serverRender = function serverRender(_ref) {
    var use = _ref.use,
        emit = _ref.emit;

    use({
        name: 'okwolo-server-render',
        draw: renderToString,
        update: renderToString,
        api: {
            setState: function setState(state) {
                return emit({ state: state });
            }
        }
    });
};

module.exports = core({
    modules: [__webpack_require__(3),
    // the dom blob is still required to parse the shorthand vdom syntax.
    // since this kit is intended to be used on a server, the extra size
    // should not be a big problem. since the blobs are added sequentially,
    // the draw and update will be overwritten.
    __webpack_require__(4), serverRender],
    options: {
        kit: 'server',
        browser: false
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    isFunction = _require.isFunction,
    isDefined = _require.isDefined,
    isObject = _require.isObject,
    assert = _require.assert,
    isBrowser = _require.isBrowser,
    makeBus = _require.makeBus;

// version cannot be taken from package.json because environment is not guaranteed.


var version = '1.3.0';

var core = function core(_ref) {
    var modules = _ref.modules,
        options = _ref.options;

    // if it is needed to define the window but not yet add a target, the first
    // argument can be set to undefined.
    var okwolo = function okwolo(target, _window) {
        // if the kit requires the browser api, there must be a window object in
        // scope or a window object must be injected as argument.
        if (options.browser) {
            if (!isDefined(_window)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                _window = window;
            }
        }

        var emit = makeBus();
        var use = makeBus();

        var primary = function primary() {};

        // the api function will contain all the exposed functions/variables.
        var api = function api() {
            return primary.apply(undefined, arguments);
        };

        api.emit = emit;
        api.use = use;

        use.on('api', function (_api) {
            assert(isObject(_api), 'core.use.api : additional api is not an object', _api);
            Object.assign(api, _api);
        });

        use.on('primary', function (_primary) {
            assert(isFunction(_primary), 'core.use.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach(function (_module) {
            _module(api, _window);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            use({ target: target });
        }

        return api;
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

module.exports = core;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

var dom = function dom(_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    var target = void 0;
    var builder = void 0;
    var build = void 0;
    var prebuild = void 0;
    var postbuild = void 0;
    var draw = void 0;
    var update = void 0;

    // stores an object returned by the draw and update functions. Since it is
    // also passed as an argument to update, it is convenient to store some
    // information about the current application's view in this variable.
    var view = void 0;

    // a copy of the state must be kept so that the view can be re-computed as
    // soon as any part of the rendering pipeline is modified.
    var state = void 0;

    // generates an object representing the view from the output of the builder.
    // note that it requires both the builder and the build functions to be
    // defined in order to complete successfully. they must be checked before
    // calling this function.
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

    // tracks whether the app has been drawn. this information is used to
    // determing if the update or draw function should be called.
    var hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // succesfully create and render.
    var canDraw = false;

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    var drawToTarget = function drawToTarget() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !hasDrawn;

        // canDraw is saved to avoid doing the four checks on every update/draw.
        // it is assumed that once all four variables are set the first time, they
        // will never again be invalid. this should be enforced by the bus listeners.
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state) && isDefined(build)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force) {
            view = update(target, create(state), view);
            return;
        }
        view = draw(target, create(state));
        hasDrawn = true;
    };

    emit.on('state', function (_state) {
        assert(isDefined(_state), 'dom.emit.state : new state is not defined', _state);
        state = _state;
        drawToTarget();
    });

    use.on('target', function (_target) {
        target = _target;
        drawToTarget(true);
    });

    use.on('builder', function (_builder) {
        assert(isFunction(_builder), 'dom.use.builder : builder is not a function', _builder);
        builder = _builder;
        drawToTarget();
    });

    use.on('draw', function (_draw) {
        assert(isFunction(_draw), 'dom.use.draw : new draw is not a function', _draw);
        draw = _draw;
        drawToTarget(true);
    });

    use.on('update', function (_update) {
        assert(isFunction(_update), 'dom.use.update : new target updater is not a function', _update);
        update = _update;
        drawToTarget();
    });

    use.on('build', function (_build) {
        assert(isFunction(_build), 'dom.use.build : new build is not a function', _build);
        build = _build;
        drawToTarget();
    });

    use.on('prebuild', function (newPrebuild) {
        assert(isFunction(newPrebuild), 'dom.use.prebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        drawToTarget();
    });

    use.on('postbuild', function (newPostbuild) {
        assert(isFunction(newPostbuild), 'dom.use.postbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        drawToTarget();
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    use({ api: {
            update: function update() {
                drawToTarget();
            }
        } });

    use({ primary: function primary(init) {
            use({ builder: init() });
            return;
        } });
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
    isFunction = _require.isFunction;

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

// shallow diff of two objects which returns an array of keys where the value is
// different. differences include keys who's values have been deleted or added.
// since there is no reliable way to compare function equality, they are always
// considered to be different.
var diff = function diff(original, successor) {
    return Object.keys(Object.assign({}, original, successor)).filter(function (key) {
        var valueOriginal = original[key];
        var valueSuccessor = successor[key];
        if (isFunction(valueOriginal) || isFunction(valueSuccessor)) {
            return true;
        }
        return valueOriginal !== valueSuccessor;
    });
};

// will build a vdom structure from the output of the app's builder funtions. this
// output must be valid element syntax, or an expception will be thrown.
var build = function build(element) {
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
    assert(isArray(element), 'dom.build : vdom object is not a recognized type', element);

    // early recursive return when the element is seen to be have the component syntax.
    if (isFunction(element[0])) {
        // leaving the props and children items undefined should not throw an error.
        var _element = element,
            _element2 = _slicedToArray(_element, 3),
            component = _element2[0],
            _element2$ = _element2[1],
            props = _element2$ === undefined ? {} : _element2$,
            _element2$2 = _element2[2],
            _children = _element2$2 === undefined ? [] : _element2$2;

        assert(isObject(props), 'dom.build : component\'s props is not an object', element, props);
        assert(isArray(_children), 'dom.build : component\'s children is not an array', element, _children);
        // the component function is called with an object containing the props
        // and an extra key with the children of this element.
        return build(component(Object.assign({}, props, { children: _children })));
    }

    var _element3 = element,
        _element4 = _slicedToArray(_element3, 3),
        tagType = _element4[0],
        _element4$ = _element4[1],
        attributes = _element4$ === undefined ? {} : _element4$,
        _element4$2 = _element4[2],
        children = _element4$2 === undefined ? [] : _element4$2;

    assert(isString(tagType), 'dom.build : tag property is not a string', element, tagType);
    assert(isObject(attributes), 'dom.build : attributes is not an object', element, attributes);
    assert(isArray(children), 'dom.build : children of vdom object is not an array', element, children);

    // regular expression to capture values from the shorthand element tag syntax.
    // it allows each section to be seperated by any amount of spaces, but enforces
    // the order of the capture groups (tagName #id .className | style)
    var match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
    assert(isArray(match), 'dom.build : tag property cannot be parsed', tagType);
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
            attributes.style += style + attributes.style;
        }
    }

    return {
        tagName: tagName,
        attributes: attributes,
        children: children.map(build)
    };
};

module.exports = function (_ref, _window) {
    var use = _ref.use;

    // recursively travels vdom to create rendered elements. after being rendered,
    // all vdom objects have a "DOM" key which references the created node. this
    // can be used in the update process to manipulate the real dom nodes.
    var render = function render(velem) {
        // the text key will only be present for text elements.
        if (isDefined(velem.text)) {
            velem.DOM = _window.document.createTextNode(velem.text);
            return velem;
        }
        var element = _window.document.createElement(velem.tagName);
        // attributes are added onto the node.
        Object.assign(element, velem.attributes);
        // all children are rendered and immediately appended into the parent node
        // in the same order that they appear in the children array.
        Object.keys(velem.children).forEach(function (key) {
            var _render = render(velem.children[key]),
                DOM = _render.DOM;

            element.appendChild(DOM);
        });
        velem.DOM = element;
        return velem;
    };

    // initial draw to target will wipe the contents of the container node.
    var draw = function draw(target, vdom) {
        // the target's type is not enforced by the module and it needs to be
        // done at this point. this is done to decouple the dom module from
        // the browser (but cannot be avoided in this blob).
        assert(isNode(target), 'dom.draw : target is not a DOM node', target);
        render(vdom);
        _window.requestAnimationFrame(function () {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    // updates the existing vdom object and its html nodes to be consistent with
    // the new vdom object.
    var update = function update(target, newVdom, vdom) {
        // responsibility of checking the target's type is deferred to the blobs.
        assert(isNode(target), 'dom.update : target is not a DOM node', target);

        // recursive function to update an element according to new state. the
        // parent and the element's parent index must be passed in order to make
        // modifications to the vdom object in place.
        var _update = function _update(original, successor, originalParent, parentIndex) {
            // covers an uncommon edge case.
            if (!isDefined(original) && !isDefined(successor)) {
                return;
            }

            // lack of original element implies the successor is a new element.
            if (!isDefined(original)) {
                originalParent.children[parentIndex] = render(successor);
                originalParent.DOM.appendChild(originalParent.children[parentIndex].DOM);
                return;
            }

            // lack of successor element implies the original is being removed.
            if (!isDefined(successor)) {
                originalParent.DOM.removeChild(original.DOM);
                delete originalParent.children[parentIndex];
                return;
            }

            // if the element's tagName has changed, the whole element must be
            // replaced. this will also capture the case where an html node is
            // being transformed into a text node since the text node's vdom
            // object will not contain a tagName.
            if (original.tagName !== successor.tagName) {
                var oldDOM = original.DOM;
                var newVDOM = render(successor);
                originalParent.DOM.replaceChild(newVDOM.DOM, oldDOM);
                // this technique is used to modify the vdom object in place.
                // both the text element and the tag element props are reset
                // since the types are not recorded.
                Object.assign(original, {
                    DOM: undefined,
                    text: undefined,
                    tagName: undefined,
                    attributes: undefined,
                    children: undefined
                }, newVDOM);
                return;
            }

            // nodeType of three indicates that the HTML node is a textNode.
            // at this point in the function it has been estblished that the
            // original and successor nodes are of the same type.
            if (original.DOM.nodeType === 3) {
                if (original.text !== successor.text) {
                    original.DOM.nodeValue = successor.text;
                    original.text = successor.text;
                }
                return;
            }

            var attributesDiff = diff(original.attributes, successor.attributes);
            attributesDiff.forEach(function (key) {
                original.attributes[key] = successor.attributes[key];
                original.DOM[key] = successor.attributes[key];
            });

            var max = Math.max(original.children.length, successor.children.length);
            for (var i = 0; i < max; ++i) {
                _update(original.children[i], successor.children[i], original, i);
            }
        };

        _window.requestAnimationFrame(function () {
            _update(vdom, newVdom, { DOM: target, children: [vdom] }, 0);
        });

        // TODO vdom object is modified after being returned.
        return vdom;
    };

    use({
        name: '@okwolo/dom',
        draw: draw,
        update: update,
        build: build
    });
};

/***/ })
/******/ ]);