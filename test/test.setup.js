'use strict';

const core = require('../src/core');

// global function to facilitate testing modules
window.wrapper = document.createElement('div');
document.body.appendChild(wrapper);
window.o = (...modules) => core({modules})(wrapper, window);

window.requestAnimationFrame = (f) => setTimeout(f, 0);

// helper function that can be used in async functions to sleep.
window.sleep = async (t = 1) => {
    return new Promise((resolve) => setTimeout(resolve, t));
};

// overriding console.warn to filter out deprecation warnings
// while running tests. other warnings are thrown. WARNING: this
// behavior should not be changed, some tests rely on catching
// warnings to correctly fulfill their purpose.
console.warn = (...args) => {
    let isDeprecationWarning = false;
    args.forEach((arg) => {
        if (typeof arg === 'string' && arg.match(/deprecat/g)) {
            isDeprecationWarning = true;
        }
    });
    if (!isDeprecationWarning) {
        throw new Error(args.join('\n'));
    }
};
