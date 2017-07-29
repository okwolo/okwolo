# [okwolo](https://github.com/okwolo/okwolo) [![Build Status](https://travis-ci.org/okwolo/okwolo.svg?branch=master)](https://travis-ci.org/okwolo/okwolo) [![Codecov](https://img.shields.io/codecov/c/github/okwolo/okwolo.svg)]() [![NPM version](https://img.shields.io/npm/v/okwolo.svg)](https://www.npmjs.com/package/okwolo) [![gzipped size](https://img.shields.io/github/size/okwolo/okwolo/okwolo.min.js.gz.svg)](https://github.com/okwolo/okwolo/blob/master/okwolo.min.js.gz)

Okwolo is a small framework made to jumpstart projects by solving common web application challenges. The default okwolo package includes state management, layout and routing functionality. All modules have a common `.use` function that accepts okwolo's configuration objects called blobs.

# Top level api

````javascript
// creates the app
okwolo(target[, window]);
  // target: DOM node
  // window: window object can be specified if needed

// defines the layout of your app
app(init)
  // init: function that returns an element builder function [() => (state) => element]
app(route, init);
  // route: string pattern to match paths (same as in express)
  // init: function that returns an element builder function [(routeParams) => (state) => element]

// sets the state from which layout is created
app.setState(state);
  // state: an object to replace the current state
app.setState(updater);
  // updater: function that returns the new state [(currentState) => ... newState]

// returns a copy of the current state
app.getState();

// changes the path and renders layout from the new route
app.redirect(path[, params]);
  // path: string of the new pathname
  // params: object to be passed to the route handler

// renders layout from the new route
app.show(path[, params]);
  // path: string of the requested route's path
  // params: object to be passed to the route handler

// executes an action on the state
app.act(type[, params]);
  // type: string of the action type
  // params: arguments given to the action handler
app.act(action);
  // action: function that returns the new state [(currentState) => ... newState]

// adds a blob to the app and sends it to all modules
app.use(blob);
  // blob: the blob to be added

// triggers a rerender from current state (for use when changes are not represented in the state)
app.update();

// undoes the last action (or setState call)
app.undo();

// redoes the previous action
app.redo();
````

# Syntax

### text element

````javascript
let elem = textContent;
  // textContent: content of the textNode
````

````javascript
let elem = 'Hello World!';
  // Hello World!
````

### tag element

````javascript
let elem = [tagName, attributes, children];
  // tagName: string representing the dom tag's name
  // attributes: object containing all attributes of the element
  // children: array of child elements
````

````javascript
let elem = ['div'];
  // <div></div>

let elem = ['div', {id: 'banner'}];
  // <div id="banner"></div>

let elem = ['div', {}, ['Hello World!']];
  // <div>Hello World!</div>

let elem = ['div#banner'];
  // <div id="banner"></div>

let elem = ['div.nav'];
  // <div class="nav"></div>

let elem = ['div | height: 10px;'];
  // <div style="height: 10px;"></div>

let elem = ['div#banner.nav.hidden | font-size: 20px;'];
  // <div id="banner" class="nav hidden" style="font-size: 20px;"></div>"
````

Elements can also specify if they should be updated.

````javascript
let elem = ['div', {shouldUpdate: false}, [
  // ...
]]
````

### component element

````javascript
let elem = [component, props, children];
  // component: function which returns an element [(props) => element]
  // props: object containing all props for the component
  // children: array of child elements
````

````javascript
let component = ({children, color}) => (
    ['div', {style: `color: ${color}`}, children]
);

let elem = [component, {color: 'red'}, ['content']]
  // <div style="color: red;">content</div>
````

# Example

````javascript
let app = okwolo(document.body);

app.setState(['orange', 'apple', 'pear']);

let FruitItem = ({type}) => (
    ['li.fruit', {}, [
        type,
    ]]
);

