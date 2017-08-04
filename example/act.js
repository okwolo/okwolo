'use strict';

const okwolo = require('okwolo');

const app = okwolo();

app.setState({
    friendlist: [],
});

app.use({action: {
    type: 'ADD_FRIEND',
    target: [],
    handler: (state, newFriend) => {
        state.friendlist.push(newFriend);
        return state;
    },
}});

const newFriend = {
    name: 'John',
    hobbies: ['kayaking', 'cooking'],
};

/* calling an ADD_FRIEND action and passing
   the newFriend to the action handler */
app.act('ADD_FRIEND', newFriend);
