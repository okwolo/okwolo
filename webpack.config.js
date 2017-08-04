'use strict';

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
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
        new CompressionPlugin({
            asset: '[path].gz',
            test: /okwolo\.min\.js$/,
        }),
    ],
};
