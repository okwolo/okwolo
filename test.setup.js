'use strict';

Object.defineProperty(window.document, 'origin', {value: 'http://www.example.com'});

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

window.requestAnimationFrame = (f) => setTimeout(f, 0);

window.sleep = async (t = 1) => new Promise((resolve) => setTimeout(resolve, t));
