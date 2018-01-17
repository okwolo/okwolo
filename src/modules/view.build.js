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

// ancestry helper which handles immutability and common logic. this code is
// implemented as a class contrarily to the patterns in the rest of this
// project. the decision was made as an optimization to prevent new functions
// from being created on each instanciation.
class Genealogist {
    constructor(list = []) {
        this.list = list;

        // precalculating the formatted address for use in error assertions.
        let formatted = 'root';
        for (let i = 0; i < this.list.length; ++i) {
            formatted += ' -> ';
            const {tag} = this.list[i];
            // tag's length is capped to reduce clutter.
            formatted += tag.substr(0, 16);
            if (tag.length > 16) {
                formatted += '...';
            }
        }
        this.formatted = formatted;
    }

    // formats the address with the parent index appended to the end.
    // this is useful for errors that happen before an element's tagName
    // is parsed and only the parentIndex is known.
    f(parentIndex) {
        if (parentIndex === undefined) {
            return this.formatted;
        }
        return `${this.formatted} -> {{${parentIndex}}}`;
    }

    // adding a level returns a new instance of genealogist and does not
    // mutate the undelying list.
    add(tag, key) {
        return new Genealogist(this.list.concat([{tag, key}]));
    }

    // adds a level to the current instance. this method should be used
    // with caution since it modifies the list directly. should be used
    // in conjunction with copy method to ensure no list made invalid.
    addUnsafe(tag, key) {
        this.list.push({tag, key});
        return this;
    }

    // returns a new instance of genealogist with a copy of the underlying list.
    copy() {
        return new Genealogist(this.list.slice());
    }

    // returns the list of keys in the ancestry. this value is represents
    // the element's "address".
    keys() {
        const temp = [];
        if (this.list.length < 2) {
            return [];
        }
        // skip the first array element (root element has no parent key)
        for (let i = 1; i < this.list.length; ++i) {
            temp.push(this.list[i].key);
        }
        return temp;
    };
}

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
    const build = (element, queue, ancestry = new Genealogist(), parentIndex, fromComponent) => {
        // boolean values will produce no visible output to make it easier to use inline
        // logical expressions without worrying about unexpected strings on the page.
        if (isBoolean(element)) {
            element = '';
        }
        // null elements will produce no visible output. undefined is intentionally not
        // handled since it is often produced as a result of an unexpected builder output
        // and it should be made clear that something went wrong.
        if (isNull(element)) {
            element = '';
        }
        // in order to simplify type checking, numbers are stringified.
        if (isNumber(element)) {
            element = '' + element;
        }
        // strings will produce textNodes when rendered to the browser.
        if (isString(element)) {
            // the fromComponent argument is set to true when the direct parent
            // of the current element is a component. a value of true implies
            // the child is responsible for adding its key to the ancestry,
            // even if the resulting element is a text node.
            if (fromComponent) {
                ancestry.addUnsafe('textNode', parentIndex);
            }
            return {text: element};
        }

        // element's address generated once and stored for the error assertions.
        const addr = ancestry.f(parentIndex);

        // the only remaining element types are formatted as arrays.
        assert(isArray(element), 'view.build : vdom object is not a recognized type', addr, element);

        // early recursive return when the element is seen to be have the component syntax.
        if (isFunction(element[0])) {
            // leaving the props or children items undefined should not throw an error.
            let [component, props = {}, children = []] = element;
            assert(isObject(props), 'view.build : component\'s props is not an object', addr, element, props);
            assert(isArray(children), 'view.build : component\'s children is not an array', addr, element, children);

            // component generator is given to update function and used to create
            // the inital version of the component.
            let gen;
            // the child component's ancestry starts as a copy of its parent's.
            // however, its contents are modified after the component is built
            // for the first time by setting the fromComponent argument to true.
            const childAncestry = ancestry.copy();
            const update = (...args) => {
                // build caller's queue is used to make sure the childAncestry
                // has been modified and that the vdom stored in the view module
                // has beeen updated. this is necessary because the sync event
                // requires the component's complete address as well as a vdom
                // tree which actually contains the parsed element.
                queue.add(() => {
                    send('sync', childAncestry.keys(), build(gen(...args), queue, childAncestry, parentIndex));
                    queue.done();
                });
            };
            gen = component(Object.assign({}, props, {children}), update);
            assert(isFunction(gen), 'view.build : component should return a function', addr, gen);
            // initial component is built with the fromComponent argument set to true.
            return build(gen(), queue, childAncestry, parentIndex, true);
        }

        let [tagType, attributes = {}, childList = []] = element;
        assert(isString(tagType), 'view.build : tag property is not a string', addr, element, tagType);
        assert(isObject(attributes), 'view.build : attributes is not an object', addr, element, attributes);
        assert(isArray(childList), 'view.build : children of vdom object is not an array', addr, element, childList);

        // regular expression to capture values from the shorthand element tag syntax.
        // it allows each section to be seperated by any amount of spaces, but enforces
        // the order of the capture groups (tagName #id .className | style)
        const match = /^ *?(\w+?) *?(?:#([-\w\d]+?))? *?((?:\.[-\w\d]+?)*?)? *?(?:\|\s*?([^\s][^]*?))? *?$/.exec(tagType);
        assert(isArray(match), 'view.build : tag property cannot be parsed', addr, tagType);
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

        // this element's key is either defined in the attributes or it defaults
        // to being the parentIndex. in both cases, it is always a string.
        let key = parentIndex;
        if ('key' in attributes) {
            key = attributes.key;
            assert(isNumber(key) || isString(key), 'view.build : invalid element key type', addr, key);
            key = '' + key;
            assert(key.match(/^[\w\d-_]+$/g), 'view.build : invalid character in element key', addr, key);
            attributes.key = key;
        }

        // ancestry is recorded to give more context to error messages. being a
        // direct descendant from a component makes this iteration of build
        // responsible for adding its ancestry entry.
        if (fromComponent) {
            ancestry.addUnsafe(tagType, key);
        } else {
            ancestry = ancestry.add(tagType, key);
        }

        // childList is converted to a children object with each child having its
        // own key. the child order is also recorded.
        const children = {};
        const childOrder = [];
        for (let i = 0; i < childList.length; ++i) {
            const childElement = childList[i];
            // parentIndex argument passed to build should be a string.
            let key = '' + i;
            const child = build(childElement, queue, ancestry, key);
            // a key attribute in the child will override the default
            // array index as key.
            if (child.attributes && 'key' in child.attributes) {
                key = child.attributes.key;
            }
            assert(!children[key], 'view.build : duplicate child key (note that text elements and elements with no key attribute are given their array index as key)', ancestry.f(), key);
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

    send('blob.build', (element, queue) => {
        queue.add(Function);
        return build(element, queue);
    });
};
