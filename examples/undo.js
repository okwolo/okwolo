'use strict';

const okwolo = require('okwolo');

const app = okwolo();

app.setState(0);

app.use({action: {
    type: 'INC',
    target: [],
    handler: (state, amount = 1) => {
        return state + amount;
    },
}});

app.act('INC'); // 1
app.act('INC', 3); // 4
app.undo(); // 1
