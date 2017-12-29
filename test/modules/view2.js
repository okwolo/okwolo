'use strict';

const v2 = require('../../src/modules/view2');

const log = async () => {
    await sleep();
    console.log(wrapper.innerHTML);
};

const qs = (s) => document.querySelector(s);

it('test', async () => {
    const app = o(v2);
    app(() => (a) => a);
    app.use('api', {render: (f) => app.send('state', f)});

    app.render(
        ['div', {}, [
            'span',
        ]]
    );
    await log();

    let Component = (props, update) => {
        let test = 0;
        console.log(update);
        return () => (
            ['div.c', {}, [
                test,
            ]]
        );
    };
    app.render(
        ['div', {}, [
            [Component],
        ]]
    );
    await log();
});
