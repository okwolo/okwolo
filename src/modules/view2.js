'use strict';

const {
    isArray,
    isBoolean,
    isDefined,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isString,
} = require('../utils');

const classnames = (...args) => {
    return args
        .map((arg) => {
            if (isString(arg)) {
                return arg;
            } else if (isArray(arg)) {
                return classnames(...arg);
            } else if (isObject(arg)) {
                return classnames(
                    Object.keys(arg)
                        .map((key) => arg[key] && key)
                );
            }
        })
        .filter(Boolean)
        .join(' ');
};

const build = (element, ancestry = []) => {
    if (isBoolean(element)) {
        element = null;
    }
    if (isNull(element)) {
        return {text: ''};
    }
    if (isNumber(element)) {
        element = String(element);
    }
    if (isString(element)) {
        return {text: element};
    }
    if (isFunction(element[0])) {
        let [component, props = {}, children = []] = element;
        return build(component(Object.assign({}, props, {children}), ancestry)(), ancestry);
    }
    let [tagType, attributes = {}, childList = []] = element;
    const match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
    let [, tagName, id, className, style] = match;
    if (isDefined(id) && !isDefined(attributes.id)) {
        attributes.id = id.trim();
    }
    if (isDefined(attributes.className) || isDefined(className)) {
        attributes.className = classnames(attributes.className, className)
            .replace(/\./g, ' ')
            .replace(/  +/g, ' ')
            .trim();
    }

    if (isDefined(style)) {
        if (!isDefined(attributes.style)) {
            attributes.style = style;
        } else {
            style = (style + ';').replace(/;;$/g, ';');
            attributes.style = style + attributes.style;
        }
    }
    const children = {};
    const childOrder = [];
    for (let i = 0; i < childList.length; ++i) {
        const childElement = childList[i];
        let key = i;
        const child = build(childElement, ancestry.concat(key));
        if (child.attributes && 'key' in child.attributes) {
            key = child.attributes.key;
        }
        key = String(key);
        childOrder.push(key);
        children[key] = child;
    }

    return {
        tagName,
        attributes,
        children,
        childOrder,
    };
};

const longestChain = (original, successor) => {
    const count = successor.length;
    const half = count / 2;
    let longest = 0;
    let chainStart = 0;
    for (let i = 0; i < count; ++i) {
        const startInc = original.indexOf(successor[i]);
        const maxInc = Math.min(count - startInc, count - i);
        let currentLength = 1;
        for (let inc = 1; inc < maxInc; ++inc) {
            if (successor[i + inc] !== original[startInc + inc]) {
                break;
            }
            currentLength += 1;
        }
        if (currentLength > longest) {
            longest = currentLength;
            chainStart = i;
        }
        if (longest >= half) {
            break;
        }
    }
    return {
        start: chainStart,
        end: chainStart + longest - 1,
    };
};

const diff = (original, successor) => {
    const keys = Object.keys(Object.assign({}, original, successor));
    const modifiedKeys = [];
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const valueOriginal = original[key];
        const valueSuccessor = successor[key];
        if (isFunction(valueOriginal) || isFunction(valueSuccessor)) {
            modifiedKeys.push(key);
        }
        if (valueOriginal !== valueSuccessor) {
            modifiedKeys.push(key);
        }
    }
    return modifiedKeys;
};

module.exports = ({on, send}, global) => {
    const render = (velem) => {
        if (isDefined(velem.text)) {
            velem.DOM = global.document.createTextNode(velem.text);
            return velem;
        }
        const element = global.document.createElement(velem.tagName);
        Object.assign(element, velem.attributes);
        for (let i = 0; i < velem.childOrder.length; ++i) {
            const key = velem.childOrder[i];
            const {DOM} = render(velem.children[key]);
            element.appendChild(DOM);
        }
        velem.DOM = element;
        return velem;
    };

    const draw = (target, newVDOM) => {
        render(newVDOM);
        global.requestAnimationFrame(() => {
            target.innerHTML = '';
            target.appendChild(newVDOM.DOM);
        });
        return newVDOM;
    };

    const updateElement = (original, successor, parent, parentKey) => {
        if (!isDefined(original)) {
            parent.children[parentKey] = render(successor);
            parent.DOM.appendChild(parent.children[parentKey].DOM);
            return;
        }
        if (!isDefined(successor)) {
            parent.DOM.removeChild(original.DOM);
            delete parent.children[parentKey];
            return;
        }
        if (original.tagName !== successor.tagName) {
            const oldDOM = original.DOM;
            const newVDOM = render(successor);
            parent.DOM.replaceChild(newVDOM.DOM, oldDOM);
            Object.assign(original, {
                DOM: undefined,
                text: undefined,
                tagName: undefined,
                attributes: undefined,
                children: undefined,
                childOrder: undefined,
            }, newVDOM);
            return;
        }
        if (original.DOM.nodeType === 3) {
            if (original.text !== successor.text) {
                original.DOM.nodeValue = successor.text;
                original.text = successor.text;
            }
            return;
        }
        const attributesDiff = diff(original.attributes, successor.attributes);
        for (let i = 0; i < attributesDiff.length; ++i) {
            const key = attributesDiff[i];
            original.attributes[key] = successor.attributes[key];
            original.DOM[key] = successor.attributes[key];
        }
        const childOrder = original.childOrder.slice();
        original.childOrder = successor.childOrder;
        const childKeys = Object.keys(Object.assign({}, original.children, successor.children));
        for (let i = 0; i < childKeys.length; ++i) {
            const key = childKeys[i];
            if (!original.children[key]) {
                childOrder.push(key);
            } else if (!successor.children[key]) {
                childOrder.splice(childOrder.indexOf(key), 1);
            }
            updateElement(original.children[key], successor.children[key], original, key);
        }
        if (!childOrder.length) {
            return;
        }
        const {start, end} = longestChain(childOrder, successor.childOrder);
        const startKeys = successor.childOrder.slice(0, start);
        for (let i = startKeys.length - 1; i >= 0; --i) {
            const key = startKeys[i];
            original.DOM.insertBefore(original.children[key].DOM, original.DOM.firstChild);
        }
        const endKeys = successor.childOrder.slice(end + 1, Infinity);
        for (let i = 0; i < endKeys.length; ++i) {
            const key = endKeys[i];
            original.DOM.appendChild(original.children[key].DOM);
        }
    };

    const update = (target, newVDOM, VDOM) => {
        global.requestAnimationFrame(() => {
            try {
                updateElement(VDOM, newVDOM, {DOM: target, children: {root: VDOM}}, 'root');
            } catch (e) {
                console.error('view.dom.update : ' + e);
            }
        });
        return VDOM;
    };

    let target;
    let builder;
    let view;
    let state;

    on('blob.target', (_target) => {
        target = _target;
        send('update', true);
    });

    on('blob.builder', (_builder) => {
        builder = _builder;
        send('update', false);
    });

    on('state', (_state) => {
        state = _state;
        send('update', false);
    });

    let hasDrawn = false;
    let canDraw = false;

    on('update', (force) => {
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force && hasDrawn) {
            view = update(target, build(builder(state)), view);
            return;
        }
        view = draw(target, build(builder(state)));
        hasDrawn = true;
    });

    send('blob.api', {
        update: () => send('update', false),
    });
    send('blob.primary', (init) => {
        send('blob.builder', init());
    });
};
