var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var lodash = require('lodash');

const PLUGIN_NAME = 'gulp-callback';

module.exports = function (transformFunction, flushFunction, options) {

    if (!transformFunction && !flushFunction) {
        throw new PluginError(PLUGIN_NAME, 'You have specified neither a valid transformFunction callback function nor a valid flushFunction callback function');
    }

    if (transformFunction && typeof transformFunction !== 'function') {
        throw new PluginError(PLUGIN_NAME, 'transformFunction callback is not a function');
    }

    if (flushFunction && typeof flushFunction !== 'function') {
        if (!options && typeof flushFunction === 'object') {
            options = flushFunction;
            flushFunction = null;
        } else if (options) {
            throw new PluginError(PLUGIN_NAME, 'flushFunction callback is not a function');
        }
    }

    if (options && typeof options !== 'object') {
        throw new PluginError(PLUGIN_NAME, 'options is not an options object');
    }

    options = lodash.defaults(options || {}, {
        once: false
    });
    var fireOnce = false;
    var streamOptions = options.streamOptions = lodash.defaults(options.streamOptions || {}, {
        objectMode: true
    });

    return through(streamOptions, function (file, enc, callback) {
        var self = this;

        if (file.isNull() || file.isDirectory()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var transformСallback = function (error, newFile, append) {
            if (options.once) {
                fireOnce = true;
            }

            if (!error) {
                if (newFile) {
                    self.push(newFile);

                    if (append) {
                        self.push(file);
                    }

                    callback();
                } else {
                    callback(null, file);
                }
            } else {
                return self.emit('error', new PluginError(PLUGIN_NAME, error));
            }
        };

        if (!fireOnce) {
            transformFunction.call(this, file, enc, transformСallback, options);
        } else {
            callback(null, file);
        }
    }, function (callback) {
        if (flushFunction) {
            flushFunction.call(this, callback, options);
        } else {
            callback();
        }
    });
};
