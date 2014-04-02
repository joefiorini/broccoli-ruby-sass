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
function SassCompiler (sourceTrees, inputFile, outputFile, options, customArgs) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(sourceTrees, inputFile, outputFile, options, customArgs);
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
    loadPath: options.loadPath || []
  };
  this.customArgs = customArgs || [];
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
      ].concat(passedArgs).concat(self.customArgs);

      if(bundleExec) {
        args.unshift('bundle', 'exec');
      }

      if(path.extname(self.inputFile) === '.css') {
        args.push('--scss');
      }

      return new Promise(function(resolve, reject) {
        var cmd = args.shift();
        var cp = spawn(cmd, args);

        cp.on('error', function(err) {
          console.error('[broccoli-ruby-sass] '+ err);
          reject(err);
        });

        var errors = '';

        cp.on('data', function(data) {
          // ignore deprecation warnings
          if (/DEPRECATION WARNING/.test(data)) {
            return;
          }

          errors += data;
        });

        cp.on('close', function(code) {
          if(errors) {
            console.error('[broccoli-ruby-sass] ' + errors);
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
