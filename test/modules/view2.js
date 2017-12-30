'use strict';

const v2 = require('../../src/modules/view2');

it('test', async () => {
    const app = o(v2);
    app(() => (a) => a);
    app.use('api', {render: (f) => app.send('state', f)});

    app.render(
        ['div', {}, [
            'span',
        ]]
    );
    await sleep();
    expect(wrapper.innerHTML)
        .toBe('<div>span</div>');

    let Component = (props, update) => {
        let test = 0;
        setTimeout(() => {
            ++test;
            update('test');
        }, 200);
        return (other) => (
            ['div.c', {}, [
                test,
                other ? other : null,
            ]]
        );
    };
    app.render(
        ['div', {}, [
            'as',
            [Component],
        ]]
    );
    await sleep();
    expect(wrapper.innerHTML)
        .toBe('<div>as<div class="c">0</div></div>');
    await sleep(220);
    expect(wrapper.innerHTML)
        .toBe('<div>as<div class="c">1test</div></div>');
});
