https://github.com/g-harel/goo

<p align="center">
    <img src="https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png" width="350"/>
</p>

Goo.js is a small framework made to jumpstart projects by solving common web application challenges. The default goo package includes state management, layout and routing functionality. Each of these parts are separate stand-alone modules that are combined together into the final goo function. Details about each of the modules can be found in their respective sub directories, but they all have a common `.use` function that accepts goo's configuration objects called blobs.

# Top level api

````javascript
goo(target[, window]);
  // target: DOM node
  // window: window object can be specified if needed

app(init)
  // init: function that returns a vdom builder function [() => (state) => vdom]
app(route, init);
  // route: string pattern to match paths (same as in express)
  // init: function that returns a vdom builder function [(routeParams) => (state) => vdom]

app.setState(state);
  // state: an object to replace the current state
app.setState(updater);
  // updater: function that returns the new state [(currentState) => ... newState]

app.getState();
  // returns: a copy of the current state

app.redirect(path[, params]);
  // path: string of the new pathname
  // params: object to be passed to the route handler
  // returns: boolean value showing if path was matched

app.act(type[, params]);
  // type: string of the action type
  // params: arguments given to the action handler
app.act(action);
  // action: function to be called before updating the layout

app.use(blob);
  // blob: the blob to be added

app.update();
  // updates the app (when changes are not in state)

app.undo();
  // undo last action (must be on state)

app.redo();
  // redo previous action (must be on state)
````

# VDOM

### text element

````javascript
let vdom = 'Hello World!'; // Hello World!
````

### tag elements

````javascript
let vdom = ['div'];
  // <div></div>

let vdom = ['div', {id: 'banner'}];
  // <div id="banner"></div>

let vdom = ['div', {}, ['Hello World!']];
  // <div>Hello World!</div>

let vdom = ['div#banner'];
  // <div id="banner"></div>

let vdom = ['div.nav'];
  // <div class="nav"></div>

let vdom = ['div | height: 10px;'];
  // <div style="height: 10px;"></div>

let vdom = ['div#banner.nav.hidden | font-size: 20px;'];
  // <div id="banner" class="nav hidden" style="font-size: 20px;"></div>"
````

### component element

````javascript
let vdom = [makeDiv, 'className', 'content']
  // <div class="className">content</div>
````

# Example

````javascript
let app = goo(document.body);

app.setState(['orange', 'apple', 'pear']);

let fruitItem = (fruitName) => (
    ['li.fruit', {}, [
        fruitName,
    ]]
);

app(() => (fruits) => (
    ['ul.fruit-list', {},
        fruits.map((fruit) => (
            [fruitItem, fruit]
        )
    )]
));
````

````html
<ul class="blue fruit-list">
    <li class="fruit">orange</li>
    <li class="fruit">apple</li>
    <li class="fruit">pear</li>
</ul>
````

# Blobs

Goo and its modules all have a `use` function which takes a single object as argument called a blob. Blobs are very powerful since they are passed to each module and can contain many functionalities that are not at the top level of the goo api. A blob can have as many unique keys as necessary. Each key will be tested on each module to determine if that module supports it. The value assigned to each key can be a single object, or an array of objects (ex. adding multiple actions at once). This library is purposefully built to handle the addition of blobs in any order and at any time in an application's lifecycle.

Here is an example of a blob that adds two watchers and changes the target.

````javascript
let app = goo(document.body);

app.setState(null);

app.use({
    watcher: [
        (state, actionType, params) => {
            // ...
        },
        (state, actionType, params) => {
            // ...
        },
    ],
    target: // ...
});
````

Named blobs are an extension of regular blobs that ensure that the blob is only ever used once in a single app instance. This can be done by simply adding a "name" key to a blob and using it as before.

````javascript
let app = goo(document.body);

app.setState(null);

let myPlugin = {
    name: 'myPluginName',
    middleware: (next, state, actionType, params) => {
        // ...
        next();
    },
}

app.use(myPlugin);
app.use(myPlugin); // will not add the watcher again
````

Here is the list of the recognized blob keys and the modules that consume them.

| module     | recognized keys                                                                          |
|------------|------------------------------------------------------------------------------------------|
| goo-state  | `name`, `action`, `watcher`, `middleware`                                                |
| goo-router | `name`, `route`, `base`                                                                  |
| goo-dom    | `name`, `target`, `builder`, `state`, `draw`, `update`, `build`, `prebuild`, `postbuild` |

### action

````javascript
let action = {type, target, handler}
  // type: a string which names the action
  // target: an array to restrict the scope of an action to a specific "address" in the state
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

### watcher

Watchers cannot modify the state since they are given a copy, but they can issue more actions.

````javascript
let watcher = watcher
  // watcher: function that gets called after each state change [(state, actionType, params) => ...]
````

````javascript
let watcher = (state, actionType, params) => {
    console.log(`action of type ${actionType} was performed`);
};

app.use({watcher});
````

### middleware

````javascript
let middleware = middleware
  // middleware: function that is given control of an action before it is executed
  //    [(next, state, actionType, params) => ... next(state, actionType, params)]
````

This syntax allows middlware to be asynchronous.

If `next` is called with parameters, they will override the ones issued by the act call.

````javascript
let middlware = (next, state, actionType, params) => {
    if (params.test) {
        console.log('action changed to TEST');
        next(state, 'TEST', params);
    } else {
        next(state, actionType);
    }
};

app.use({middleware});
````

### route

````javascript
let route = {path, callback}
  // path: string pattern to match paths (same as in express)
  // callback: function that is called with the route params as argument [(params) => ...]
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

### base

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

### target



### builder



### state



### draw



### update



### build



### prebuild



### postbuild


