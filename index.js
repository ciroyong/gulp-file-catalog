'use strict';

var $minimatch, $through2, $path, $gutil, $PluginError, _op, chunk;

$through2 = require('through2');
$minimatch = require('minimatch');
$path = require('path');
$gutil = require('gulp-util');
$PluginError = $gutil.PluginError;
_op = Object.prototype;
chunk = {};

function _hasProp(obj, name) {
    return _op.hasOwnProperty.call(obj, name);
}

module.exports = function(opt, handler) {
    var out, cwd, ext, _ext, exclude;

    cwd = "", ext = false, exclude = false;

    if(typeof opt === "string") {
        out = opt;
    }

    if(typeof opt === "object") {
        if(!_hasProp(opt, "out")) {
            throw new PluginError('gulp-file-catalog', 'Missing options "out"');
        }

        out = opt.out;

        if(_hasProp(opt, "cwd")) {
            cwd = opt.cwd;
        }

        if(_hasProp(opt, "ext")) {
            _ext = opt.ext;
            if(typeof _ext === "string") {
                ext = [_ext]
            }

            if(_ext instanceof Array) {
                ext = _ext
            }
        }

        if(_hasProp(opt, "exclude")) {
            if (typeof opt.exclude === "string") {
                exclude = [opt.exclude];
            }

            if(opt.exclude instanceof Array) {
                exclude = opt.exclude;
            }
        }
    }

    function _filterExt(_ext) {
        var allowed;
        
        allowed = false;

        if (!ext) {
            return true;
        }

        for (var i = ext.length - 1; i >= 0; i--) {
            if (ext[i] === _ext) {
                allowed = true;
                break;
            }
        };

        return allowed;
    }
    /***
    Path.parse('/home/user/dir/file.txt')
    @property: root, "/",
    @property: dir, "/home/user/dir",
    @property: base, "file.txt",
    @property: ext, ".txt",
    @property: name, "file"
    ***/
    return $through2.obj(function(buffer, encoding, callback) {
        var ref, root, dir, base, ext, name, relative, exted;
        if(!buffer.stat.isFile()) {
            callback();
            return;
        }

        ref = $path.parse(buffer.path);
        root = ref.root, dir = ref.dir, base = ref.base, ext = ref.ext, name = ref.name;

        relative = $path.relative(cwd, buffer.path);
        if(exclude) {
            for (var i = exclude.length - 1; i >= 0; i--) {
                if($minimatch(relative, exclude[i])) {
                    callback();
                    return;
                }
            }
        }

        if(typeof handler === "function") {
            name = handler(name);
        }

        for (var i = ext.length - 1; i >= 0; i--) {
            ext[i]
        };

        if(_filterExt(ext)) {
            chunk[name] = relative.split($path.sep);
            // chunk[name].push(base);
        }
        
        callback();
    }, function (callback) {
        var file;
        file = new $gutil.File({path: out});
        file.contents = new Buffer(JSON.stringify(chunk));
        this.push(file);
        callback();
    });
};