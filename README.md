<img src="https://user-images.githubusercontent.com/9319710/28757374-8e78376e-754f-11e7-84a1-7b2b2e540e56.png" alt="Redux Logo Landscape" width="800px">

# [okwolo](https://github.com/okwolo/okwolo)

[![NPM version](https://img.shields.io/npm/v/okwolo.svg)](https://www.npmjs.com/package/okwolo)
[![Build Status](https://travis-ci.org/okwolo/okwolo.svg?branch=master)](https://travis-ci.org/okwolo/okwolo)
[![Codecov](https://img.shields.io/codecov/c/github/okwolo/okwolo.svg)](https://codecov.io/gh/okwolo/okwolo)
[![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/standard.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js.gz)
[![typing included](https://img.shields.io/badge/typings-included-brightgreen.svg)](https://github.com/okwolo/okwolo/blob/master/packages/okwolo/index.d.ts)

`okwolo` is a small framework made to jumpstart projects by solving common web application challenges. The default okwolo package includes state management, layout and routing functionality. All modules have a common `.use` function that accepts okwolo's configuration objects called blobs.

| Documentation links | |
|---|---|
| top level api | [`/docs/api`](https://github.com/okwolo/okwolo/blob/master/docs/api.md) |
| element syntax | [`/docs/syntax`](https://github.com/okwolo/okwolo/blob/master/docs/syntax.md) |
| blobs | [`/docs/blobs`](https://github.com/okwolo/okwolo/blob/master/docs/blobs.md) |

# Example

````javascript
let app = okwolo(document.body);

app.setState({
    fruits: ['orange', 'apple', 'pear']
});

let FruitItem = ({type}) => (
    ['li.fruit', {}, [
        type,
    ]]
);

app(() => ({fruits}) => (
    ['ul.fruit-list', {},
        fruits.map((type) => (
            [FruitItem, {type}]
        )),
    ]
));
````

````html
<ul class="fruit-list">
    <li class="fruit">orange</li>
    <li class="fruit">apple</li>
    <li class="fruit">pear</li>
</ul>
````

| Bundles | | |
|---|---|---|
| [standard](https://github.com/okwolo/okwolo/blob/master/dist/standard.js) | [min](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js) | [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/standard.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js.gz) |
| [static](https://github.com/okwolo/okwolo/blob/master/dist/static.js) | [min](https://github.com/okwolo/okwolo/blob/master/dist/static.min.js) | [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/static.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/static.min.js.gz) |
| [stateless](https://github.com/okwolo/okwolo/blob/master/dist/stateless.js) | [min](https://github.com/okwolo/okwolo/blob/master/dist/stateless.min.js) | [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/stateless.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/stateless.min.js.gz) |
| [lite](https://github.com/okwolo/okwolo/blob/master/dist/lite.js) | [min](https://github.com/okwolo/okwolo/blob/master/dist/lite.min.js) | [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/lite.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/lite.min.js.gz) |
| [lite](https://github.com/okwolo/okwolo/blob/master/dist/server.js) | [min](https://github.com/okwolo/okwolo/blob/master/dist/server.min.js) | [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/server.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/server.min.js.gz) |
