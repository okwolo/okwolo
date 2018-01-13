'use strict';

const CompressionPlugin = require('compression-webpack-plugin');
const PrepackPlugin = require('prepack-webpack-plugin').default;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

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
    ...kit('standard'),
    ...kit('lite'),
    ...kit('server'),
];

module.exports = bundles.map((options) => {
    const plugins = [];
    if (options.minified) {
        plugins.push(new PrepackPlugin({}));
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
