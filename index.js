'use strict';
var through = require('through2');

module.exports = function (fn) {
    return through.obj(function (file, enc, cb) {
        if (typeof(v) === 'function') {
            fn(cb(file, null));
        }
    });
};
