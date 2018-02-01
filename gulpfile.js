'use strict';

const AWS = require('aws-sdk');
const del = require('del');
const fs = require('fs');
const globby = require('globby');
const gulp = require('gulp');
const replace = require('gulp-replace');

const {version} = require('./package.json');

const kitPattern = './src/kits/*.js';

// copy ./src/kits/ to ./
gulp.task('prepublish', () => {
    gulp.src(globby.sync([kitPattern]))
        // makes sure require statements still work correctly
        .pipe(replace(
            'require(\'.',
            'require(\'./src/kits/.'))
        .pipe(gulp.dest('./'));
});

gulp.task('clean', () => {
    // finds the path of all js files at the top level which have the same
    // name as the kits found in ./src/kits/
    const kits = globby.sync([kitPattern])
        .map((path) => path.replace(/.+?(\w+\.js)$/g, '$1'));

    return del([
        ...kits,
        './dist',
        './coverage',
        './npm-debug.log',
        './package-lock.json',
    ]);
});

// upload new published version to website
gulp.task('publish', async () => {
    if (!fs.existsSync('secret.json')) {
        console.error('couldn\'t read config file (secret.json)');
        return;
    }

    AWS.config.loadFromPath('secret.json');

    const s3 = new AWS.S3({
        apiVersion: '2018-1-1',
        params: {
            Bucket: 'aws-dl-okwolo-cr5ts',
        },
    });

    const kitNames = globby.sync([kitPattern])
        .map((path) => path.replace(/.+?(\w+)\.js$/g, '$1'));

    const files = [];
    kitNames.forEach((kit) => {
        const bundle = fs.readFileSync(`./dist/${kit}.js`, 'utf8');
        const bundleMin = fs.readFileSync(`./dist/${kit}.min.js`, 'utf8');

        files.push({
            content: bundle,
            path: `${kit}.js`,
        });
        files.push({
            content: bundleMin,
            path: `${kit}.min.js`,
        });

        files.push({
            content: bundle,
            path: `${version}/${kit}.js`,
        });
        files.push({
            content: bundleMin,
            path: `${version}/${kit}.min.js`,
        });
    });

    return Promise.all(files.map(({content, path}) => {
        return new Promise((resolve, reject) => {
            s3.upload({
                Key: path,
                Body: content,
                ContentEncoding: 'utf8',
                ContentType: 'application/javascript',
                ACL: 'public-read',
            }, (err, data) => {
                if (err) {
                    console.error(`error uploading ${path}`);
                    reject(err);
                }
                console.log(`uploaded ${path}`);
                resolve(data);
            });
        });
    }));
});
