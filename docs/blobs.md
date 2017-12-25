# Blobs

Okwolo apps have a `use` function which takes a single object as argument called a blob. Blobs are powerful configuration objects which all modules can listen for. This allows for customization far beyond what is available in the api. This library is purposefully built to handle the addition of blobs at any time in an application's lifecycle.

Here is an example of a blob that adds two watchers and adds a route.

````javascript
app.use({
    watcher: [myFirstWatcher, mySecondWatcher],
    route: myRoute
});
````

Blobs can also be named in order to ensure that they are only ever used once in a single app instance. This can be done by simply adding a "name" key.

````javascript
let myPlugin = {
    name: 'myPluginName',
    middleware: myMiddlware,
}

app.use(myPlugin);
app.use(myPlugin); // will not add the middleware again
````

## `action`

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

## `base`

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

## `build`

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
                              =>                    text: 'Hello World!',
                              =>                },
                              =>            ],
                              =>        };
````

## `builder`

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

## `draw`

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

## `middleware`

````javascript
let middleware = middleware
  // middleware: function that is given control of an action before it is executed
  //    [(next, state, actionType, params) => ... next([state[, actionType[, params]]])]
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

## `route`

````javascript
let route = {path, handler}
  // path: string pattern to match paths (using express' syntax)
  // handler: function that is called with the route params as argument [(routeParams) => ...]
````

````javascript
let route = {
    path: '/user/:uid/profile',
    handler: ({uid}) => {
        // ...
    },
};

app.redirect('/user/123/profile');
````

## `target`

````javascript
let target = target
  // target: dom node in which to draw the app
````

````javascript
let target = document.querySelector('.app-wrapper');

app.use({target});
````

## `update`

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

## `watcher`

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
