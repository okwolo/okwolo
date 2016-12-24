(function() {

    var state = {
        number: 0,
        otherval: 'a'
    }

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
        }
    }

    var test_time_machine = dict_time_machine(state, actions, undefined, function(state, type, params, compound_action) {
        if (!compound_action) {
            console.log('watched');
        }
    });

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
        }
    });

}())