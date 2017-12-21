'use strict';

const core = require('../src/core');

// global function to facilitate testing modules
window.wrapper = document.createElement('div');
document.body.appendChild(wrapper);
window.o = (...modules) => core({modules})(wrapper, window);

window.requestAnimationFrame = (f) => setTimeout(f, 0);

// helper function that can be used in async functions to sleep.
window.sleep = async (t = 1) => new Promise((resolve) => setTimeout(resolve, t));
