var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var defaults = require('lodash.defaults');

const PLUGIN_NAME = 'gulp-callback';

module.exports = function (fn, options) {
    options = defaults(options || {}, {
        once: false
    });
    var once = false;

    return through.obj(function (file, enc, cb) {
        var self = this;
        
        if (file.isNull() || file.isDirectory()) {
            this.push(file);
            return cb();
        }
        
        if (file.isStream()) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var callback = function () {
            if (options.once) {
                once = true;
            }

            if (arguments[0] !== null) {
                if (arguments[0]) {
                    self.push(arguments[0]);
                } else {
                    self.push(file);
                }
            }

            cb();
        };

        if (typeof(fn) === 'function') {
            if (!once) {
                return fn(file, enc, callback);
            } else {
                this.push(file);

                cb();
            }
        } else {
            throw new PluginError(PLUGIN_NAME, 'Callback is not function');
        }
    });
};
