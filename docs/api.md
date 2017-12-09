# Top level api

````javascript
// creates the app
okwolo(target[, window]);
  // target: DOM node
  // window: window object can be specified if needed
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/okwolo.js)

#

````javascript
// defines the layout of your app
app(init)
  // init: function that returns an element builder function [() => (state) => element]
app(route, init);
  // route: string pattern to match paths (same as in express)
  // init: function that returns an element builder function [(routeParams) => (state) => element]
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/app.js)

#

````javascript
// sets the state from which layout is created
app.setState(state);
  // state: an object to replace the current state
app.setState(updater);
  // updater: function that returns the new state [(currentState) => ... newState]
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/setstate.js)

#

````javascript
// returns a copy of the current state
app.getState();
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/getstate.js)

#

````javascript
// changes the path and renders layout from the new route
app.redirect(path[, params]);
  // path: string of the new pathname
  // params: object to be passed to the route handler
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/redirect.js)

#

````javascript
// renders layout from the new route
app.show(path[, params]);
  // path: string of the requested route's path
  // params: object to be passed to the route handler
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/show.js)

#

````javascript
// executes an action on the state
app.act(type[, params]);
  // type: string of the action type
  // params: arguments given to the action handler
app.act(action);
  // action: function that returns the new state [(currentState) => ... newState]
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/act.js)

#

````javascript
// adds a blob to the app and sends it to all modules
app.use(blob);
  // blob: the blob to be added
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/use.js)

#

````javascript
// triggers a rerender from current state (for use when changes are not represented in the state)
app.update();
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/update.js)

#

````javascript
// undoes the last action (or setState)
app.undo();
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/undo.js)

#

````javascript
// redoes the previous action
app.redo();
````

[example](https://github.com/okwolo/okwolo/blob/master/docs/examples/redo.js)
