https://github.com/g-harel/goo

<p align="center">
    <img src="https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png" width="350"/>
</p>

Goo.js is a small framework made to jumpstart projects by solving common web application challenges. The default goo package includes state management, layout and routing functionality. Each of these parts are separate stand-alone modules that are combined together into the final goo function. Details about each of the modules can be found in their respective sub directories, but they all have a common `.use` function that accepts goo's configuration objects called blobs.

# Layout

The first step in using goo is creating the master object that will contain the entire application.

````javascript
let app = goo(target[, initialState[, window]]);
````

The target is a DOM node that will serve as the root of the application. It can be changed after initialization. The initialState parameter is optional, but actions cannot be executed and no layout will be drawn until it is set. If there is a need to specify the window object, it can also be done during this initialization.

The app's layout can now be defined using the following syntax.

````javascript
let app = goo(document.body, null);

app(() => 'Hello World!');
````

The current state will be given as an argument to this function for it to create and return valid vdom.

````javascript
let app = goo(document.body, 'Hello World!');

app((state) => state);
````

The internal implementation of this function is entirely free. Which means that, for example, certain vdom "components" can be created in other places and assembled here.

There are two types of vdom objects. The first, which was used in the above example, is a simple string. The second type represents html tags. These vdom nodes take the form of an array.

````javascript
// text element
let vdom = 'Hello World!'; // Hello World!

// simple div element
let vdom = ['div']; // <div></div>

// attributes are placed at the second index
let vdom = ['div', {id: 'banner'}]; // <div id="banner"></div>

// children are placed at the third index using an array
let vdom = ['div', {}, ['Hello World!']]; //<div>Hello World!</div>
````

An element's id, class and style can be added to the first index.

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
let app = goo(document.body, ['orange', 'apple', 'pear']);

app((fruits) => (
    ['ul.fruit-list', {},
        fruits.map((fruit) => (
            ['li.fruit', {}, [
                fruit,
            ]]
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
let app = goo(document.body, null);

app('/route', (state) => {
    // ...
});
````

When a route is not specified, it is implied that the route is an empty string.

Arguments can also be passed through routes and they will be provided to the function as second argument.

````javascript
let app = goo(document.body, null);

app('/user/:uid/profile', (state, params) => {
    // params === {uid: "..."}
});
````

When the page loads, the current path name will be compared against registered routes. This means that a page refresh will show the right route if the server knows to return the same web page at this different route.

It is also possible to define a base route if the application is in a sub directory.

````javascript
let app = goo(document.body, null);

app.use({base: '/webapp'});

app('/main', () => 'Hello World!'); // will be shown at "/webapp/main"
````

To navigate between pages, there is a `redirect` function that can also pass params to the route's function.

`redirect(path[, params])`

````javascript
let app = goo(document.body, null);

app('/profile/:name', (state, params) => {
    return 'Hello ' + params.name + ' you are ' + params.status;
});

app.redirect('/profile/John123', {status: 'registered'});
````

When a route doesn't match with anything, the router will call a fallback function. It can be overridden with the use syntax.

````javascript
let app = goo(document.body, null);

app(() => 'Main Page');

app.use({fallback: () => {
    app.redirect('');
}});
````

An important consideration here is that since routes can be added at any point during the app's lifetime, the fallback will only be called when redirect is used or a popstate event is fired. A way to get around this would be to add some html into the target element which will be cleared when a route is matched.

A second important consideration is that it is possible for more than one route to match with the one provided. There is no mechanism to prioritize any specific route and the resulting layout cannot be guaranteed.

# Blobs

As mentioned earlier, goo and its modules have use function. This function takes a single object as argument that is called a blob. Blobs are very powerful since they are passed to each module and can contain many functionalities that are not at the top level of the goo api. A blob can have as many unique keys as necessary. Each key will be tested on each module to determine if that module supports it. The value assigned to each key can be a single object, or an array of objects (ex. adding multiple actions at once). This library is purposefully built to handle the addition of blobs in any order and after any amount of delay.

Here is an example of a blob that adds two watchers and one middleware.

````javascript
let app = goo(document.body, null);

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

# Pseudo-global space

An an object created with `goo()` will have an empty object at its `_` key. This can be used to declare helper functions or any other data. Since the app object is generally passed on to all "components", they will all have access to this space.

````javascript
let app = goo(document.body, null);

app._.formatDate = () => {
    // ...
};
````