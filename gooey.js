//
var draw = function(target, create, initial_state) {

    // storing vdom
    var vdom = {};

    // type checking
    if (!target instanceof Node) {
        throw new Error('target is not a DOM node');
    }
    if (typeof render !== 'function') {
        throw new Error('render attribute is not a function');
    }

    // create vdom
    vdom = create(initial_state);

    // initial render to DOM
    target.innerHTML = '';
    target.appendChild(render(vdom));

    // recursively creates DOM elements from vdom object
    /*{
        tagName: '',
        attributes: {},
        style: {},
        children: []
    }*/
    function render(velem) {
        if (typeof velem === 'string') {
            return document.createTextNode(velem);
        }
        if (!velem.tagName) {
            return null;
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
            velem.children.forEach(function(child) {
                element.appendChild(render(child));
            });
        }
        velem.DOM = element;
        return element;
    }

    // update vdom and real dom to new state
    function update(new_state) {
        var new_vdom = create(new_state);
        var changes = diff(vdom, new_vdom, {
            DOM: true
        });
        console.log(vdom, new_vdom, diff(vdom, new_vdom, {
            DOM: true
        }));
        if (changes === true) {
            return;
        }
        console.log(JSON.stringify(changes));
        changes.forEach(function(address) {
            var last_parent_of_DOM = null;
            var temp = vdom;
            address.forEach(function(key, index) {
                if (temp.DOM !== undefined) {
                    last_parent_of_DOM = index-1;
                }
                temp = temp[key];
            });
            var current_node = vdom;
            var new_node = new_vdom;
            var change_address = address.slice(0, last_parent_of_DOM+1);
            change_address.forEach(function(key, index) {
                if (index !== last_parent_of_DOM) {
                    current_node = current_node[key];
                    new_node = new_node[key];
                } else {
                    var DOM_node = current_node[key].DOM;
                    var parent = DOM_node.parentNode;
                    if (current_node[key] !== undefined && new_node[key] !== undefined) {
                        delete current_node[key];
                        current_node[key] = new_node[key];
                        var DOM = render(new_node[key]);
                        current_node[key].DOM = DOM;
                        parent.replaceChild(DOM, DOM_node);
                    } else if (current_node[key] !== undefined) {
                        delete current_node[key];
                        DOM_node.remove();
                    } else {
                        current_node[key] = new_node[key];
                        var DOM = render(new_node[key]);
                        parent.appendChild(DOM);
                    }
                }
            });
        });
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
        children: [{
            tagName: 'div',
            children: args.spans.map(function(span, index) {
                return {
                    tagName: 'span',
                    style: {
                        color: span.color,
                        display: 'block'
                    },
                    children: [
                        span.content,
                        {
                            tagName: 'br'
                        }
                    ]
                }
            })
        }]
    }
}

var app = draw(document.body, draw_my_app, {
    spans: [
        {
            content: 'test1',
            color: 'red'
        },
        {
            content: 'test2',
            color: 'green'
        },
        {
            content: 'test3',
            color: 'blue'
        }/*,
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
            }/*,
            {
                content: 'test4.2',
                color: 'blue'
            }*/
        ]
    })
}, 1000);