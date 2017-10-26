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


module.exports = function () {
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var core = __webpack_require__(2);

module.exports = core({
    modules: [__webpack_require__(3), __webpack_require__(4), __webpack_require__(5), __webpack_require__(6), __webpack_require__(7), __webpack_require__(8), __webpack_require__(9), __webpack_require__(11)],
    options: {
        kit: 'standard',
        browser: true
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

module.exports = function (_ref) {
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

        // primary function will be called when app is called, it is stored
        // outside of the app function so that it can be replaced after the
        // creation of the app object without breaking all references to app.
        var primary = function primary() {};

        // the api will be added to the app function, it is returned when a
        // new app is created.
        var app = function app() {
            return primary.apply(undefined, arguments);
        };

        app.emit = makeBus();
        app.use = makeBus();

        app.use.on('api', function (api) {
            assert(isObject(api), 'core.use.api : additional api is not an object', api);
            Object.assign(app, api);
        });

        app.use.on('primary', function (_primary) {
            assert(isFunction(_primary), 'core.use.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach(function (_module) {
            _module(app, _window);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            app.use({ target: target });
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


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
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

    use.on('target', function (_target) {
        target = _target;
        emit({ update: true });
    });

    use.on('builder', function (_builder) {
        assert(isFunction(_builder), 'dom.use.builder : builder is not a function', _builder);
        builder = _builder;
        emit({ update: false });
    });

    use.on('draw', function (_draw) {
        assert(isFunction(_draw), 'dom.use.draw : new draw is not a function', _draw);
        draw = _draw;
        emit({ update: true });
    });

    use.on('update', function (_update) {
        assert(isFunction(_update), 'dom.use.update : new target updater is not a function', _update);
        update = _update;
        emit({ update: false });
    });

    use.on('build', function (_build) {
        assert(isFunction(_build), 'dom.use.build : new build is not a function', _build);
        build = _build;
        emit({ update: false });
    });

    use.on('prebuild', function (newPrebuild) {
        assert(isFunction(newPrebuild), 'dom.use.prebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        emit({ update: false });
    });

    use.on('postbuild', function (newPostbuild) {
        assert(isFunction(newPostbuild), 'dom.use.postbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        emit({ update: false });
    });

    emit.on('state', function (_state) {
        assert(isDefined(_state), 'dom.emit.state : new state is not defined', _state);
        state = _state;
        emit({ update: false });
    });

    // tracks whether the app has been drawn. this information is used to
    // determing if the update or draw function should be called.
    var hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // succesfully create and render.
    var canDraw = false;

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    emit.on('update', function (force) {
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
        if (!force && hasDrawn) {
            view = update(target, create(state), view);
            return;
        }
        view = draw(target, create(state));
        hasDrawn = true;
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    use({ api: {
            update: function update() {
                return emit({ update: false });
            }
        } });

    // primary functionality will be to replace buider. this is overwritten
    // by router modules to more easily associate routes to builders.
    use({ primary: function primary(init) {
            return use({ builder: init() });
        } });
};

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
        draw: draw,
        update: update,
        build: build
    });
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    deepCopy = _require.deepCopy,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    var initial = {};
    var state = initial;

    var handler = void 0;

    use.on('handler', function (_handler) {
        assert(isFunction(_handler), 'state.use.handler : handler is not a function', handler);
        handler = _handler;
    });

    use({ handler: function handler(newState) {
            emit({ state: newState });
        } });

    // current state is monitored and stored.
    emit.on('state', function (newState) {
        state = newState;
    });

    emit.on('read', function (callback) {
        callback(state);
    });

    var setState = function setState(replacement) {
        var newState = isFunction(replacement) ? replacement(deepCopy(state)) : replacement;
        handler(newState);
    };

    var getState = function getState() {
        assert(state !== initial, 'getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // expose module's features to the app.
    use({ api: {
            setState: setState,
            getState: getState
        } });
};

/***/ }),
/* 6 */
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

module.exports = function (_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    // this module defines an action which overrides the whole state while
    // giving visibility to the middleware and watchers.
    var overrideActionType = 'SET_STATE';

    var stateHasBeenOverwritten = false;

    // actions is a map where actions are stored in an array at their type key.
    var actions = {};
    var middleware = [];
    var watchers = [];

    // this queue is used to ensure that an action, the middleware and the
    // watchers all get called before a second action can be done. this is
    // relevant in the case where an action is called from within a watcher.
    // it does not however support waiting for any async code.
    var queue = makeQueue();

    var execute = function execute(state, type, params) {
        // this value will represent the state after executing the action(s).
        // it must be copied since all the middleware functions can still
        // potentially have access to it.
        var newState = deepCopy(state);
        assert(isDefined(actions[type]), 'state.execute : action type \'' + type + '\' was not found');

        // action types with multiple actions are executed in the order they are added.
        actions[type].forEach(function (currentAction) {
            var targetAddress = currentAction.target;

            // if the target is a function, it is executed with the current state.
            if (isFunction(targetAddress)) {
                targetAddress = targetAddress(deepCopy(state), params);
                // since the typechecks cannot be ran when the action is added,
                // they need to be done during the action.
                assert(isArray(targetAddress), 'state.execute : dynamic target of action ' + type + ' is not an array', targetAddress);
                targetAddress.forEach(function (address) {
                    assert(isString(address), 'state.execute : dynamic target of action ' + type + ' is not an array of strings', targetAddress);
                });
            }

            // the target is the object being passed to the action handler.
            // it must be copied since any previous actions can still access it.
            var target = deepCopy(newState);

            // an empty array means the entire state object is the target.
            if (targetAddress.length === 0) {
                newState = currentAction.handler(target, params);
                assert(isDefined(newState), 'state.execute : result of action ' + type + ' on target @state is undefined');
            }

            // reference will be the variable which keeps track of the current
            // layer at which the address is. it is initially equal to the new
            // state since that is the value that needs to be modified.
            var reference = newState;
            targetAddress.forEach(function (key, i) {
                assert(isDefined(target[key]), 'state.execute : target of action ' + type + ' does not exist: @state.' + targetAddress.slice(0, i + 1).join('.'));
                if (i < targetAddress.length - 1) {
                    // both the reference to the "actual" state and the target
                    // dummy copy are traversed at the same time.
                    target = target[key];
                    reference = reference[key];
                    return;
                }

                // when the end of the address array is reached, the target
                // has been found and can be used by the handler.
                var newValue = currentAction.handler(target[key], params);
                assert(isDefined(newValue), 'state.execute : result of action ' + type + ' on target @state.' + targetAddress.join('.') + ' is undefined');
                reference[key] = newValue;
            });
        });

        // other modules can listen for the state event to be updated when
        // it changes (ex. the rendering process).
        emit({ state: deepCopy(newState) });

        watchers.forEach(function (watcher) {
            watcher(deepCopy(newState), type, params);
        });

        // this will signal the queue that the next action can be started.
        queue.done();
    };

    var apply = function apply(state, type, params) {
        // base function executes the action after all middleware has been used.
        var funcs = [function () {
            var _state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state;

            var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

            var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : params;

            execute(_state, _type, _params);
        }];

        // this code will create an array where all elements are funtions which
        // call the closest function with a lower index. the returned values for
        // the state, action type and params are also passed down to the next
        // function in the chain.
        middleware.reverse().forEach(function (currentMiddleware, index) {
            funcs[index + 1] = function () {
                var _state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state;

                var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

                var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : params;

                // arguments are updated with the output of previous middleware.
                state = _state;
                type = _type;
                params = _params;
                currentMiddleware(funcs[index], deepCopy(_state), _type, _params);
            };
        });

        // the funcs array is initialized with an extra element which makes it
        // one longer than middleware. therefore, using the length of middleware
        // is looking for the last element in the array of functions.
        funcs[middleware.length](deepCopy(state), type, params);
    };

    // actions can be added in batches by using an array.
    use.on('action', function (action) {
        [].concat(action).forEach(function () {
            var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
                return;
            }
            actions[type].push(item);
        });
    });

    // middleware can be added in batches by using an array.
    use.on('middleware', function (_middleware) {
        [].concat(_middleware).forEach(function (item) {
            assert(isFunction(item), 'state.use.middleware : middleware is not a function', item);
            middleware.push(item);
        });
    });

    // watchers can be added in batches by using an array.
    use.on('watcher', function (watcher) {
        [].concat(watcher).forEach(function (item) {
            assert(isFunction(item), 'state.use.watcher : watcher is not a function', item);
            watchers.push(item);
        });
    });

    emit.on('act', function () {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            type = _ref2.type,
            _ref2$params = _ref2.params,
            params = _ref2$params === undefined ? {} : _ref2$params;

        // the only action that does not need the state to have already
        // been changed is SET_STATE.
        assert(stateHasBeenOverwritten || type === overrideActionType, 'act : cannot act on state before it has been overrwritten');
        stateHasBeenOverwritten = true;
        assert(isString(type), 'state.act : action type is not a string', type);
        // the queue will make all actions wait to be ran sequentially.
        queue.add(function () {
            emit({ read: function read(state) {
                    apply(state, type, params);
                } });
        });
    });

    // expose module's features to the app.
    use({ api: {
            act: function act(type, params) {
                return emit({ act: { type: type, params: params } });
            }
        } });

    // action is used to override state in order to give visibility to
    // watchers and middleware.
    use({ action: {
            type: overrideActionType,
            target: [],
            handler: function handler(state, params) {
                return params;
            }
        } });

    use({ handler: function handler(newState) {
            emit({ act: { type: overrideActionType, params: newState } });
        } });
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    // reference to the initial value is kept in order to be able to check if the
    // state has been changes using triple-equals comparison.
    var initial = {};

    var past = [];
    var current = initial;
    var future = [];

    // used to enforce the maximum number of past states that can be returned to.
    var historyLength = 20;

    // action types which begin with * will not be registered in the history. this
    // can be useful for trivial interactions which should not be replayed.
    var ignorePrefix = '*';

    var undoAction = {
        type: 'UNDO',
        target: [],
        handler: function handler() {
            // can only undo if there is at least one previous state which
            // isin't the initial one.
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

    // reset action can be used to wipe history when, for example, an application
    // changes to a different page with a different state structure.
    var resetAction = {
        type: '__RESET__',
        target: [],
        handler: function handler() {
            past = [];
            future = [];
            return current;
        }
    };

    // this watcher will monitor state changes and update what is stored within
    // this function.
    var updateWatcher = function updateWatcher(state, type) {
        if (type === '__RESET__' || type[0] === ignorePrefix) {
            return;
        }
        if (type !== 'UNDO' && type !== 'REDO') {
            // adding an action to the stack invalidates anything in the "future".
            future = [];
            past.push(current);
            // state history must be kept within the desired maximum length.
            if (past.length > historyLength + 1) {
                past.shift();
            }
        }

        // objects stored into current will be moved to the past/future stacks.
        // it is assumed that the value given to this watcher is a copy of the
        // current state who's reference is not exposed enywhere else.
        current = state;
    };

    // expose undo/redo using helper functions and plug into the state module
    // to monitor the app's state.
    use({
        api: {
            undo: function undo() {
                return emit({ act: { type: 'UNDO' } });
            },
            redo: function redo() {
                return emit({ act: { type: 'REDO' } });
            }
        },
        action: [undoAction, redoAction, resetAction],
        watcher: updateWatcher
    });
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isString = _require.isString,
    isObject = _require.isObject,
    isFunction = _require.isFunction,
    makeQueue = _require.makeQueue;

module.exports = function (_ref, _window) {
    var emit = _ref.emit,
        use = _ref.use;

    // will check is the code is being ran from the filesystem or is hosted.
    // this information is used to correctly displaying routes in the former case.
    var isHosted = _window.document.origin !== null && _window.document.origin !== 'null';

    var baseUrl = '';

    // keeps track of all the registered routes. the format/type of this variable
    // is not enforced by this module and it is left to the regisiter and fetch
    // to validate the values.
    var store = void 0;

    var register = void 0;
    var fetch = void 0;

    // if the router has not yet found a match, every new path might be the
    // the current location and needs to be called. however, after this initial
    // match, any new routes do not need to be verified against the current url.
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
        // escapes characters that may cause unintended behavior when converted
        // from a string to a regular expression.
        var escapedBaseUrl = baseUrl.replace(/([^\w])/g, '\\$1');
        return path.replace(new RegExp('\^' + escapedBaseUrl), '') || '';
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

    use.on('route', function () {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref2.path,
            handler = _ref2.handler;

        assert(isString(path), 'router.use.route : path is not a string', path);
        assert(isFunction(handler), 'router.use.route : handler is not a function', path, handler);
        assert(isFunction(register), 'route.use.route : register is not a function', register);
        store = register(store, path, handler);
        if (!hasMatched) {
            hasMatched = !!safeFetch(currentPath);
        }
    });

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

    // fetch wrapper that makes the browser aware of the url change
    emit.on('redirect', function () {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref3.path,
            _ref3$params = _ref3.params,
            params = _ref3$params === undefined ? {} : _ref3$params;

        assert(isString(path), 'router.redirect : path is not a string', path);
        assert(isObject(params), 'router.redirect : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(function () {
            currentPath = path;
            if (isHosted) {
                // edge doesn't care that the file is local and will allow pushState.
                // it also includes "/C:" in the location.pathname, but adds it to
                // the path given to pushState. which means it needs to be removed here.
                _window.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
            } else {
                console.log('@okwolo/router:: path changed to\n>>> ' + currentPath);
            }
            safeFetch(currentPath, params);
            queue.done();
        });
    });

    // this will act like a redirect, but will not change the browser's url.
    emit.on('show', function () {
        var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref4.path,
            _ref4$params = _ref4.params,
            params = _ref4$params === undefined ? {} : _ref4$params;

        assert(isString(path), 'router.show : path is not a string', path);
        assert(isObject(params), 'router.show : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(function () {
            safeFetch(path, params);
            queue.done();
        });
    });

    // expose module's features to the app.
    use({ api: {
            redirect: function redirect(path, params) {
                return emit({ redirect: { path: path, params: params } });
            },
            show: function show(path, params) {
                return emit({ show: { path: path, params: params } });
            }
        } });

    // first argument can be a path string to register a route handler
    // or a function to directly use a builder.
    use({ primary: function primary(path, builder) {
            if (isFunction(path)) {
                use({ builder: path() });
                return;
            }
            use({ route: {
                    path: path,
                    handler: function handler(params) {
                        use({ builder: builder(params) });
                    }
                } });
        } });
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// this is the same library that is used in by express to match routes.

var pathToRegexp = __webpack_require__(10);

module.exports = function (_ref) {
    var use = _ref.use;

    // the type of store is not enforced by the okwolo-router module. this means
    // that it needs to be created when the first path is registered.
    var register = function register() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var handler = arguments[2];

        var keys = [];
        var pattern = pathToRegexp(path, keys, { strict: true });
        store.push({
            pattern: pattern,
            keys: keys,
            handler: handler
        });
        return store;
    };

    use({ register: register });
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * Default configs.
 */
var DEFAULT_DELIMITER = '/'
var DEFAULT_DELIMITERS = './'

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
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
  '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
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
  var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER
  var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS
  var pathEscaped = false
  var res

  while ((res = PATH_REGEXP.exec(str)) !== null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      pathEscaped = true
      continue
    }

    var prev = ''
    var next = str[index]
    var name = res[2]
    var capture = res[3]
    var group = res[4]
    var modifier = res[5]

    if (!pathEscaped && path.length) {
      var k = path.length - 1

      if (delimiters.indexOf(path[k]) > -1) {
        prev = path[k]
        path = path.slice(0, k)
      }
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
      pathEscaped = false
    }

    var partial = prev !== '' && next !== undefined && next !== prev
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = prev || defaultDelimiter
    var pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prev,
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
    })
  }

  // Push any remaining characters.
  if (path || index < str.length) {
    tokens.push(path + str.substr(index))
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

  return function (data, options) {
    var path = ''
    var encode = (options && options.encode) || encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token
        continue
      }

      var value = data ? data[token.name] : undefined
      var segment

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
        }

        if (value.length === 0) {
          if (token.optional) continue

          throw new TypeError('Expected "' + token.name + '" to not be empty')
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        segment = encode(String(value))

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
        }

        path += token.prefix + segment
        continue
      }

      if (token.optional) {
        // Prepend partial segment prefixes.
        if (token.partial) path += token.prefix

        continue
      }

      throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
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
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$/()])/g, '\\$1')
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {Array=}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  if (!keys) return path

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
        pattern: null
      })
    }
  }

  return path
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  return new RegExp('(?:' + parts.join('|') + ')', flags(options))
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}  tokens
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER)
  var delimiters = options.delimiters || DEFAULT_DELIMITERS
  var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|')
  var route = ''
  var isEndDelimited = false

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
      isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.repeat
        ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
        : token.pattern

      if (keys) keys.push(token)

      if (token.optional) {
        if (token.partial) {
          route += prefix + '(' + capture + ')?'
        } else {
          route += '(?:' + prefix + '(' + capture + '))?'
        }
      } else {
        route += prefix + '(' + capture + ')'
      }
    }
  }

  if (end) {
    if (!strict) route += '(?:' + delimiter + ')?'

    route += endsWith === '$' ? '$' : '(?=' + endsWith + ')'
  } else {
    if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?'
    if (!isEndDelimited) route += '(?=' + delimiter + '|' + endsWith + ')'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {Array=}                keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (Array.isArray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
  }

  return stringToRegexp(/** @type {string} */ (path), keys, options)
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (_ref) {
    var use = _ref.use;

    // the store's initial value is undefined so it needs to be defaulted
    // to an empty array. this function should be the one doing the action
    // defined in the route since it doesn't return it.
    var fetch = function fetch() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var found = false;
        store.find(function (registeredPath) {
            var test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            // a non null value on the result of executing the query on the path
            // is considered a successful hit.
            found = true;
            // the first element of the result array is the entire matched string.
            // this value is not useful and the following capture group results
            // are more relevant.
            test.shift();
            // the order of the keys and their values in the matched result is the
            // same and their index is now shared. note that there is no protection
            // against param values being overwritten or tags to share the same key.
            registeredPath.keys.forEach(function (key, i) {
                params[key.name] = test[i];
            });
            registeredPath.handler(params);
            return found;
        });
        return found;
    };

    use({ fetch: fetch });
};

/***/ })
/******/ ]);