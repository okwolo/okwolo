'use strict';

const okwolo = require('okwolo');

const app = okwolo(document.body);

app.setState({});

app('/home', (params) => (state) => (
    ['div', {}, [
        params.content || 'home',
    ]]
));

/* renders the route and passes it the params
   will NOT change the browser's url */
app.show('/home', {content: 'Hello World!'});
