/* jshint node: true */
var path = require('path');
var mkdirp = require('mkdirp');
var includePathSearcher = require('include-path-searcher');
var Writer = require('broccoli-caching-writer');
var dargs = require('dargs');
var spawn = require('win-spawn');
var Promise = require('rsvp').Promise;
var _ = require('lodash');

SassCompiler.prototype = Object.create(Writer.prototype);
SassCompiler.prototype.constructor = SassCompiler;

function SassCompiler (inputTree, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(inputTree, inputFile, outputFile, options);
  Writer.call(this, inputTree, options);
  this.inputFile = inputFile;
  this.outputFile = outputFile;
  options = options || {};
  this.sassOptions = {
    imagePath: options.imagePath,
    style: options.outputStyle,
    sourceComments: options.sourceComments,
    sourcemap: options.sourceMap || 'none',
    bundleExec: options.bundleExec,
    require: options.require,
    loadPath: options.loadPath || [],
    precision: options.precision,
    unixNewlines: options.unixNewlines
  };
  this.customArgs = options.customArgs || [];
}

SassCompiler.prototype.updateCache = function (srcDir, destDir) {
  var bundleExec = this.sassOptions.bundleExec;
  var destFile = destDir + '/' + this.outputFile;
  var includePaths = [srcDir];

  mkdirp.sync(path.dirname(destFile));

  includePaths.unshift(path.dirname(this.inputFile));

  var loadPaths = this.sassOptions.loadPath;
  var loadPath = srcDir.map(function(dir){
    return loadPaths.map(function(loadPath){
      return path.join(dir, loadPath);
    });
  });
  loadPath = _.flatten(loadPath);
  loadPath = loadPath.concat(includePaths);
  loadPath = dargs({loadPath: loadPath});
  var passedArgs = dargs(this.sassOptions, ['bundleExec', 'loadPath']);
  var args = [
    'sass',
    includePathSearcher.findFileSync(this.inputFile, includePaths),
    destFile
  ].concat(passedArgs).concat(this.customArgs).concat(loadPath);

  if(bundleExec) {
    args.unshift('bundle', 'exec');
  }

  if(path.extname(this.inputFile) === '.css') {
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

      resolve();
    });
  });
};

module.exports = SassCompiler;
