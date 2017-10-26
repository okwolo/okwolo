'use strict';

const gulp = require('gulp');
const del = require('del');
const globby = require('globby');

const kitPattern = './src/kits/*.js';

gulp.task('prepublish', () => {
    gulp.src(globby.sync([kitPattern]))
        .pipe(gulp.dest('./'));
});

gulp.task('clean', () => {
    const kits = globby.sync([kitPattern])
        .map((path) => path.replace(/.+?(\w+\.js)$/g, '$1'));
    return del([
        ...kits,
        'okwolo*.js',
        './coverage',
        './npm-debug.log',
    ]);
});
