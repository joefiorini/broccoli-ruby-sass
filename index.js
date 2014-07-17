var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var includePathSearcher = require('include-path-searcher');
var quickTemp = require('quick-temp');
var mapSeries = require('promise-map-series');
var _ = require('lodash');
var dargs = require('dargs');
var spawn = require('win-spawn');
var Promise = require('rsvp').Promise;

module.exports = SassCompiler;
function SassCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(sourceTrees, inputFile, outputFile, options);
  this.sourceTrees = sourceTrees;
  this.inputFile = inputFile;
  this.outputFile = outputFile;
  options = options || {};
  this.sassOptions = {
    imagePath: options.imagePath,
    style: options.outputStyle,
    sourceComments: options.sourceComments,
    sourcemap: options.sourceMap,
    bundleExec: options.bundleExec,
    require: options.require,
    loadPath: options.loadPath || [],
    cacheLocation: options.cacheLocation,
    precision: options.precision,
    unixNewlines: options.unixNewlines
  };
}

SassCompiler.prototype.read = function (readTree) {
  var self = this;
  var bundleExec = this.sassOptions.bundleExec;
  quickTemp.makeOrRemake(this, '_tmpDestDir');
  var destFile = this._tmpDestDir + '/' + this.outputFile;
  mkdirp.sync(path.dirname(destFile));
  return mapSeries(this.sourceTrees, readTree)
    .then(function (includePaths) {
      includePaths.unshift(path.dirname(self.inputFile));
      self.sassOptions.loadPath = self.sassOptions.loadPath.concat(includePaths);
      var passedArgs = dargs(self.sassOptions, ['bundleExec']);
      var args = [
        'sass',
        includePathSearcher.findFileSync(self.inputFile, includePaths),
        destFile
      ].concat(passedArgs);

      if(bundleExec) {
        args.unshift('bundle', 'exec');
      }

      if(path.extname(self.inputFile) === '.css') {
        args.push('--scss');
      }

      return new Promise(function(resolve, reject) {
        var cmd = args.shift();
        var cp = spawn(cmd, args);

        function isWarning(error) {
          return /DEPRECATION WARNING/.test(error.toString()) || /WARNING:/.test(error.toString());
        }

        cp.on('error', function(err) {
          if (isWarning(err)) {
            console.warn(err);
            return;
          }

          console.error('[broccoli-ruby-sass] '+ err);
          reject(err);
        });

        var errors = '';

        cp.on('data', function(data) {
          // ignore deprecation warnings

          if (isWarning(err)) {
            console.warn(err);
            return;
          }

          errors += data;
        });

        cp.stderr.on('data', function(data) {
          if (!isWarning(data)) {
            errors += data;
          } else {
            console.warn('[broccoli-ruby-sass] ' + data);
          }
        });

        cp.on('close', function(code) {
          if(errors) {
            reject(errors);
          }

          if(code > 0) {
            reject('broccoli-ruby-sass exited with error code ' + code);
          }

          resolve(self._tmpDestDir);
        });

        return self._tmpDestDir;
      });
    });
};

SassCompiler.prototype.cleanup = function () {
  quickTemp.remove(this, '_tmpDestDir');
};
