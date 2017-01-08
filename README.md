<p align="center">
    <img src="https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png" width="600"/>
</p>

GOO.js is a small framework made to quickly jumpstart projects by solving common challenges specific to web applications. A goo object handles state and the DOM representation of that state. By default it also adds actions to undo and redo state changes. Internally, goo has three components: a state reducer that does not mutate state, a wrapper for the state reducer to store the state and a DOM handler that uses virtual DOM.

Creating a goo object is done like this:

```javascript
var app = goo(args[, options]);
```

This goo object can now be used to update an application using it's `.act` function:

```javascript
app.act(action_type, params);
```

Calling this act function will update the state of the app and the DOM that is being rendered.

# `args`

The first argument of the goo function is `args`:

```javascript
var args = {
    target
    state
    actions
    builder
    middleware
    watchers
}
```

## `target`

An empty DOM node that will serve as the root of the application.

## `state`

The initial state of the app on which actions can be performed.

## `actions`

The definition of all actions that the goo object can do on the state.

The `actions` object can be either an array of objects that define actions or a single object containing all the actions.

```javascript
var actions = [
    {
        ADD_USER: //...
        REMOVE_USER: //...
    },
    {
        ADD_USER: //...
    }
]
```

or

```javascript
var actions = {
    ADD_USER: //...
    REMOVE_USER: //...
}
```

This allows for the separation of actions into logical groups that can then be joined into an array at the time of the creation of the goo object.

Actions in an array are executed in ascending order (An action in the `actions` object at index 0 will be called before the one at index 1).

An `action` itself can also take many forms.

The simplest way to define an action is with a single function.

```javascript
ADD_USER: function(state, params) {
    // ...
    return state;
}
```

This function can be replaced by an object if there is a need to define the scope of that action.

```javascript
ADD_USER: {
    target: ['path', 'to', 'scope'],
    do: function(scoped_state, params) {
        // ...
        return scoped_state;
    }
}
```

Both of these notations can be used within arrays if there is a need to call multiple functions for a single action.

```javascript
ADD_USER: [
    function(state, params) {
        // ...
        return state;
    },
    function(state, params) {
        // ...
        return state;
    }
]
```

This array is also executed in ascending order.

The params argument given to actions is the one given to the goo object's act function.

```javascript
app.act('ADD_USER', {
    name: 'John',
    age: '42',
    country: 'Canada'
})
```

## `builder`

A function that takes in state as an argument and returns a virtual DOM (vdom) representation of that state. The implementation details of how this function operates internally is not handled by the goo object and the only condition is that the output must be a valid vdom object.

```javascript
function builder(state) {
    // ...
    return {
        // vdom object ...
    };
}
```

A generic vdom object takes this form:

```javascript
var vdom_obj = {
    tagName: // ...
    attributes: // ...
    style: //...
    children: // ...
}
```

In the case of a textNode, the `tagName` property is replaced by a `text` property.

```javascript
var vdom_obj = {
    text: // ...
    attributes: // ...
    style: //...
    children: // ...
}
```

All properties of a vdom_obj except the `tagName` or `text` are optional.

The `children` property can be either a key/value object or an array. When it is defined as an object, goo's vdom diffing will be able to compare children to their actual ancestor in the previous state instead of the one at the same array index. This can potentially have serious performance implications since, for example, it will prevent unnecessary re-renders of all the elements in a list if the first item is removed.

## `middleware`

A single function or an array of functions that are given full control of an action on the state.

Before an action is done on the state, it is first through each of the middleware functions. In the case of an array of functions, each middleware function is nested within the previous one to allow async operations.

A middleware function takes the form:

```javascript
function middleware(callback, state, action_type, params) {
    // ...
    var next_state = callback(state, type, params);
    // ...
    return next_state;
}
```

This syntax gives full control to the middleware, allowing it to read, edit, cancel or perform async operations for any action.

## `watchers`

A single function or an array of functions that are called in ascending order after an action has been done on the state.

A watcher function takes the form:

```javascript
function watcher(state, action_type, params) {
    // ...
}
```

The state argument given to the watcher functions is a deep copy of the current state and therefore watchers cannot modify state without issuing another action.

# `undo/redo`

Instead of storing the whole state of an application after each action, goo stores only the action itself (action_type and params). When an undo action is called, all previous actions (except the one being undone) since the last buffer reset are called on the most distant state. On an redo action, only the most recently undone action is called on the current state. This approach is useful to save on memory space since only one full state and a finite amount of actions are stored.

For example, if the `history_length` is set to 20 and the `history_buffer` is set to 5. Every time the undo stack reaches 25, the five oldest actions are done on the most distant state to bring it to what it was 20 actions prior. The buffer can be disabled by setting the `history_buffer` to a value of 0 to keep history until exactly `history_length` actions ago. The actions to reset the buffer or to bring back the state to one action prior with undo operate in the same way regular actions would, except that they do not call the watcher functions. Only the entire "undo" or "redo" action will be watched, but middleware will be called for each hidden action.

Although this approach has its benefits, it can cause issues when watchers or middleware functions that have side-effects. For this reason, a traditional state history will be added as an alternative for applications that cannot not operate properly with the standard behavior.

# `options`

`history_compat`: use regular state history _(in development)_

`history_length`: minimum length of the undo history

`history_buffer`: number of actions past `history_length` after which the most distant state is caught up

`state_log`: action type, params and before/after state in console for each action