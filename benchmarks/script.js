'use strict';

const app = okwolo(document.body);

const runners = [
    (done, testArea) => {
        setTimeout(() => {
            testArea.innerHTML = 'done';
            done(
                ['h1', {}, [
                    'RESULTS ARE IN !!!',
                ]]
            );
        }, 1000);
        testArea.innerHTML = 'running';
        console.log('test1');
    },
];

app.setState({
    suites: [
        {
            title: 'Test1',
            running: false,
            result: null,
        },
    ],
});

app.use({action: {
    type: 'RUN',
    target: ['suites'],
    handler: (suites, {index}) => {
        suites[index].running = true;
        const testArea = document.querySelectorAll('.test-area')[index];
        const callback = (result) => {
            app.act('DONE', {index, result});
        };
        runners[index](callback, testArea);
        return suites;
    },
}});

app.use({action: {
    type: 'DONE',
    target: ['suites'],
    handler: (suites, {index, result}) => {
        suites[index].running = false;
        suites[index].result = result;
        return suites;
    },
}});

app(() => ({suites}) => (
    ['div | width: 800px; margin-left: calc(50vw - 400px);', {},
        suites.map((suite, index) => (
            ['div.test | width: 100%;', {}, [
                ['h1 | display: inline-block;', {}, [
                    suite.title,
                ]],
                ['button', {
                    onclick: () => app.act('RUN', {index}),
                    disabled: suite.running,
                }, [
                    'run',
                ]],
                ['table | width: 100%;', {}, [
                    ['tr', {}, [
                        ['td | width: 50%;', {}, [
                            ['h3', {}, [
                                'Test Area',
                            ]],
                            [`div.test-area |
                                overflow-y: scroll;
                                height: 300px;
                            `],
                        ]],
                        ['td | width: 50%; vertical-align: top;', {}, [
                            ['h3', {}, [
                                'Result Area',
                            ]],
                            ['div.result-area', {}, [
                                suite.result,
                            ]],
                        ]],
                    ]],
                ]],
            ]]
        )),
    ]
));
