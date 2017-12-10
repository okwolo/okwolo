'use strict';

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const kit = (name) => ([
    {
        name,
        entry: `./src/kits/${name}.js`,
        output: `dist/${name}.min.js`,
        minified: true,
        gzipped: true,
    },
    {
        name,
        entry: `./src/kits/${name}.js`,
        output: `dist/${name}.js`,
        minified: false,
        gzipped: false,
    },
]);

const bundles = [
    {
        name: 'browser',
        entry: './src/kits/standard.js',
        output: 'okwolo.js',
        minified: false,
        gzipped: false,
    },
    {
        name: 'browser:minified',
        entry: './src/kits/standard.js',
        output: 'okwolo.min.js',
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
                        presets: ['env'],
                    },
                },
            }],
        },
        plugins,
    };
});
