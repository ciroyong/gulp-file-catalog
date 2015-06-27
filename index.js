'use strict';

var minimatch, through, Path, gutil, PluginError, op, chunk;

through = require('through2');
minimatch = require('minimatch');
Path = require('path');
gutil = require('gulp-util');
PluginError = gutil.PluginError;
chunk = {};
op = Object.prototype;

function hasProp(obj, name) {
    return op.hasOwnProperty.call(obj, name);
}

module.exports = function(opt, handler) {
    var filename, cwd, filter, exclude;

    cwd = "", filter = false, exclude = false;

    if(typeof opt === "string") {
        filename = opt;
    }

    if(typeof opt === "object") {
        if(!hasProp(opt, "out")) {
            throw new PluginError('gulp-file-catalog', 'Missing options "out"');
        }

        filename = opt.out;

        if(hasProp(opt, "cwd")) {
            cwd = opt.cwd;
        }

        if(hasProp(opt, "filter")) {
            filter = opt.filter + '';
        }

        if(hasProp(opt, "exclude")) {
            if (typeof opt.exclude === "string") {
                exclude = [opt.exclude];
            }

            if(opt.exclude instanceof Array) {
                exclude = opt.exclude;
            }
        }
    }

    function parsePath(file) {
        var path, extname, basename, relative;

        path  = file.path;
        extname = Path.extname(path);

        return {
            path: path,
            relative: file.relative,
            extname: Path.extname(path),
            basename: Path.basename(path, extname)
        }
    }

    return through.obj(function(file, enc, cb) {
        var basename;

        if(!file.stat.isFile()) {
            cb();
            return;
        }

        file = parsePath(file);

        if(exclude) {
            for (var i = exclude.length - 1; i >= 0; i--) {
                if(minimatch(file.relative, exclude[i])) {
                    cb();
                    return;
                }
            }
        }

        basename = file.basename;

        if(typeof handler === "function") {
            basename = handler(file);
        }

        chunk[basename] = cwd + file.relative;

        cb();
    }, function end(cb) {
        var file;

        file = new gutil.File({path: filename});
        file.contents = new Buffer(JSON.stringify(chunk));
        this.push(file);
        cb();
    });
};