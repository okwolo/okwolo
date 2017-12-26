# Kits

Okwolo is designed so that all functionality is provided by swappable modules. These modules can be used to add, modify or remove any features of the resulting apps. Kits represent different combinations of these modules which can be used to satisfy a wide variety of use cases. It is important to note that the order of modules can be important, especially in cases where one module depends on another. (ex. state and state.handler)

This document lists three useful configurations and lists their included modules diffed with the default standard kit. All kits can be found in their transpiled/minified/gzipped forms in the [dist folder](https://github.com/okwolo/okwolo/blob/master/dist). Most of the tools available to modules are also available after the app is instantiated and that the kit pattern exists primarily for development ergonomics.

## standard

[![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/standard.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/standard.min.js.gz)

> `require('okwolo');` or `require('okwolo/standard');`

Standard is the default kit and it includes the fullest set of features. Notably, the router uses the familiar matching logic from [express](https://www.npmjs.com/package/express) and the state can be manipulated using actions, watchers, middleware and undo/redo.

```diff
  view
  view.build
  view.dom
  state
  state.handler
  state.handler.history
  router
  router.register
  router.fetch
```

## lite

[![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/lite.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/lite.min.js.gz)

> `require('okwolo/lite');`

The lite kit is a trimmed down version of okwolo for projects where bundle size is a priority. It drops the advanced state management provided by the state handler and uses a simplified route registering module. This means that actions are not supported and that path params are the only special syntax understood by the router.

```diff
  view
  view.build
  view.dom
  state
- state.handler
- state.handler.history
  router
- router.register
+ router.register-lite
  router.fetch
```

## server

[![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/dist/server.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/dist/server.min.js.gz)

> `require('okwolo/server');`

The server kit is meant to be used as a server-side rendering tool. Since it is only concerned with producing html from state, there is no need for the router module or the elabotate state handling. The following example shows the minimal setup.

```javascript
// target is a callback which will receive the rendered html.
const app = okwolo((htmlString) => {
    // ...
});

// app will not render without state
app.setState({
    // ...
})

app(() => () => (
    ['div.app', {}, [
        // ...
    ]]
));
```

```diff
  view
  view.build
- view.dom
+ view.string
  state
- state.handler
- state.handler.history
- router
- router.register
- router.fetch
```
