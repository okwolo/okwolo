'use strict';

// @fires sync       [view]
// @fires blob.build [view]

const {assert, cache, classnames, Genealogist, is} = require('../utils');

module.exports = ({send}, global) => {
    let tagCache = cache(1000);

    // will build a vdom structure from the output of the app's builder functions. this
    // output must be valid element syntax, or an exception will be thrown.
    const build = (element, queue, ancestry, parentIndex, updateAncestry, componentIdentity) => {
        // boolean values will produce no visible output to make it easier to use inline
        // logical expressions without worrying about unexpected strings on the page.
        if (is.boolean(element)) {
            element = '';
        }
        // null elements will produce no visible output. undefined is intentionally not
        // handled since it is often produced as a result of an unexpected builder output
        // and it should be made clear that something went wrong.
        if (is.null(element)) {
            element = '';
        }
        // in order to simplify type checking, numbers are stringified.
        if (is.number(element)) {
            element += '';
        }
        // strings will produce textNodes when rendered to the browser.
        if (is.string(element)) {
            // the updateAncestry argument is set to truthy when the
            // direct parent of the current element is a component. a value
            // implies the child is responsible for adding its key to the
            // ancestry, even if the resulting element is a text node.
            if (updateAncestry) {
                ancestry.addUnsafe('textNode', parentIndex);
            }
            return {
                text: element,
                componentIdentity,
            };
        }

        // element's address generated once and stored for the error assertions.
        const addr = ancestry.f(parentIndex);

        // the only remaining element types are formatted as arrays.
        assert(is.array(element), 'view.build : vdom object is not a recognized type', addr, element);

        // early recursive return when the element is seen to be have the component syntax.
        if (is.function(element[0])) {
            // leaving the props or children items undefined should not throw an error.
            let [component, props = {}, children = []] = element;
            assert(is.object(props), 'view.build : component\'s props is not an object', addr, element, props);
            assert(is.array(children), 'view.build : component\'s children is not an array', addr, element, children);

            // component generator is given to update function and used to create
            // the initial version of the component.
            let gen;
            // the child ancestry will be modified after the component is built
            // for the first time by setting the fromComponent argument to true.
            let childAncestry = ancestry;
            // if this iteration of component is the direct child of another
            // component, it should share its ancestry and identity. this is
            // caused by the design choice of having components produce no extra
            // level in the vdom structure. instead, the element that represents
            // a component will have a populated componentIdentity key and be
            // otherwise exactly the same as any other element.
            if (!updateAncestry) {
                childAncestry = ancestry.copy();
                // when a component is updated, the update blob in the view.dom
                // module compares the provided identity with the vdom element's
                // identity. if both values are strictly equal, a component update
                // is allowed to happen. the mechanism is used to prevent update
                // events from occurring on vdom elements that are not the expected
                // component. this can happen if the component's update function
                // is called after the component's position is replaced in the view.
                componentIdentity = {};
            }
            const update = (...args) => {
                // build caller's queue is used to make sure the childAncestry
                // has been modified and that the vdom stored in the view module
                // has been updated. this is necessary because the sync event
                // requires the component's complete address as well as a vdom
                // tree which actually contains the parsed element.
                queue.add(() => {
                    send('sync',
                        childAncestry.keys(),
                        build(gen(...args), queue, childAncestry, parentIndex, false, componentIdentity),
                        componentIdentity
                    );
                    queue.done();
                });
            };
            gen = component(Object.assign({}, props, {children}), update);
            assert(is.function(gen), 'view.build : component should return a function', addr, gen);
            // initial component is built with the fromComponent argument set to true.
            return build(gen(), queue, childAncestry, parentIndex, true, componentIdentity);
        }

        let [tagType, attributes = {}, childList = []] = element;
        assert(is.string(tagType), 'view.build : tag property is not a string', addr, element, tagType);
        assert(is.object(attributes), 'view.build : attributes is not an object', addr, element, attributes);
        assert(is.array(childList), 'view.build : children of vdom object is not an array', addr, element, childList);

        let match = tagCache.get(tagType);
        if (!is.defined(match)) {
            // regular expression to capture values from the shorthand element tag syntax.
            // it allows each section to be separated by any amount of spaces, but enforces
            // the order of the capture groups (tagName #id .className | style)
            match = /^ *?(\w+?) *?(?:#([-\w\d]+?))? *?((?:\.[-\w\d]+?)*?)? *?(?:\|\s*?([^\s][^]*?))? *?$/.exec(tagType);
            assert(is.array(match), 'view.build : tag property cannot be parsed', addr, tagType);
            // first element is not needed since it is the entire matched string. default
            // values are not used to avoid adding blank attributes to the nodes.
            tagCache.set(tagType, match);
        }
        const [, tagName, id, className, style] = match;

        // priority is given to the id defined in the attributes.
        if (is.defined(id) && !is.defined(attributes.id)) {
            attributes.id = id.trim();
        }

        // class names from both the tag and the attributes are used.
        if (is.defined(attributes.className) || is.defined(className)) {
            attributes.className = classnames(attributes.className, className)
                .replace(/\./g, ' ')
                .replace(/  +/g, ' ')
                .trim();
        }

        if (is.defined(style)) {
            if (!is.defined(attributes.style)) {
                attributes.style = style;
            } else {
                // extra semicolon is added if not present to prevent conflicts.
                // styles defined in the attributes are given priority by being
                // placed after the ones from the tag.
                attributes.style = (style + ';').replace(/;;$/g, ';') + attributes.style;
            }
        }

        // this element's key is either defined in the attributes or it defaults
        // to being the parentIndex. in both cases, it is always a string.
        let key = parentIndex;
        if ('key' in attributes) {
            key = attributes.key;
            assert(is.number(key) || is.string(key), 'view.build : invalid element key type', addr, key);
            key = '' + key;
            assert(key.match(/^[\w\d-_]+$/g), 'view.build : invalid character in element key', addr, key);
            attributes.key = key;
        }

        if (componentIdentity) {
            // component descendants might be responsible for adding ancestry.
            if (updateAncestry) {
                ancestry.addUnsafe(tagType, key);
            }
        } else {
            // not being a component's direct descendent means its address entry
            // needs to be added to the ancestry.
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
            componentIdentity,
        };
    };

    send('blob.build', (element, queue) => {
        // queue is blocked by a dummy function until the caller releases it.
        queue.add(() => {});
        return build(element, queue, new Genealogist());
    });
};
