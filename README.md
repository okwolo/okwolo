https://github.com/g-harel/goo

<p align="center">
    <img src="https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png" width="350"/>
</p>

Goo.js is a small framework made to jumpstart projects by solving common web application challenges. The default goo package includes state management, layout and routing functionality. Each of these parts are separate stand-alone modules that are combined together into the final goo function. Details about each of the modules can be found in their respective sub directories, but they all have a common `.use` function that accepts goo's configuration objects called blobs.

# Layout

The first step in using goo is creating the master object that will contain the entire application.

````javascript
let app = goo(target[, window]);

app.setState(initialState);
````

The target is a DOM node that will serve as the root of the application. It can be changed after initialization. If there is a need to specify the window object, it can also be done during this initialization. For the app to start showing rendering, the state needs to be set using `setState()`.

The app's layout can now be defined using the following syntax.

````javascript
let app = goo(document.body);

app.setState(null);

app(() => () => 'Hello World!');
````

The function given to app should return a builder function that takes in state and returns vdom. The builder function is the only one that will be ran on updates. This allows some initialization to be done before returning it (this becomes especially handy with routes). Here is a more verbose example that is outputs results in the same thing as the previous example.

````javascript
let app = goo(document.body);

app.setState('Hello World!');

let builder = (state) => state;

let createBuilder = () => builder;

app(createBuilder);
````

The internal implementation of these functions is entirely free. Which means that, for example, certain vdom "components" can be created in other places and assembled here.

There are a few types of vdom objects. The first, which was used in the above example, is a simple string. The second type represents html tags. These vdom nodes take the form of an array. The last type is a "component" which is also an array. However, this array starts with a function and is followed by its arguments. Components are also nestable which allows a component to return another component.

````javascript
// text element
let vdom = 'Hello World!'; // Hello World!

// generic element
let vdom = ['div']; // <div></div>
let vdom = ['div', {id: 'banner'}]; // <div id="banner"></div>
let vdom = ['div', {}, ['Hello World!']]; // <div>Hello World!</div>

// component element
let vdom = [makeDiv, 'className', 'content'] // <div class="className">content</div>
````

In the case of the generic element, its id, class and style can be added to the first index.

````javascript
let vdom = ['div#banner']; // <div id="banner"></div>
let vdom = ['div.nav']; // <div class="nav"></div>
let vdom = ['div | height: 10px;']; // <div style="height: 10px;"></div>
````

These can be used together, as long as the order is preserved.

````javascript
let vdom = ['div#banner.nav.hidden | font-size: 20px;'];
// <div id="banner" class="nav hidden" style="font-size: 20px;"></div>"
````

Here is a more complex example where a list of fruits displayed.

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

# State Management

The only way to modify the state once it is set is by using `setState` or by calling an action using the `act` function.

Calling `setState` will re-render the layout with the new state.

`app.setState(newState)`

````javascript
app.setState(['peach', 'strawberry', 'banana']);
````

Actions can be defined with the app's `use` function.

````javascript
let app = goo(document.body);

app.setState([]);

app.use({action: {
    type: 'ADD',
    target: [],
    handler: (state, params) => {
        state.push(params);
        return state;
    }
}})
````

The action can then be applied to the state at any point in the future using the `act` function.

`app.act(type[, params])`

````javascript
app.act('ADD', 'kiwi');

app.getState(); // ['kiwi']
````

The target key can restrict the scope of an action to a specific "address".

````javascript
app.setState({
    name: 'John',
    hobbies: ['tennis', 'gardening'],
});

app.use({action: {
    type: 'REMOVE_HOBBY',
    target: ['hobbies'],
    handler: (hobbies, index) => {
        hobbies.splice(index, 1);
        return hobbies;
    },
}})

app.act('REMOVE_HOBBY', 0);

app.getState(); // {name: 'John', hobbies: ['gardening']}
````

Watcher functions can be added to the application. These will be called after an action is done on the state.

````javascript
app.use({watcher: (state, actionType, params) => {
    console.log('action was performed')
}});
````

Watchers cannot modify the state since they are given a copy, but they can issue more actions.

Middleware can also be added in order to control actions before they are done on the state.

````javascript
app.use({middleware: (next, state, actionType, params) => {
    // ...
    next(state, actionType, params);
}})
````

This syntax allows middlware to be asynchronous.

If `next` is called with parameters, they will override the ones issued by the act call.

Out of the box, goo adds undo and redo actions and provides a shortcut syntax.

````javascript
// undo
app.act('UNDO');
app.undo();

// redo
app.act('REDO');
app.redo();
````

Declaring an action type that starts with the `*` character will exclude the actions from the undo/redo stack. This can be useful to manipulate menus and other application functionality that does not change the data of the app.

# Routing

To create a new route, a new builder function needs to be defined.

````javascript
let app = goo(document.body);

app.setState(null);

app('/route', () => (state) => {
    // ...
});
````

When a route is not specified, it is implied that the route is a `*`. The route matching uses the same package as express, so the syntax should be familiar.

Arguments can also be passed through routes and they will be provided to the function.

````javascript
let app = goo(document.body);

app.setState(null);

app('/user/:uid/profile', (params) => (state) => {
    // params === {uid: "..."}
});
````

When the page loads, the current path name will be compared against registered routes. This means that a page refresh will show the right route if the server knows to return the same web page at this different route.

It is also possible to define a base route if the application is in a sub directory. This route needs to start with a forward slash for it to be properly interpreted by the browser.

````javascript
let app = goo(document.body);

app.setState(null);

app.use({base: '/webapp'});

app('/main', () => () => 'Hello World!'); // will be shown at "/webapp/main"
````

To navigate between pages, there is a `redirect` function that can also pass params to the route's function.

`redirect(path[, params])`

````javascript
let app = goo(document.body);

app.setState(null);

app('/profile/:name', (params) => (state) => {
    return 'Hello ' + params.name + ' you are ' + params.status;
});

app.redirect('/profile/John123', {status: 'registered'});
````

# Blobs

As mentioned earlier, goo and its modules have use function. This function takes a single object as argument that is called a blob. Blobs are very powerful since they are passed to each module and can contain many functionalities that are not at the top level of the goo api. A blob can have as many unique keys as necessary. Each key will be tested on each module to determine if that module supports it. The value assigned to each key can be a single object, or an array of objects (ex. adding multiple actions at once). This library is purposefully built to handle the addition of blobs in any order and after any amount of delay.

Here is an example of a blob that adds two watchers and one middleware.

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
    middleware: (next, state, actionType, params) => {
        // ...
        next();
    },
});
````

Named blobs are an extension of regular blobs that ensure that only one instance of a blob is ever used in a single app instance. This can be done by simply adding a "name" key to a blob and using it as before.

````javascript
let app = goo(document.body);

app.setState(null);

let myPlugin = {
    name: 'myPluginName',
    watcher: (state, actionType, params) => {
        // ...
    },
}

app.use(myPlugin);
app.use(myPlugin); // will not add the watcher again
````

Some blob keys are reserved/recognized and should not be given to a blob unless the behavior is intended. Here is the current list.

`name`, `action`, `middleware`, `watcher`, `route`, `base`, `target`, `builder`, `state`, `component`
