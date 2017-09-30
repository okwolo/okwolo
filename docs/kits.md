# Kits

Okwolo is designed to be very modular and flexible in its lower layers. Each module is independant and connects itself to the features it wants to interact with. This means it is easy to simply remove the features that are not being used to save on bandwidth and/or performance. Kits are use this to exist as differnet configurations of okwolo with a variety of modifications, but always using the same api wrapper. For example, the lite kit totally drops the advanced state management and uses a simplified pathname matcher in the router.

## `standard` [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/standard.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js.gz)

> `require('okwolo');` or `require('okwolo/kits/standard');`

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

> `require('okwolo/kits/lite');`

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

> `require('okwolo/kits/server');`

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
