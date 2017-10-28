'use strict';

const gulp = require('gulp');
const del = require('del');
const globby = require('globby');

const kitPattern = './src/kits/*.js';

// copy ./src/kits/ to ./
gulp.task('prepublish', () => {
    gulp.src(globby.sync([kitPattern]))
        .pipe(gulp.dest('./'));
});

gulp.task('clean', () => {
    // remove all files at the top level which have the same name
    // as the kits found in ./src/kits/
    const kits = globby.sync([kitPattern])
        .map((path) => path.replace(/.+?(\w+\.js)$/g, '$1'));
    return del([
        ...kits,
        'okwolo*.js',
        './coverage',
        './npm-debug.log',
        './package-lock.json',
    ]);
});
