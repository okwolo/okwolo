'use strict';

const core = require('./src/core');

// global function to facilitate testing modules
window.o = (...modules) => core({modules})(null, window);

// this assignment cannot be done using regular means.
// it is used by the router to decide if okwolo is running from a local filesystem.
Object.defineProperty(window.document, 'origin', {value: 'http://www.example.com'});

// jsdom's pushState does not change all the required props in window.document.origin
// to believably change the url of the current page.
window.history.pushState = (obj, title, path) => {
    const parser = document.createElement('a');
    parser.href = window.document.origin + path;
    ['href', 'protocol', 'host', 'hostname', 'origin', 'port', 'pathname', 'search', 'hash'].forEach((prop) => {
        Object.defineProperty(window.location, prop, {
            value: parser[prop],
            writable: true,
            configurable: true,
        });
    });
};

// jsdom does not mock this function, but it is used for dom rendering.
window.requestAnimationFrame = (f) => setTimeout(f, 0);

// helper function that can be used in async functions to sleep.
window.sleep = async (t = 1) => new Promise((resolve) => setTimeout(resolve, t));
