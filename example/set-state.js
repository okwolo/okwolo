'use strict';

const okwolo = require('okwolo');

const app = okwolo(document.body);

// will not render until state is set
app(() => (state) => (
    ['div', {}, [
        ['h1', {}, [
            'Title',
        ]],
        ['p', {}, [
            'Content',
        ]],
    ]]
));

// will throw an error if state has not been set
app.act('ACTION_TYPE');

// will throw an error if state has not been set
app.getState();

// set the internal state
app.setState({});
