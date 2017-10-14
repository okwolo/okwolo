'use strict';

const timer = async (subject) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                const startTime = Date.now();
                subject();
                setTimeout(() => {
                    window.requestAnimationFrame(() => {
                        resolve(Date.now() - startTime);
                    });
                }, 0);
            });
        }, 0);
    });
};

const app = okwolo(document.body);

const runner1 = async (done, testArea) => {
    const testSamples = 5;

    const numberOfRows = 25000;

    const tests = {
        [`Create ${numberOfRows} rows`]: () => Array(...Array(numberOfRows)).map(() => 'TEST'),
        'Diff with no changes': (temp) => temp,
        [`Append ${numberOfRows/10} rows`]: (temp) => temp.concat(temp.slice(0, numberOfRows/10)),
        [`Remove ${numberOfRows/10} rows`]: (temp) => temp.slice(0, numberOfRows),
        'Update 25% of rows': (temp) => temp.map(() => Math.random() < 0.25 ? 'UPDATED' : 'TEST'),
        'Update all rows': (temp) => temp.map(() => 'UPDATED'),
        'Remove all rows': () => [],
    };

    const testApp = okwolo(testArea);

    testApp.setState({});

    // this is not kept in the state to optimize for performance.
    // the array is modified and the testApp is updated to rerender.
    let rowContents = [];

    testApp(() => () => (
        ['div', {},
            rowContents.map((contents) => (
                ['div', {}, [
                    ['td', {}, [
                        contents,
                    ]],
                ]]
            )),
        ]
    ));

    const averages = [];
    for (let i = 1; i <= testSamples; ++i) {
        const times = [];
        const testKeys = Object.keys(tests);
        for (let i = 0; i < testKeys.length; ++i) {
            rowContents = tests[testKeys[i]](rowContents).slice();
            const testTime = await timer(testApp.update);
            times.push(testTime);
        }
        // add new sample times to the current average
        times.forEach((time, index) => {
            averages[index] = 1/i * time + (averages[index] || 0) * (i-1)/i;
        });
    }

    const fastestTest = Math.min(...averages);
    const scaledAverages = averages.map((value) => value/fastestTest);

    done(
        ['table', {},
            Object.keys(tests).map((title, index) => (
                ['tr', {}, [
                    ['td', {}, [
                        title,
                    ]],
                    ['td', {}, [
                        scaledAverages[index].toFixed(2),
                    ]],
                    ['td', {}, [
                        averages[index].toFixed(1),
                        'ms',
                    ]],
                ]]
            )),
        ]
    );
};

const runner2 = async (done, testArea) => {
    const multiplier = 200;

    const defaultSetup = (app) => {
        app.setState({});
        app(() => () => '');
        app.use({action: {
            type: 'TEST',
            target: [],
            handler: (state) => state,
        }});
    };

    const setups = {
        'wide state': (app) => {
            const state = Array(...Array(multiplier)).map(() => ({
                test: 'test',
                other: Array(...Array(multiplier)).map(() => ({
                    test: 'test',
                })),
            }));
            app.setState(state);
        },
        'deep state': (app) => {
            const state = {};
            const levelPointer = state;
            for (let i = 0; i < multiplier; ++i) {
                levelPointer.test = {};
                levelPointer = levelPointer.test;
            }
            levelPointer.test = 'test';
            app.setState(state);
        },
        'multiple actions': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({action: {
                    type: String(Math.random()),
                    target: [],
                    handler: (state) => state,
                }});
            }
        },
        'multiple actions of same type': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({action: {
                    type: 'TEST',
                    target: [],
                    handler: (state) => state,
                }});
            }
        },
        'action with deep target': (app) => {
            const target = Array(...Array(multiplier)).map(() => 'test');
            app.use({action: {
                type: 'TEST',
                target,
                handler: (state) => state,
            }});
        },
        'multiple middleware': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({middleware: (next, state, actionType, params) => {
                    next(state, actionType, params);
                }});
            }
        },
        'multiple watchers': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({watcher: (state, actionType, params) => {
                    return [state, actionType, params];
                }});
            }
        },
        'multiple routes': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({route: {
                    path: String(Math.random()),
                    handler: () => app(() => () => 'TEST'),
                }});
            }
        },
    };
};

const runners = [
    runner1,
    runner2,
];

app.setState({
    suites: [
        {
            title: 'Test1',
            running: false,
            result: null,
        },
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
