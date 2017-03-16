// dependencies
const goo = require('../goo-js/goo');
// const goo = require('goo-js');

// focus on the form
setTimeout(focusForm, 0);

// localStorage key
const storageKey = 'GOO demo';

// define default state
const defaultState = {
    tasks: [],
};

// read from storage or use default empty state
const state = JSON.parse(localStorage.getItem(storageKey)) || defaultState;

// define state actions
const actions = {
    ADD: {
        do: (tasks, params) => {
            tasks.push(params);
            return tasks;
        },
        target: ['tasks'],
    },
    REMOVE: (state, params) => {
        state.tasks.splice(+params, 1);
        return state;
    },
};

// define builder function
const build = (state) => [
    'div.wrapper',,, [
        ['img.logo', {src: 'https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png'}],
        ['div.form-wrapper',,, [
            ['input.description-form', {type: 'text'}],
            ['div.add', {onclick: submitForm},, [
                '+',
            ]],
        ]],
        ['div.hint',,, [
            'Use up and down arrow keys to redo/undo respectively',
        ]],
        ['div.task-list',,, [
            ['div.task-wrapper',,,
                state.tasks.map((task, index) => [
                    'div.task', {
                        onclick: `(REMOVE, ${index})`,
                    },, [
                        task,
                    ],
                ]),
            ],
        ]],
    ],
];

// saves state after every change
const saveState = (state) => {
    localStorage.setItem(storageKey, JSON.stringify(state));
};

// creating goo object
const app = goo({
    target: document.querySelector('.goo'),
    builder: build,
}, {
    state: state,
    actions: actions,
    watchers: [saveState, focusForm],
}, {
    stateLog: true,
});

// add listeners for enter key
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        submitForm();
    }
});

// add listeners to undo/redo keypresses
window.addEventListener('keydown', (e) => {
    if (e.keyCode == 40) {
        app.act('UNDO');
    } else if (e.keyCode == 38) {
        app.act('REDO');
    }
});

/**
 * reads form input and acts on state
 */
function submitForm() {
    const form = document.querySelector('.description-form');
    if (form.value.trim()) {
        app.act('ADD', form.value);
        form.value = '';
    }
}

/**
 * places cursor inside form
 */
function focusForm() {
    let form = document.querySelector('.description-form');
    form.focus();
    form.select();
}
