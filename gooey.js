//
var draw = function(target, create, initial_state) {

    // storing vdom
    var vdom = {};

    // type checking
    if (!target instanceof Node) {
        throw new Error('target is not a DOM node');
    }
    if (typeof create !== 'function') {
        throw new Error('create attribute is not a function');
    }

    // create vdom
    vdom = render(create(initial_state));

    // initial render to DOM
    target.innerHTML = '';
    target.appendChild(vdom.DOM);

    // recursively creates DOM elements from vdom object
    /*{
        tagName: '',
        attributes: {},
        style: {},
        children: []
    }*/
    function render(velem) {
        if (!velem.tagName) {
            velem.DOM = document.createTextNode(velem.text);
            return velem;
        }
        var element = document.createElement(velem.tagName);
        if (velem.attributes) {
            Object.keys(velem.attributes).forEach(function(attribute) {
                element[attribute] = velem.attributes[attribute];
            });
        }
        if (velem.style) {
            Object.keys(velem.style).forEach(function(attribute) {
                element.style[attribute] = velem.style[attribute];
            });
        }
        if (velem.children) {
            velem.children.forEach(function(child, index) {
                velem.children[index] = render(child);
                element.appendChild(velem.children[index].DOM);
            });
        }
        velem.DOM = element;
        return velem;
    }

    function update(new_state) {
        var vdom2 = create(new_state);
        make_changes(vdom, vdom2, {});
        function make_changes(original, successor, original_parent, index_parent) {
            if ((original === undefined && successor === undefined) || original_parent === undefined) {
                return;
            }
            if (original === undefined) {
                // add
                original_parent.children[index_parent] = render(successor);
                original_parent.DOM.appendChild(original_parent.children[index_parent].DOM);
            } else if (successor === undefined) {
                // remove
                original_parent.DOM.removeChild(original.DOM);
                original_parent.children.splice(original_parent.children.length-1,1);
            } else if (original.tagName !== successor.tagName) {
                // replace
                var old_dom = original.DOM;
                original_parent.children[index_parent] = render(successor);
                original_parent.DOM.replaceChild(original_parent.children[index_parent].DOM, old_dom);
            } else {
                // edit
                if (original.DOM.nodeType === 3) {
                    if (original.text !== successor.text) {
                        original.DOM.nodeValue = successor.text;
                        original.text = successor.text;
                    }
                } else {
                    var style = diff(original.style, successor.style);
                    var attributes = diff(original.attributes, successor.attributes);
                    if (style.length !== undefined) {
                        original.DOM.style.cssText = null;
                        style.forEach(function(key) {
                            original.style[key] = successor.style[key];
                            original.DOM.style[key] = successor.style[key];
                        });
                    }
                    if (attributes.length !== undefined) {
                        attributes.forEach(function(key) {
                            original.attributes[key] = successor.attributes[key];
                            original.DOM[key] = successor.attributes[key];
                        });
                    }
                }
            }
            var len_original = (original && original.children && original.children.length) || 0;
            var len_successor = (successor && successor.children && successor.children.length) || 0;
            var len = Math.max(len_original, len_successor);
            for (var i = 0; i < len; ++i) {
                make_changes(
                    original && original.children && original.children[i],
                    successor && successor.children && successor.children[i],
                    original,
                    i
                );
            }
        }
    }

    function diff(original, successor, ignore) {
        // making sure ignore is defined
        ignore = ignore || {};
        // get types
        var o_type = Object.prototype.toString.call(original);
        var s_type = Object.prototype.toString.call(successor);
        // reject when different types
        if (o_type !== s_type) {
            return false;
        }
        // functions are considered equal
        if (o_type === '[object Function]') {
            return true;
        }
        // compare two objects or arrays
        if (o_type === '[object Object]' || o_type === '[object Array]') {
            var keys = Object.keys(original);
            var new_keys = Object.keys(successor);
            // creating union of both arrays of keys
            if (o_type === '[object Array]') {
                var length_difference = new_keys.length - keys.length;
                if (length_difference > 0) {
                    for (let i = length_difference; i > 0 ; --i) {
                        keys.push(new_keys[new_keys.length - i]);
                    }
                }
            } else {
                var keys_obj = {};
                keys.forEach(function(key) {
                    keys_obj[key] = true;
                });
                new_keys.forEach(function(key) {
                    if (!keys_obj[key]) {
                        keys.push(key);
                    }
                });
            }
            return keys.reduce(function(accumulator, key) {
                if (ignore[key] !== undefined) {
                    return accumulator;
                }
                var temp = diff(original[key], successor[key], ignore);
                if (temp !== true) {
                    if (typeof accumulator === 'boolean') {
                        accumulator = [];
                    }
                    if (temp === false) {
                        accumulator.push([key]);
                    } else {
                        temp.forEach(function(current) {
                            current.unshift(key);
                            accumulator.push(current);
                        });
                    }
                }
                return accumulator;
            }, true);
        }
        // compare primitive types
        return original === successor;
    }

    // returning public funcitons
    return {
        update: update
    }
}

function draw_my_app(args) {
    return {
        tagName: 'div',
        children: args.spans.map(function(span, index) {
            return {
                tagName: 'span',
                style: {
                    color: span.color,
                    display: 'block',
                    fontSize: span.fontSize
                },
                children: [
                    {
                        text: span.content
                    },
                    {
                        tagName: 'br'
                    }
                ]
            }
        })
    }
}

var app = draw(document.body, draw_my_app, {
    spans: [
        {
            content: 'test1',
            color: 'red'
        },
        {
            content: 'test',
            color: 'red'
        }/*,
        {
            content: 'test3',
            color: 'blue'
        },
        {
            content: 'test4',
            color: 'red'
        }*/
    ]
});

setTimeout(function() {
    app.update({
        spans: [
            {
                content: 'test1',
                color: 'red'
            },
            {
                content: 'test',
                fontSize: '10px'
            },
            {
                content: 'test3',
                color: 'blue'
            },
            {
                content: 'test4',
                color: 'blue'
            }
        ]
    })
}, 600);


setTimeout(function() {
    app.update({
        spans: [
            {
                content: 'test1.2',
                color: 'blue'
            },
            {
                content: 'test2',
                color: 'green'
            },
            {
                content: 'test3.2',
                color: 'green'
            },
            {
                content: 'test4.2',
                color: 'blue'
            }
        ]
    })
}, 1200);

setTimeout(function() {
    app.update({
        spans: [
            {
                content: 'test1.2',
                color: 'blue'
            },
            {
                content: 'test2',
                color: 'red'
            },
            {
                content: 'test3.2',
                color: 'green'
            },
            {
                content: 'test4.3',
                color: 'green'
            }
        ]
    })
}, 1800);