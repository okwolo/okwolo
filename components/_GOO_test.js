(function() {

    // initial state
    var state = {
        number: 0,
        otherval: 'a',
        items: [{
            color: 'blue',
            content: 'potato'
        }]
    }

    // define redering of state
    function draw_my_app(args) {
        return {
            tagName: 'div',
            children: args.items.map(function(span, index) {
                return {
                    tagName: 'span',
                    attributes: {
                        onclick: function() {
                            app.act('REM', index);
                        }
                    },
                    style: {
                        color: span.color,
                        display: 'block',
                        fontSize: span.fontSize,
                        cursor: 'pointer'
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

    // define state actions
    var actions = {
        ADD: function(target, params) {
            target.number += params;
            return target;
        },
        SUB: function(target, params) {
            target.number -= params;
            return target;
        },
        MUL: function(target, params) {
            target.number *= params;
            return target;
        },
        DIV: function(target, params) {
            target.number /= params;
            return target;
        },
        APP: function(target, params) {
            target.items.push({
                color: 'grey',
                content: params
            });
            return target;
        },
        REM: function(target, params) {
            target.items.splice(params, 1);
            return target;
        }
    }

    var app = goo({
        target: document.body,
        builder: draw_my_app,
        state: state,
        actions: actions
    });

    // bind key events to actions
    window.addEventListener('keydown', function(e) {
        if (e.key === 'z') {
            app.act('UNDO');
        } else if (e.key === 'x') {
            app.act('REDO');
        } else if (e.key === '+') {
            app.act('ADD', 1);
        } else if (e.key === '-') {
            app.act('SUB', 1);
        } else if (e.key === '*') {
            app.act('MUL', 2);
        } else if (e.key === '/') {
            app.act('DIV', 2);
        } else if (e.key === 'a') {
            app.act('APP', Math.random());
        }
    });

}())