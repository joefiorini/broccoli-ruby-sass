var compileSass = require('./index');
var pickFiles = require('broccoli-static-compiler');

module.exports = function(broccoli) {
  var tree =
    pickFiles('test/input', {
      srcDir: '/',
      destDir: '/'
    });

  return compileSass([tree], 'splitbutton.scss', 'splitbutton.css', {
    outputStyle: 'expanded',
    sourceMap: false
  });
};
