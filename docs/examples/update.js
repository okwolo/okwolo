'use strict';

const okwolo = require('okwolo');

const app = okwolo(document.body);

app.setState({});

let counter = 0;

// button clicks will not change the rendered count
app(() => () => (
    ['div', {}, [
        'count: ',
        ['pre', {}, [
            String(counter),
        ]],
        ['button', {onclick: () => counter++}, [
            'click',
        ]],
    ]]
));

// re-renders the app which updates the count
app.update();
