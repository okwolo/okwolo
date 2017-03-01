module.exports = {
    entry: './example/app.js',
    output: {
        path: __dirname + '/example/dist',
        filename: 'bundle.js',
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
