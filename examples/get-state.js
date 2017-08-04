'use strict';

const okwolo = require('okwolo');

const app = okwolo();

app.setState([0, 1, 2]);

app.getState(); // [0, 1, 2]
