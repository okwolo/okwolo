'use strict';

// internal function that wraps JSON.stringify
const prettyPrint = (obj) => {
    // uses a custom replacer to correctly handle functions
    const stringified = JSON.stringify(obj, (key, value) => {
        return (typeof value === 'function')
            ? value.toString()
            : value;
    }, 2);

    // stringified value is passed through the String constructor to
    // correct for the "undefined" case. each line is then indented.
    const indented = String(stringified)
        .replace(/\n/g, '\n    ');

    return `\n>>> ${indented}`;
};

// all type-checks should only return boolean values.
const isDefined = (value) => {
    return value !== undefined;
};
module.exports.isDefined = isDefined;

const isNull = (value) => {
    return value === null;
};
module.exports.isNull = isNull;

const isArray = (value) => {
    return Array.isArray(value);
};
module.exports.isArray = isArray;

const isFunction = (value) => {
    return typeof value === 'function';
};
module.exports.isFunction = isFunction;

const isString = (value) => {
    return typeof value === 'string';
};
module.exports.isString = isString;

const isNumber = (value) => {
    return typeof value === 'number';
};
module.exports.isNumber = isNumber;

const isBoolean = (value) => {
    return typeof value === 'boolean';
};
module.exports.isBoolean = isBoolean;

const isObject = (value) => {
    return (!!value) && (value.constructor === Object);
};
module.exports.isObject = isObject;

const isNode = (value) => {
    return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
};
module.exports.isNode = isNode;

const isRegExp = (value) => {
    return value instanceof RegExp;
};
module.exports.isRegExp = isRegExp;

const isBrowser = () => {
    return typeof window !== 'undefined';
};
module.exports.isBrowser = isBrowser;

const deepCopy = (obj) => {
    // undefined value would otherwise throw an error at parsing time.
    if (obj === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(obj));
};
module.exports.deepCopy = deepCopy;

// will throw an error containing the message and the culprits if the
// assertion is falsy. the message is expected to contain information
// about the location of the error followed by a meaningful error message.
// (ex. "router.redirect : url is not a string")
const assert = (assertion, message, ...culprits) => {
    if (!assertion) {
        throw new Error(`@okwolo.${message}${culprits.map(prettyPrint).join('')}`);
    }
};
module.exports.assert = assert;

// this function will create a queue object which can be used to defer
// the execution of functions.
const makeQueue = () => {
    const queue = [];

    // runs the first function in the queue if it exists. this specifically
    // does not call done or remove the function from the queue since there
    // is no knowledge about whether or not the function has completed. the
    // queue will wait for a done signal before running any other item.
    const run = () => {
        const func = queue[0];
        if (func) {
            func();
        }
    };

    // adds a function to the queue. it will be run instantly if the queue
    // is not in a waiting state.
    const add = (func) => {
        queue.push(func);
        if (queue.length === 1) {
            run();
        }
    };

    // removes the first element from the queue and calls run. note that
    // it is not possible to pre-call done in order to have multiple
    // functions execute immediately.
    const done = () => {
        // calling shift on an empty array does nothing.
        queue.shift();
        run();
    };

    return {add, done};
};
module.exports.makeQueue = makeQueue;

// creates a cache with a bounded number of elements. getting values from
// the cache has almost the same performance as using a naked object. setting
// keys will only become slower after the max size is reached. returns
// undefined when key is not in cache.
const cache = (size = 500) => {
    const map = {};
    const order = [];

    // set does not check that the key is already in the cache or in the
    // delete order. it is assumed the user of the cache will be calling
    // get before set and will therefore know if the key was already defined.
    const set = (key, value) => {
        map[key] = value;
        order.push(key);
        if (order.length > size) {
            map[order.shift()] = undefined;
        }
    };

    // querying a key will not update its position in the delete order. this
    // option was not implemented because it would be a significant performance
    // hit with limited benefits for the current use case.
    const get = (key) => {
        return map[key];
    };

    return {set, get};
};
module.exports.cache = cache;

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
module.exports.classnames = classnames;

// ancestry helper which handles immutability and common logic. this code is
// implemented as a class contrarily to the patterns in the rest of this
// project. the decision was made as an optimization to prevent new functions
// from being created on each instantiation.
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
    // mutate the underlying list.
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
module.exports.Genealogist = Genealogist;

// finds the longest common of equal items between two input arrays.
// this function can make some optimizations by assuming that both
// arrays are of equal length, that all keys are unique and that all
// keys are found in both arrays. start and end indices of the chain
// in the second argument are returned.
const longestChain = (original, successor) => {
    const count = successor.length;
    const half = count / 2;

    // current longest chain reference is saved to compare against new
    // contenders. the chain's index in the second argument is also kept.
    let longest = 0;
    let chainStart = 0;
    for (let i = 0; i < count; ++i) {
        const startInc = original.indexOf(successor[i]);
        const maxInc = Math.min(count - startInc, count - i);

        // start looking after the current index since it is already
        // known to be equal.
        let currentLength = 1;

        // loop through all following values until either array is fully
        // read or the chain of identical values is broken.
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

        // quick exit if a chain is found that is longer or equal to half
        // the length of the input arrays since it means there can be no
        // longer chains.
        if (longest >= half) {
            break;
        }
    }
    return {
        start: chainStart,
        end: chainStart + longest - 1,
    };
};
module.exports.longestChain = longestChain;

// shallow diff of two objects which returns an array of keys where the value is
// different. differences include keys who's values have been deleted or added.
// because there is no reliable way to compare function equality, they are always
// considered to be different.
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
module.exports.diff = diff;
