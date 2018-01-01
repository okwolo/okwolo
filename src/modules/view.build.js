'use strict';

// @fires sync       [view]
// @fires blob.build [view]

const {
    assert,
    isArray,
    isBoolean,
    isDefined,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isString,
} = require('../utils');

// ancestry helper which ensures immutability and handles common logic.
// ancestry list is recorded in reverse for easier access to the last (first)
// element. all elements take the form of objects with the "tag" and "key" keys
// which are not guaranteed to be defined. (ex. first list element has no key,
// but does have a tag since it is the root node)
const geneologist = (list = []) => {
    let formatted = null;

    // keys are only know by parents and will therefore always be added
    // before the child adds its own tag.
    const addKey = (key) => {
        return geneologist([{key}].concat(list));
    };

    // first tag in the list does not have a key. all subsequent tags are added
    // to the first array element (most recent descendant).
    const addTag = (tag) => {
        if (list.length === 0) {
            return geneologist([{tag}]);
        }
        const l = list.slice();
        l[0].tag = tag;
        return geneologist(l);
    };

    // formats the list to be consumed by assertions.
    const f = () => {
        // memoization to prevent unnecessarily re-running the logic.
        if (!isNull(formatted)) {
            return formatted;
        }
        formatted = 'root';
        for (let i = list.length - 1; i >= 0; --i) {
            formatted += ' -> ';
            const {tag, key} = list[i];
            // list elements without a tag will show the key instead.
            if (!isString(tag)) {
                formatted += `{{${key}}}`;
                continue;
            }
            // tag's style is removed to reduce clutter.
            formatted += tag.replace(/\|\s*[^]*$/g, '| ...');
        }
        return formatted;
    };

    const keyList = () => {
        const temp = [];
        // skip the last array element (tag without key)
        const start = Math.max(0, list.length - 2);
        for (let i = start; i >= 0; --i) {
            temp.push(String(list[i].key));
        }
        return temp;
    };

    return {addKey, addTag, f, keyList};
};

// simulates the behavior of the classnames npm package. strings are concatenated,
// arrays are spread and objects keys are included if their value is truthy.
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

module.exports = ({send}) => {
    // will build a vdom structure from the output of the app's builder funtions. this
    // output must be valid element syntax, or an expception will be thrown.
    const build = (element, ancestry = geneologist()) => {
        // boolean values will produce no visible output to make it easier to use inline
        // logical expressions without worrying about unexpected strings on the page.
        if (isBoolean(element)) {
            element = null;
        }
        // null elements will produce no visible output. undefined is intentionally not
        // handled since it is often produced as a result of an unexpected builder output
        // and it should be made clear that something went wrong.
        if (isNull(element)) {
            return {text: ''};
        }
        // in order to simplify type checking, numbers are stringified.
        if (isNumber(element)) {
            element = String(element);
        }
        // strings will produce textNodes when rendered to the browser.
        if (isString(element)) {
            return {text: element};
        }

        // the only remaining element types are formatted as arrays.
        assert(isArray(element), 'view.build : vdom object is not a recognized type', ancestry.f(), element);

        // early recursive return when the element is seen to be have the component syntax.
        if (isFunction(element[0])) {
            // leaving the props or children items undefined should not throw an error.
            let [component, props = {}, children = []] = element;
            assert(isObject(props), 'view.build : component\'s props is not an object', ancestry.f(), element, props);
            assert(isArray(children), 'view.build : component\'s children is not an array', ancestry.f(), element, children);

            // component generator is given to update function and used to create
            // the inital version of the component.
            let gen;
            const update = (...args) => {
                send('sync', ancestry.keyList(), build(gen(...args), ancestry));
            };
            gen = component(Object.assign({}, props, {children}), update);
            return build(gen(), ancestry);
        }

        let [tagType, attributes = {}, childList = []] = element;
        assert(isString(tagType), 'view.build : tag property is not a string', ancestry.f(), element, tagType);
        assert(isObject(attributes), 'view.build : attributes is not an object', ancestry.f(), element, attributes);
        assert(isArray(childList), 'view.build : children of vdom object is not an array', ancestry.f(), element, childList);

        // regular expression to capture values from the shorthand element tag syntax.
        // it allows each section to be seperated by any amount of spaces, but enforces
        // the order of the capture groups (tagName #id .className | style)
        const match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
        assert(isArray(match), 'view.build : tag property cannot be parsed', ancestry.f(), tagType);
        // first element is not needed since it is the entire matched string. default
        // values are not used to avoid adding blank attributes to the nodes.
        let [, tagName, id, className, style] = match;

        // priority is given to the id defined in the attributes.
        if (isDefined(id) && !isDefined(attributes.id)) {
            attributes.id = id.trim();
        }

        // class names from both the tag and the attributes are used.
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
        const children = {};
        const childOrder = [];
        for (let i = 0; i < childList.length; ++i) {
            const childElement = childList[i];
            let key = i;
            const child = build(childElement, ancestry.addKey(key));
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
            tagName,
            attributes,
            children,
            childOrder,
        };
    };

    send('blob.build', build);
};
