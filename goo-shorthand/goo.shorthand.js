const {assert, isArray, isString} = require('goo-utils');

const shorthand = {
    parser: (vdom) => {
        // textNode treatment
        if (isString(vdom)) {
            vdom = {
                text: vdom,
            };
        }
        if (vdom.text) {
            return vdom;
        }
        // array to object
        if (isArray(vdom)) {
            vdom = {
                tagName: vdom[0],
                attributes: vdom[1],
                style: vdom[2],
                children: vdom[3],
            };
        }
        // id and class from tagName
        let selectors = null;
        try {
            selectors = vdom.tagName.match(/^(\w+)(#[^\n#.]+)?((?:\.[^\n#.]+)*)$/);
        } catch (e) {}
        assert(selectors !== null, 'tagName is misformatted:\n' + JSON.stringify(vdom.tagName));
        vdom.tagName = selectors[1];
        if (selectors[2] || selectors[3]) {
            vdom.attributes = vdom.attributes || {};
            if (selectors[2]) {
                vdom.attributes.id = selectors[2].replace('#', '');
            }
            if (selectors[3]) {
                vdom.attributes.className = selectors[3].replace(/\./g, ' ').trim();
            }
        }
        // recurse over children
        Object.keys(vdom.children || {}).forEach((key) => {
            vdom.children[key] = shorthand(vdom.children[key]);
        });
        return vdom;
    },
};

module.exports = shorthand;
