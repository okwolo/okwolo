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

const runner = async (done, testArea) => {
    const testSamples = 5;
    const numberOfRows = 10000;

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

    const tests = [
        {
            title: `Create ${numberOfRows} rows`,
            rows: () => Array(...Array(numberOfRows)).map(() => 'TEST'),
        },
        {
            title: `Append ${numberOfRows/10} rows`,
            rows: (temp) => temp.concat(temp.slice(0, numberOfRows/10)),
        },
        {
            title: `Remove ${numberOfRows/10} rows`,
            rows: (temp) => temp.slice(0, numberOfRows),
        },
        {
            title: 'Update 25% of rows',
            rows: (temp) => temp.map(() => Math.random() < 0.25 ? 'UPDATED' : 'TEST'),
        },
        {
            title: 'Update all rows',
            rows: (temp) => temp.map(() => 'UPDATED'),
        },
        {
            title: 'Do nothing',
            rows: (temp) => temp,
        },
        {
            title: 'Remove all rows',
            rows: () => [],
        },
    ];

    const averages = [];
    for (let i = 1; i <= testSamples; ++i) {
        const times = [];
        for (let i = 0; i < tests.length; ++i) {
            const {rows} = tests[i];
            rowContents = rows(rowContents).slice();
            const testTime = await timer(testApp.update);
            times.push(testTime);
        }
        times.forEach((time, index) => {
            averages[index] = 1/i * time + (averages[index] || 0) * (i-1)/i;
        });
    }

    done(
        ['table', {},
            tests.map(({title}, index) => (
                ['tr', {}, [
                    ['td', {}, [
                        title,
                    ]],
                    ['td', {}, [
                        averages[index].toFixed(1),
                    ]],
                ]]
            )),
        ]
    );
};

const runners = [
    runner,
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
    },
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
