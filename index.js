'use strict';
var through = require('through2');
var gutil = require('gulp-util');

module.exports = function (fn) {
    return through.obj(function (file, enc, cb) {
        if (typeof(fn) === 'function') {
            return fn(file, enc, cb(file, null));
        } else {
            return cb(new gutil.PluginError('gulp-callback', 'Callback is not function'));
        }
    });
};
