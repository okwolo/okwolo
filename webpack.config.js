module.exports = {
    entry: './goo-js/goo.js',
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
};
