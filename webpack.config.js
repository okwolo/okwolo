'use strict';

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const kit = (name) => ([
    {
        name,
        entry: `./packages/okwolo/kits/${name}/index.js`,
        output: `dist/${name}.min.js`,
        minified: true,
        gzipped: true,
    },
    {
        name,
        entry: `./packages/okwolo/kits/${name}/index.js`,
        output: `dist/${name}.js`,
        minified: false,
        gzipped: false,
    },
]);

const bundles = [
    {
        name: 'browser',
        entry: './packages/okwolo',
        output: 'packages/okwolo/okwolo.js',
        minified: false,
        gzipped: false,
    },
    {
        name: 'browser:minified',
        entry: './packages/okwolo',
        output: 'packages/okwolo/okwolo.min.js',
        minified: true,
        gzipped: false,
    },
    ...kit('standard'),
    ...kit('lite'),
    ...kit('server'),
];

module.exports = bundles.map((options) => {
    const plugins = [];
    if (options.minified) {
        plugins.push(new UglifyJSPlugin());
    }
    if (options.gzipped) {
        plugins.push(new CompressionPlugin({
            asset: '[path].gz',
            test: new RegExp(`${options.output.replace('.', '\\.')}$`),
        }));
    }
    return {
        name: options.name,
        entry: options.entry,
        output: {
            path: __dirname,
            filename: options.output,
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                    },
                },
            }],
        },
        plugins,
    };
});
