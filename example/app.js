(function() {

    // focus on the form
    focusForm();

    // localStorage key
    const storageKey = 'GOO demo';

    // read from storage or use empty
    const state = JSON.parse(localStorage.getItem(storageKey)) || {tasks:[]};

    // define state actions
    const actions = {
        ADD: (state, params) => {
            state.tasks.push(params);
            return state;
        },
        REMOVE: (state, params) => {
            state.tasks.splice(params, 1);
            return state;
        }
    }

    // define builder function
    const build = (state) => {
        return {
            tagName: 'div',
            attributes: { className: 'task-wrapper' },
            children: state.tasks.map((task, index) => {
                return {
                    tagName: 'div',
                    attributes: {
                        className: 'task',
                        onclick: function() {
                            app.act('REMOVE', index);
                            focusForm();
                        }
                    },
                    children: [{
                        text: task
                    }]
                }
            }),
        }
    }

    // saves state after every change
    const saveState = (state) => {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    // creating goo object
    const app = goo({
        target: document.querySelector('.task-list'),
        builder: build,
    },{
        state: state,
        actions: actions,
        watchers: saveState,
    }, {
        state_log: true,
    });

    // add listeners to submit form
    document.querySelector('.add').addEventListener('click', submitForm);
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

    // reads form input and acts on state
    function submitForm() {
        const form = document.querySelector('.description-form');
        if (form.value.trim()) {
            app.act('ADD', form.value);
            form.value = '';
        }
        focusForm(form);
    }

    // places cursor inside form
    function focusForm(form) {
        form = form || document.querySelector('.description-form');
        form.focus();
        form.select();
    }

}())