// requires components/gooey.js

// app state
var state = {rows:[]};

// gooey object
var gui = draw(document.body, function(_state) {
    return {
        tagName: 'table',
        children: _state.rows.map(function(row) {
            return {
                tagName: 'tr',
                children: [
                    {
                        tagName: 'td',
                        children: [
                            {
                                text: row
                            }
                        ]
                    }
                ]
            }
        })
    }
}, state);

// list of tests
/*
    taken from
    https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts/table.html
    (not sure if this implementation is correct)
*/
var tests = [

    ['add 1000 rows',
    function(state) {
        for (let i = 0; i < 1000; ++i) {
            state.rows.push(Math.random());
        }
        return state;
    }],

    ['replace 1000 rows',
    function(state) {
        state.rows = [];
        for (let i = 0; i < 1000; ++i) {
            state.rows.push(Math.random());
        }
        return state;
    }],

    ['edit every tenth row',
    function(state) {
        for (let i = 0; i < 100; ++i) {
            state.rows[i*10] = '+';
        }
        return state;
    }],

    ['swap two rows',
    function(state) {
        var temp = state.rows[9];
        state.rows[9] = state.rows[10];
        state.rows[10] = temp;
        return state;
    }],

    ['delete first row',
    function(state) {
        state.rows[0] = undefined;
        return state;
    }],

    ['clear 999 rows',
    function(state) {
        state.rows = [];
        return state;
    }],

    ['add 10000 rows',
    function(state) {
        for (let i = 0; i < 10000; ++i) {
            state.rows.push(Math.random());
        }
        return state;
    }],

    ['add 1000 rows',
    function(state) {
        for (let i = 0; i < 1000; ++i) {
            state.rows.push(Math.random());
        }
        return state;
    }],

    ['clear 11000 rows',
    function(state) {
        state.rows = [];
        return state;
    }]

];

// execute tests every 500ms and log execution time (minus browser rendering)
tests.forEach(function(test, index) {
    setTimeout(function() {
        var temp = test[1](JSON.parse(JSON.stringify(state)));
        console.time(test[0]);
        gui.update(temp);
        console.timeEnd(test[0]);
        state = temp;
    }, index*500+500);
});

