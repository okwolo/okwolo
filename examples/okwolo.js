/* eslint-disable */
'use strict';

const okwolo = require('okwolo');

// create an app that does not render
const app1 = okwolo();

// create an app that renders to the body
const app2 = okwolo(document.body);

// create an app that uses a different window object
const app3 = okwolo(document.body, _window);
