'use strict';

const timer = async (subject) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                const startTime = Date.now();
                try {
                    subject();
                } catch (e) {
                    console.warn(e);
                    resolve(NaN);
                }
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

    const numberOfRows = 10000;

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
        app('/test', () => () => 'test');
        app(() => () => '');
        app.use({action: {
            type: 'TEST',
            target: [],
            handler: (state) => state,
        }});
        app.act('TEST');
        app.act('TEST');
    };

    const setups = {
        'baseline': () => {},
        'large state': (app) => {
            const deepBranch = {};
            let levelPointer = deepBranch;
            for (let i = 0; i < multiplier; ++i) {
                levelPointer.test = {};
                levelPointer = levelPointer.test;
            }
            levelPointer.test = 'test';
            const state = Array(...Array(multiplier)).map(() => ({
                test: deepBranch,
            }));
            app.setState(state);
        },
        'many actions': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({action: {
                    type: String(Math.random()),
                    target: [],
                    handler: (state) => state,
                }});
            }
        },
        'many actions of same type': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({action: {
                    type: 'TEST',
                    target: [],
                    handler: (state) => state,
                }});
            }
        },
        'many middleware': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({middleware: (next, state, actionType, params) => {
                    next(state, actionType, params);
                }});
            }
        },
        'many watchers': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({watcher: (state, actionType, params) => {
                    return [state, actionType, params];
                }});
            }
        },
        'many routes': (app) => {
            for (let i = 0; i < multiplier; ++i) {
                app.use({route: {
                    path: String(Math.random()),
                    handler: () => app(() => () => 'TEST'),
                }});
            }
        },
        'expensive builder': (app) => {
            app.use({builder: () => {
                let temp = 0;
                for (let i = 0; i < multiplier ** 3; ++i) {
                    temp += Math.sqrt(i/Math.PI/Math.random())/(i+1);
                }
                return temp;
            }});
        },
        'large output tree': (app) => {
            app.use({builder: () => {
                const grandChildren = Array(...Array(multiplier/10)).map(() => ['span', {}, ['test']]);
                return (
                    ['div', {},
                        Array(...Array(multiplier/10)).map(() => ['div', {}, grandChildren]),
                    ]
                );
            }});
        },
    };

    const tests = {
        'app.update': (app) => {
            app.update();
        },
        'app.act': (app) => {
            app.act('TEST');
        },
        'app.show': (app) => {
            app.show('/test');
        },
        'app.setState': (app) => {
            app.setState({});
        },
        'app.undo': (app) => {
            app.undo();
        },
    };

    const resetTestArea = () => {
        testArea.innerHTML = '';
    };

    const results = Object.keys(setups).map(() => Object.keys(tests));

    for (let i = 0; i < results.length; ++i) {
        for (let j = 0; j < results[i].length; ++j) {
            resetTestArea();
            const testApp = okwolo(testArea);
            defaultSetup(testApp);
            setups[Object.keys(setups)[i]](testApp);
            results[i][j] = await timer(() => {
                tests[Object.keys(tests)[j]](testApp);
            });
        }
    }
    resetTestArea();

    results.forEach((row, index) => {
        row.unshift(Object.keys(setups)[index]);
    });

    results.unshift([''].concat(Object.keys(tests)));

    done(
        ['table', {},
            results.map((row) => (
                ['tr', {},
                    row.map((cell) => (
                        ['td', {}, [
                            cell,
                        ]]
                    )),
                ]
            )),
        ]
    );
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
                        ['td | width: 25%;', {}, [
                            ['h3', {}, [
                                'Test Area',
                            ]],
                            [`div.test-area |
                                overflow-y: scroll;
                                height: 300px;
                            `],
                        ]],
                        ['td | width: 75%; vertical-align: top;', {}, [
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
