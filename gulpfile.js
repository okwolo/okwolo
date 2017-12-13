'use strict';

const del = require('del');
const globby = require('globby');
const gulp = require('gulp');
const replace = require('gulp-replace');

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
        './okwolo*.js',
        './coverage',
        './npm-debug.log',
        './package-lock.json',
    ]);
});
