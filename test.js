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

    // create rendering object
    var app = draw(document.body, draw_my_app, state);

    // define redering of state
    function draw_my_app(args) {
        return {
            tagName: 'div',
            children: args.items.map(function(span, index) {
                return {
                    tagName: 'span',
                    attributes: {
                        onclick: function() {
                            test_time_machine.act('REM', index);
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

    // create time machine object
    var test_time_machine = dict_time_machine(state, actions, undefined, app.update);

    // bind key events to actions
    window.addEventListener('keydown', function(e) {
        if (e.key === 'z') {
            test_time_machine.act('UNDO');
        } else if (e.key === 'x') {
            test_time_machine.act('REDO');
        } else if (e.key === '+') {
            test_time_machine.act('ADD', 1);
        } else if (e.key === '-') {
            test_time_machine.act('SUB', 1);
        } else if (e.key === '*') {
            test_time_machine.act('MUL', 2);
        } else if (e.key === '/') {
            test_time_machine.act('DIV', 2);
        } else if (e.key === 'a') {
            test_time_machine.act('APP', Math.random());
        }
    });

}())