app(() => (fruits) => (
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

# Blobs

Okwolo and its modules all have a `use` function which takes a single object as argument called a blob. Blobs are very powerful since they are understood by all modules and allow access to deeper layers than the top level api.

A blob can have as many unique keys as necessary. Each key will be tested on each module to determine if that module supports it. The value assigned to each key can be a single object, or an array of objects (ex. adding multiple actions at once). This library is purposefully built to handle the addition of blobs in any order and at any time in an application's lifecycle.

Here is an example of a blob that adds two watchers and adds a route.

````javascript
app.use({
    watcher: [myFirstWatcher, mySecondWatcher],
    route: myRoute
});
````

Named blobs are an extension of regular blobs that ensure that the blob is only ever used once in a single app instance. This can be done by simply adding a "name" key to a blob and using it as before.

````javascript
let myPlugin = {
    name: 'myPluginName',
    middleware: myMiddlware,
}

app.use(myPlugin);
app.use(myPlugin); // will not add the middleware again
````

Here is the list of the recognized blob keys and the modules that consume them.

| module         | recognized keys                                                                          |
|----------------|------------------------------------------------------------------------------------------|
| @okwolo/state  | `name`, `action`, `watcher`, `middleware`                                                |
| @okwolo/router | `name`, `route`, `base`                                                                  |
| @okwolo/dom    | `name`, `target`, `builder`, `state`, `draw`, `update`, `build`, `prebuild`, `postbuild` |

### `action`

````javascript
let action = {type, target, handler}
  // type: string which names the action
  // target: array to restrict the scope of an action to a specific "address" in the state
  //   OR    function which returns the action's target [(state, params) => ... target]
  // handler: function that makes the change on the target [(target, params) => modifiedTarget]
````

````javascript
app.setState({
    name: 'John',
    hobbies: ['tennis', 'gardening'],
});

let action = {
    type: 'REMOVE_HOBBY',
    target: ['hobbies'],
    handler: (hobbies, index) => {
        hobbies.splice(index, 1);
        return hobbies;
    },
};

app.use({action});

app.act('REMOVE_HOBBY', 0);

app.getState(); // {name: 'John', hobbies: ['gardening']}
````

### `watcher`

````javascript
let watcher = watcher
  // watcher: function that gets called after each state change [(state, actionType, params) => ...]
````

Watchers cannot modify the state since they are given a copy, but they can issue more actions.

````javascript
let watcher = (state, actionType, params) => {
    console.log(`action of type ${actionType} was performed`);
};

app.use({watcher});
````

### `middleware`

````javascript
let middleware = middleware
  // middleware: function that is given control of an action before it is executed
  //    [(next, state, actionType, params) => ... next(state[, actionType[, params]])]
````

This syntax allows middlware to be asynchronous.

If `next` is called with parameters, they will override the ones issued by the act call.

````javascript
let middlware = (next, state, actionType, params) => {
    if (params.test) {
        console.log('action changed to TEST');
        next(state, 'TEST');
    } else {
        next();
    }
};

app.use({middleware});
````

### `route`

````javascript
let route = {path, callback}
  // path: string pattern to match paths (using express' syntax)
  // callback: function that is called with the route params as argument [(routeParams) => ...]
````

````javascript
let route = {
    path: '/user/:uid/profile',
    callback: ({uid}) => {
        // ...
    },
};

app.redirect('/user/123/profile');
````

### `base`

````javascript
let base = base
  // base: string specifying the base url of the page(s)
````

````javascript
let base = '/subdir/myapp';

app.use({base});

app.redirect('/users');
  // navigates to '/subdir/myapp/users'
  // matches routes for '/users'
````

### `target`

````javascript
let target = target
  // target: dom node in which to draw the app
````

````javascript
let target = document.querySelector('.app-wrapper');

app.use({target});
````

### `builder`

````javascript
let builder = builder
  // builder: function which creates an element out of state [(state) => element]
````

````javascript
let builder = (state) => (
    ['div | background-color: red;', {} [
       ['span.title', {} [
           state.title,
       ]]
    ]]
);

app.use(builder);
````

### `state`

````javascript
let state = state
  // state: object to update ONLY the layout's state
````

It is not recommended to use this key. It will ONLY change the state of the DOM module.

````javascript
let app = okwolo(document.body);

app.setState('originalState');

app(() => (state) => (
    ['span', {}, [
        state,
    ]]
));
// <span>originalState</span>

app.use({state: 'newState'});
// <span>newState</span>

app.getState();
// 'originalState'

app.update();
// <span>originalState</span>
````

### `draw`

````javascript
let draw = draw
  // draw: function that handles the initial drawing to a new target [(target, vdom) => ... vdom]
````

Using this blob key will override the default draw function.

````javascript
let draw = (target, vdom) => {
    target.innerHTML = magicallyStringify(vdom);
    return vdom;
};

app.use({draw})
````

### `update`

````javascript
let update = update
  // update: function that updates the target with new vdom [(target, vdom, currentVdom) => ... vdom]
````

Using this blob key will override the default update function.

By overriding both the draw and the update functions it is possible to "render" to any target in any way.

Here is an example of an app that renders to a string instead of a DOM node.

````javascript
let realTarget = '';

let renderToTarget = (target, vdom) => {
    realTarget = magicallyStringify(vdom);
    return vdom;
};

app.use({
    draw: renderToTarget,
    update: renderToTarget,
})
````

### `build`

````javascript
let build = build
  // build: function that creates VDOM out of the return value of an element [(element) => vdom]
````

````javascript
let element = (               =>        let vdom = {
    ['div#title', {}, [       =>            tagName: 'div',
        'Hello World!',       =>            attributes: {
    ]]                        =>                id: 'title',
);                            =>            },
                              =>            children: [
                              =>                {
                              =>                    text: 'Hello World!'
                              =>                }
                              =>            ],
                              =>        };
````

### `prebuild`

````javascript
let prebuild = prebuild
  // prebuild: function to manipulate elements before they are passed to build [(element) => ... element]
````

Here is an example which wraps the app in a div.

````javascript
let prebuild = (original) => (
    ['div | width: 100vw;', {},
        original,
    ]
);

app.use({prebuild});
````

### `postbuild`

````javascript
let postbuild = postbuild
  // postbuild: function to manipulate the vdom created by the build function [(vdom) => ... vdom]
````
