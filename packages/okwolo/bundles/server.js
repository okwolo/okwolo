'use strict';

const core = require('../core');

const {assert, isDefined, isFunction} = require('@okwolo/utils')();

const singletons = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true,
};

const renderToString = (target, _vdom) => {
    assert(isFunction(target), 'server.dom.draw : target is not a function', target);
    const render = (vdom = {text: ''})=> {
        if (isDefined(vdom.text)) {
            return [vdom.text];
        }
        const {tagName, attributes = {}, children = []} = vdom;
        const formattedAttributes = Object.keys(attributes)
            .map((key) => {
                if (key === 'className') {
                    key = 'class';
                    attributes.class = attributes.className;
                }
                return `${key}="${attributes[key].toString()}"`;
            })
            .join(' ');
        if (isDefined(singletons[tagName]) && children.length < 1) {
            return [`<${`${tagName} ${formattedAttributes}`.trim()} />`];
        }
        return [
            `<${`${tagName} ${formattedAttributes}`.trim()}>`,
            ...children
                .reduce((acc, child) => {
                    return acc.concat(render(child));
                }, [])
                .map((line) => `  ${line}`),
            `</${tagName}>`,
        ];
    };
    target(render(_vdom).join('\n'));
};

const serverRender = () => ({
    name: 'okwolo-server-render',
    draw: renderToString,
    update: renderToString,
});

module.exports = core({
    modules: [
        require('@okwolo/dom'),
    ],
    blobs: [
        require('@okwolo/dom/blob'),
        serverRender,
    ],
    options: {
        bundle: 'server',
        browser: false,
        modules: {
            state: false,
            history: false,
            dom: true,
            router: false,
        },
    },
});
