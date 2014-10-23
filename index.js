'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var defaults = require('lodash.defaults');

module.exports = function (fn, options) {
    options = defaults(options || {}, {
        once: false
    });
    var once = false;

    return through.obj(function (file, enc, cb) {
        var callback = function () {
            if (options.once) {
                once = true;
            }
            cb();
        };

        if (typeof(fn) === 'function') {
            if (!once) {
                return fn(file, enc, callback);
            } else {
                cb(null, file);
            }
        } else {
            return cb(new gutil.PluginError('gulp-callback', 'Callback is not function'));
        }
    });
};
