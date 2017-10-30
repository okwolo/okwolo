'use strict';

const server = require('../../src/kits/server');

describe('server', () => {
    it('should not require a browser window', () => {
        const _window = global.window;
        delete global.window;
        expect(() => server())
            .not.toThrow(Error);
        global.window = _window;
    });

    it('should not have state api', () => {
        const app = server();
        expect(app.act)
            .toBeFalsy();
        expect(app.undo)
            .toBeFalsy();
        expect(app.redo)
            .toBeFalsy();
    });

    it('should not have router api', () => {
        const app = server();
        expect(app.redirect)
            .toBeFalsy();
        expect(app.show)
            .toBeFalsy();
        expect(() => app('/', () => () => 'test'))
            .toThrow(Error);
    });

    it('should have the dom api', () => {
        const app = server();
        expect(app.update)
            .toBeInstanceOf(Function);
    });

    it('should render dom to the target', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['div']
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<div>\n</div>');
    });

    it('should render attributes', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['div', {
                id: 'test',
                style: 'width: 20px;',
            }]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<div id="test" style="width: 20px;">\n</div>');
    });

    it('should translate classNames', () => {
        const test = jest.fn();
        const app = server(test);
        app.setState({});
        app(() => () => (
            ['div.test']
        ));
        expect(test)
            .toHaveBeenCalledWith('<div class="test">\n</div>');
        app(() => () => (
            ['div', {
                className: {
                    test1: true,
                    test2: false,
                    test3: true,
                },
            }]
        ));
        expect(test)
            .toHaveBeenCalledWith('<div class="test1 test3">\n</div>');
    });

    it('should recognize singleton html tags', () => {
        const test = jest.fn();
        const app = server(test);
        app.setState({});
        app(() => () => (
            ['div', {}, [
                ['area'],
                ['base'],
                ['br'],
                ['col'],
                ['command'],
                ['embed'],
                ['hr'],
                ['img'],
                ['input'],
                ['keygen'],
                ['link'],
                ['meta'],
                ['param'],
                ['source'],
                ['track'],
                ['wbr'],
            ]]
        ));
        expect(test)
            .toHaveBeenCalledWith(
                '<div>\n' +
              '  <area />\n' +
              '  <base />\n' +
              '  <br />\n' +
              '  <col />\n' +
              '  <command />\n' +
              '  <embed />\n' +
              '  <hr />\n' +
              '  <img />\n' +
              '  <input />\n' +
              '  <keygen />\n' +
              '  <link />\n' +
              '  <meta />\n' +
              '  <param />\n' +
              '  <source />\n' +
              '  <track />\n' +
              '  <wbr />\n' +
              '</div>'
            );
    });

    it('should correctly handle attributes on singletons', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['img', {
                src: 'https://example.com/test.png?q=test',
                alt: 'logo',
            }]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith('<img src="https://example.com/test.png?q=test" alt="logo" />');
    });

    it('should not use singletons when the tag has children', () => {
        const test = jest.fn();
        const app = server(test);
        app(() => () => (
            ['img', {}, [
                'test',
            ]]
        ));
        app.setState({});
        expect(test)
            .toHaveBeenCalledWith(
                '<img>\n' +
              '  test\n' +
              '</img>'
            );
    });

    it('should correctly render complex structures', () => {
        const app = server((output) => {
            expect(output)
                .toMatchSnapshot();
        });
        app(() => () => (
            ['span#body.center', {}, [
                ['center', {}, [
                    ['div#large | height: 200px; margin-top: 90px;', {}, [
                        ['div | padding-top: 100px;', {}, [
                            ['div#logo | background-size: 250px 90px; height: 90px; width: 250px;', {
                                title: 'Test',
                                align: 'left',
                            }, [
                                ['div.logo-subtext', {}, [
                                    'Subtext',
                                ]],
                            ]],
                        ]],
                    ]],
                    ['div | height: 120px;', {}],
                    ['div#prompt | margin-top: 10px;', {}, [
                        ['div#alias', {}, [
                            ['div#offer', {}, [
                                'Example.com offered in: ',
                                ['a', {
                                    href: 'https://example.com',
                                }, [
                                    'Français',
                                ]],
                            ]],
                        ]],
                        ['div#swimlanes', {}],
                    ]],
                ]],
            ]]
        ));
        app.setState({});
    });
});
