'use strict';

const gulp = require('gulp');
const del = require('del');

gulp.task('clean', () => {
    return del([
        './okwolo.js',
        './okwolo.min.js',
        './coverage',
        './npm-debug.log',
    ]);
});
