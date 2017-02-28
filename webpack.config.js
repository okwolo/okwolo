module.exports = {
    entry: './src/goo.js',
    output: {
        path: __dirname + '/src',
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
