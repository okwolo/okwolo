'use strict';

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = [
    {
        name: 'browser',
        entry: './packages/okwolo',
        output: {
            path: __dirname,
            filename: 'packages/okwolo/okwolo.js',
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
    },
    {
        name: 'browser:minified',
        entry: './packages/okwolo',
        output: {
            path: __dirname,
            filename: 'packages/okwolo/okwolo.min.js',
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
        plugins: [
            new UglifyJSPlugin(),
        ],
    },
    {
        name: 'gzip',
        entry: './packages/okwolo',
        output: {
            path: __dirname,
            filename: 'okwolo.min.js',
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
        plugins: [
            new UglifyJSPlugin(),
            new CompressionPlugin({
                asset: '[path].gz',
                test: /okwolo\.min\.js$/,
            }),
        ],
    },
];
