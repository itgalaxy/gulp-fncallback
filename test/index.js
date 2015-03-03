/*global describe:false, it:false */
/*jshint expr: true */
/*jshint immed: false */
/* exported should */
var plugin = require('./../index');

var should = require('should');
var File = require('vinyl');
var es = require('event-stream');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');

const PLUGIN_NAME = 'gulp-callback';

function createVinyl(fileName, contents) {
    var base = path.join(__dirname, 'fixtures');
    var filePath = path.join(base, fileName);

    return new gutil.File({
        cwd: __dirname,
        base: base,
        path: filePath,
        contents: contents || fs.readFileSync(filePath)
    });
}

describe('gulp-callback', function() {
    it('should emit error when called plugin without arguments', function (done) {
        var error = new gutil.PluginError(PLUGIN_NAME, 'You have specified neither a valid transformFunction callback function nor a valid flushFunction callback function');

        (function () {
            plugin();
        }).should.throw(error);

        done();
    });

     it('should emit error when transformFunction is not function', function (done) {
        var error = new gutil.PluginError(PLUGIN_NAME, 'transformFunction callback is not a function');

        (function () {
            plugin({}, {});
        }).should.throw(error);

        done();
     });

    it('should emit error when flushFunction callback is not a function', function (done) {
        var error = new gutil.PluginError(PLUGIN_NAME, 'flushFunction callback is not a function');

        (function () {
            plugin(
                function () {},
                'test',
                {}
            );
        }).should.throw(error);

        done();
    });

    it('should pass when second argument is options', function (done) {
        var fakeFile = createVinyl('fakefile');

        var defaultOptions = {
            testProperty: 'testProperty'
        };
        var transformFunction = function (file, enc, callback, options) {
            options.should.containDeep(defaultOptions);
            callback();
        };
        var stream = plugin(transformFunction, defaultOptions);

        stream.on('data', function (data) { });

        stream.once('end', done);

        stream.write(fakeFile);
        stream.end();
    });

    it('should emit error when options is not object', function (done) {
        var error = new gutil.PluginError(PLUGIN_NAME, 'options is not an options object');

        (function () {
            plugin(
                function () {},
                function () {},
                function () {}
            );
        }).should.throw(error);

        done();
    });

    it('should pass options.streamOptions equivalently streamOptions', function (done) {
        var fakeFile = createVinyl('fakefile');

        var transformFunction = function (file, enc, callback, options) {
            callback();
        };
        var streamOptions = {
            allowHalfOpen: true
        };
        var stream = plugin(transformFunction, {
            streamOptions: streamOptions
        });

        stream.once('data', function (data) {
            this.allowHalfOpen.should.equal(streamOptions.allowHalfOpen)
        });

        stream.once('end', done);

        stream.write(fakeFile);
        stream.end();
    });

    it('should pass file when it isNull()', function (done) {
        var transformFunction = function () { }
        var stream = plugin(transformFunction);
        var emptyFile = {
            isNull: function () { return true; }
        };

        stream.once('data', function (data) {
            data.should.equal(emptyFile);
        });

        stream.once('end', done);

        stream.write(emptyFile);
        stream.end();
    });

    it('should pass file when it isDirectory()', function (done) {
        var transformFunction = function () { }
        var stream = plugin(transformFunction);
        var emptyFile = {
            isNull: function () { return false; },
            isDirectory: function () { return true; }
        };

        stream.once('data', function (data) {
            data.should.equal(emptyFile);
        });

        stream.once('end', done);

        stream.write(emptyFile);
        stream.end();
    });

    it('should emit error when file isStream()', function (done) {
        var transformFunction = function () { }
        var stream = plugin(transformFunction);
        var streamFile = {
            isNull: function () { return false; },
            isDirectory: function () { return false; },
            isStream: function () { return true; }
        };

        stream.on('error', function (error) {
            error.message.should.equal('Streaming not supported');
            done();
        });

        stream.write(streamFile);
        stream.end();
    });

    it('should pass with only transformFunction', function (done) {
        var fakeFile = createVinyl('fakefile');

        var transformFunction = function (file, enc, callback, options) {
            callback();
        };
        var stream = plugin(transformFunction);

        stream.on('data', function (data) {
            data.contents.toString().should.equal("streamwiththosecontents\n");
        });

        stream.once('end', done);

        stream.write(fakeFile);
        stream.end();
    });

    it('should pass with transformFunction with multiple files', function (done) {
        var files = [
            createVinyl('fakefile'),
            createVinyl('fakefile1')
        ].map(function (file) {
            return file;
        });

        var transformFunction = function (file, enc, callback, options) {
            callback();
        };
        var stream = plugin(transformFunction);

        stream.once('end', done);

        stream.on('data', function (data) {
            if (path.basename(data.path) === 'fakefile') {
                data.contents.toString().should.equal("streamwiththosecontents\n");
            }
            if (path.basename(data.path) === 'fakefile1') {
                data.contents.toString().should.equal("streamwiththosecontents1\n");
            }
        });

        files.forEach(function (file) {
            stream.write(file);
        });

        stream.end();
    });

    it('should pass with transformFunction with once true arguments', function (done) {
        var files = [
            createVinyl('fakefile'),
            createVinyl('fakefile1')
        ].map(function (file) {
            return file;
        });

        var countFired = 0;
        var transformFunction = function (file, enc, callback, options) {
            countFired++;
            callback();
        };
        var stream = plugin(transformFunction, {
            once: true
        });

        stream.on('data', function () { });

        stream.on('end', function () {
            countFired.should.equal(1);
            done();
        });

        files.forEach(function (file) {
            stream.write(file);
        });

        stream.end();
    });

    it('should emit error when in transformFunction if pass first(error) argument', function (done) {
        var fakeFile = createVinyl('fakefile');
        var error = new gutil.PluginError(PLUGIN_NAME, 'test error');

        var transformFunction = function (file, enc, callback, options) {
            callback('test error');
        };
        var stream = plugin(transformFunction);


        stream.on('error', function (error) {
            error.message.should.equal('test error');
            done();
        });

        stream.write(fakeFile);

        stream.end();
    });

    it('should pass when in transformFunction second argument new file', function (done) {
        var fakeFile = createVinyl('fakefile');

        var transformFunction = function (file, enc, callback, options) {
            var fakeFile = createVinyl('fakefile1');
            callback(null, fakeFile);
        };
        var stream = plugin(transformFunction);

        stream.once('end', done);

        stream.on('data', function (data) {
            data.contents.toString().should.equal("streamwiththosecontents1\n");
        });

        stream.write(fakeFile);

        stream.end();
    });

    it('should pass when in transformFunction second argument new file and third append true', function (done) {
        var fakeFile = createVinyl('fakefile');

        var transformFunction = function (file, enc, callback, options) {
            var fakeFile1 = createVinyl('fakefile1');
            callback(null, fakeFile1, true);
        };
        var stream = plugin(transformFunction);

        stream.once('end', done);

        stream.on('data', function (data) {
            if (path.basename(data.path) === 'fakefile') {
                data.contents.toString().should.equal("streamwiththosecontents\n");
            }
            if (path.basename(data.path) === 'fakefile1') {
                data.contents.toString().should.equal("streamwiththosecontents1\n");
            }
        });

        stream.write(fakeFile);

        stream.end();
    });

    it('should pass with transformFunction and flushFunction', function (done) {
        var fakeFile = createVinyl('fakefile');

        var transformFunction = function (file, enc, callback, options) {
            callback();
        };
        var flushFunction = function (callback, options) {
            this.push(fakeFile);
            callback();
        };
        var stream = plugin(transformFunction, flushFunction);

        stream.on('data', function (data) {
            data.contents.toString().should.equal("streamwiththosecontents\n");
        });

        stream.once('end', done);

        stream.write(fakeFile);
        stream.end();
    });

    it('should pass options equal arguments options in flushFunction', function (done) {
        var fakeFile = createVinyl('fakefile');

        var optionsDefault = {
            testProperty: 'testProperty'
        };
        var transformFunction = function (file, enc, callback, options) {
            callback();
        };
        var flushFunction = function (callback, options) {
            options.should.containDeep(optionsDefault);
            callback();
        };
        var stream = plugin(transformFunction, flushFunction, optionsDefault);

        stream.on('data', function () { });

        stream.once('end', done);

        stream.write(fakeFile);
        stream.end();
    });
});
