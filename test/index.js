/*global describe:false, it:false */
/*jshint expr: true */
/*jshint immed: false */
/* exported should */
var callback = require('./../index');

var should = require('should');
var File = require('vinyl');
var es = require('event-stream');

describe('gulp-callback', function() {
    it('should works', function(done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback(function (file, enc, cb) {
            cb();
        });

        myCallback.write(fakeFile);

        myCallback.once('data', function(file) {
            file.isStream().should.be.true;

            file.contents.pipe(
                es.wait(function(err, data) {
                    data.should.equal('streamwiththosecontents');
                    done();
                })
            );
        });

        myCallback.end();
    });

    //is first argument function
    it('is first argument should function', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback(function (file, enc, cb) {
            cb();
        });

        (function () {
            myCallback.write(fakeFile);
        }).should.not.throw();

        done();
    });

    // Test exception
    it('is first argument should not function', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback('string');

        var fn = function () {
            myCallback.write(fakeFile);
        };

        fn.should.throw('Callback is not function');

        done();
    });

    // is set once true
    it('is option once set true', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var fakeFileNext = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var count = 2;
        var myCallback = callback(function (file, enc, cb) {
            count--;
            cb();
        }, {
            once: true
        });

        myCallback.write(fakeFile);

        myCallback.write(fakeFileNext);

        count.should.equal(1);

        done();
    });

    // is set once false
    it('is option once set false', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var fakeFileNext = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var count = 2;
        var myCallback = callback(function (file, enc, cb) {
            count--;
            cb();
        }, {
            once: false
        });

        myCallback.write(fakeFile);

        myCallback.write(fakeFileNext);

        count.should.equal(0);

        done();
    });

    // is arguments callback working
    it('is first argument callback should File', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback(function (file, enc, cb) {
            file.should.be.an.instanceof(File);
            cb();
        });

        myCallback.write(fakeFile);

        done();
    });

    it('is second argument callback should string', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback(function (file, enc, cb) {
            enc.should.be.type('string');
            cb();
        });

        myCallback.write(fakeFile);

        done();
    });

    it('is second argument callback should function', function (done) {
        var fakeFile = new File({
            contents: es.readArray(['stream', 'with', 'those', 'contents'])
        });

        var myCallback = callback(function (file, enc, cb) {
            cb.should.be.an.Function;
            cb();
        });

        myCallback.write(fakeFile);

        done();
    });
});
