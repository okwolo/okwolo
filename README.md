<p align="center">
    <a href="https://okwolo.org">
        <img src="https://user-images.githubusercontent.com/9319710/28757374-8e78376e-754f-11e7-84a1-7b2b2e540e56.png" alt="logo" width="600px">
    </a>
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/okwolo"><img src="https://img.shields.io/npm/v/okwolo.svg" alt="NPM version" /></a>
    <a href="https://travis-ci.org/okwolo/okwolo"><img src="https://travis-ci.org/okwolo/okwolo.svg?branch=master" alt="Build Status" /></a>
    <a href="https://codecov.io/gh/okwolo/okwolo"><img src="https://img.shields.io/codecov/c/github/okwolo/okwolo.svg" alt="Codecov" /></a>
    <a href="https://github.com/okwolo/dl/blob/master/standard.min.js.gz"><img src="https://img.shields.io/github/size/okwolo/dl/standard.min.js.gz.svg" alt="GZIP size" /></a>
</p>

---

# [okwolo](https://okwolo.org)

> light javascript framework to build web applications

* No build step necessary by default.
* Virtual DOM implementation for fast and efficient keyed layout updates.
* Built-in client-side router for instant page changes.
* Included state management solution which supports actions, middleware and watchers.
* Deeply customizable with support for asynchronous configuration.

## Quickstart

Install with npm and use with a code bundler.

```
npm install okwolo
```

```javascript
const okwolo = require('okwolo/standard');
```

Alternatively, the okwolo function can be loaded using a script tag. Transpiled (es5) versions of all kits are available from the website starting from v3.0.0.

```html
<!-- latest -->
<script src="https://dl.okwolo.org/standard.js"></script>
<!-- specific version -->
<script src="https://dl.okwolo.org/3.0.0/lite.min.js"></script>
```

Create your first app.

```javascript
const app = okwolo(document.body);

app.setState({});

app(() => () => (
    ['div.wrapper', {}, [
        ['h1', {}, [
            'Hello World!',
        ]],
    ]]
));
```

Visit the [website](https://okwolo.org) for more information.

## Documentation

Documentation is maintained on the project's [website](https://okwolo.org).

## Versioning

Versions follow the [smever convention](https://semver.org/). Because okwolo gives its users so much access into the internal workings, the surface area of changes that are considered "breaking" is large. This means major releases might happen more often that usual.

All changes are logged in the [changelog](https://github.com/okwolo/okwolo/blob/master/CHANGELOG.md).

## License

[MIT](https://github.com/okwolo/okwolo/blob/master/LICENSE)
