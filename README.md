gulp-fncallback
=============

Add own callback to streaming
[![Build Status](https://travis-ci.org/itgalaxy-company/gulp-fncallback.svg?branch=master)](https://travis-ci.org/itgalaxy-company/gulp-fncallback)

## Install

```
npm install gulp-fncallback
```

## Usage transformFunction
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      console.log(file);
      cb();
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Usage transformFunction and flushFunction
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      console.log(file);
      cb();
    }, function (callback) {
      callback();
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Usage transformFunction with error
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      console.log(file);
      cb('error');
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Usage transformFunction with new file
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      var newFile = ...
      cb(null, newFile);
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Usage transformFunction with new file and append old file
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      var newFile = ...
      cb(null, newFile, true);
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Options

once - Run callback once
```javascript
var less = require('gulp-less');
var callback = require('gulp-fncallback');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(callback(function (file, enc, cb) {
      console.log(file);
      cb();
    }, {
      once: true
    }))
    .pipe(gulp.dest('./public/css'));
});
```

