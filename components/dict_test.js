(function() {
    // starting state
    var s = {
        total: 0,
        test: {
            test: [1,2,3]
        }
    };

    // definition of all actions
    var a = {
        ADD: [
            {
                target: ['total'],
                do: function(target, params) {
                    return target + params.val;
                }
            },
            {
                target: ['test', 'test'],
                do: function(target, params) {
                    return target.map((val) => val+params.val);
                }
            }
        ],
        MULT: [{
            target: ['test'],
            do: function(target, params) {
                return {
                    test: target.test.map((val) => val*params.val)
                }
            }
        }],
        RESET: {
            target: [],
            do: function() {
                return Object.assign({}, s);
            }
        }
    };

    var a2 = {
        RESET: function(state, target, params) {
            console.log('test_reset');
        }
    }

    // list of all middleware (executed top first)
    var m = [
        /*function(callback, state, type, params) {
            console.log('before');
            var temp = callback(state, type, params);
            console.log('after');
            return temp;
        },*/
        // logging state and action
        function(callback, state, type, params) {
            console.log('state > %c%s', 'color:#a00;', JSON.stringify(state));
            console.log('%c%s', 'font-size:20px;', type + ' ' + JSON.stringify(params));
            var temp = callback(state, type, params);
            console.log('state > %c%s', 'color:#0a0;', JSON.stringify(temp));
            return temp;
        }
    ];

    // watcher function
    var w = function(state, type, params) {
        //console.log('%cI\'m watching', 'font-style:italic;font-family:"Comic Sans MS";color:#00f;font-size:50px;');
        //console.log(state);
        if (type === 'RESET') {
            console.log('reset');
        }
    }

    // create store
    var test_store = dict(s, [a,a2], m, w);

    // call actions
    window.addEventListener('click', function() {
        test_store.act('MULT', {val:2});
    });

    window.addEventListener('keydown', function() {
        test_store.act('ADD', {val:2});
    });

    window.p = function() {
        test_store.act('RESET', {});
    }

}())