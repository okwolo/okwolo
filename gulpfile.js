'use strict';

const gulp = require('gulp');
const globby = require('globby');
const del = require('del');

gulp.task('copy-readme', () => {
    const readme = gulp.src('./README.md');
    return Promise.all(
        globby.sync('./packages/goo-*')
            .map((path) => readme.pipe(gulp.dest(path)))
    );
});

gulp.task('prepublish', ['copy-readme']);

gulp.task('clean', () => {
    return del([
        './packages/goo-*/README.md',
        './coverage',
        './goo.min.js*',
    ]);
});
