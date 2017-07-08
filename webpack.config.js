const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    entry: './packages/goo-js',
    output: {
        path: __dirname + '/',
        filename: 'goo.min.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                    },
                },
            },
        ],
    },
    plugins: [
        new CompressionPlugin({
            asset: '[path].gz',
            test: /goo\.min\.js$/,
        }),
    ],
};
