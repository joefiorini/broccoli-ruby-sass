var compileSass = require('./index');
var pickFiles = require('broccoli-static-compiler');

var tree = pickFiles('test/input', {
  srcDir: '/',
  destDir: '/'
});

module.exports = compileSass(tree, 'splitbutton.scss', 'splitbutton.css', {
  outputStyle: 'expanded',
  sourceMap: 'none'
});
