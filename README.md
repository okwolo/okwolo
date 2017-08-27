<img src="https://user-images.githubusercontent.com/9319710/28757374-8e78376e-754f-11e7-84a1-7b2b2e540e56.png" alt="logo" width="800px">

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

# Bundles

## `standard` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/standard.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js.gz)

> `require('okwolo');` or `require('okwolo/bundles/standard');`

```diff
  okwolo-dom
  okwolo-router
  okwolo-state
  okwolo-history
```

| | transpiled | transpiled + minified |
|---|---|---|
| browser | [dist/standard.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/standard.js) | [dist/standard.min.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/standard.min.js) |

## `lite` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/lite.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/lite.min.js.gz)

> `require('okwolo/bundles/lite');`

```diff
  okwolo-dom
- okwolo-router
+ okwolo-lite-router
- okwolo-state
- okwolo-history
```

`lite-router` is a simpler router which only supports url params. (`/user/:id/profile`)

| | transpiled | transpiled + minified |
|---|---|---|
| browser | [dist/lite.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/lite.js) | [dist/lite.min.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/lite.min.js) |

## `server` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/server.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/server.min.js.gz)

> `require('okwolo/bundles/server');`

```diff
- okwolo-dom
+ okwolo-render-to-string
- okwolo-router
- okwolo-state
- okwolo-history
```

Can render to a string by giving a callback as the render target.

```javascript
const app = okwolo();

app.setState({
    // ...
})

app(() => () => (
    ['div.app', {}, [
        // ...
    ]]
));

app.use({target: (htmlString) => {
    // ...
}})
```

| | transpiled | transpiled + minified |
|---|---|---|
| browser | [dist/server.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/server.js) | [dist/server.min.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/server.min.js) |

## `stateless` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/stateless.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/stateless.min.js.gz)

> `require('okwolo/bundles/stateless');`

```diff
  okwolo-dom
  okwolo-router
- okwolo-state
- okwolo-history
```

| | transpiled | transpiled + minified |
|---|---|---|
| browser | [dist/stateless.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/stateless.js) | [dist/stateless.min.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/stateless.min.js) |

## `routerless` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/routerless.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/routerless.min.js.gz)

> `require('okwolo/bundles/routerless');`

```diff
  okwolo-dom
- okwolo-router
  okwolo-state
  okwolo-history
```

| | transpiled | transpiled + minified |
|---|---|---|
| browser | [dist/routerless.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/routerless.js) | [dist/routerless.min.js](https://raw.githubusercontent.com/okwolo/okwolo/master/dist/routerless.min.js) |