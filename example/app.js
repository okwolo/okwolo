'use strict';

const okwolo = require('okwolo');

const app = okwolo(document.body);

app.setState({
    greeting: 'Hello ',
    default: 'Hello World!',
});

// render this element if path matches
app('/user/:username', ({username}) => (state) => (
    ['div', {}, [
        state.greeting,
        username,
    ]]
));

// fallback to render this element regardless of route
app(() => (state) => (
    ['div', {}, [
        state.default,
    ]]
));
