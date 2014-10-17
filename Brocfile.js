var compileSass = require('./index');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');

var tree = pickFiles('test/input', {
  srcDir: '/',
  destDir: '/'
});

var tree1 = compileSass(tree, 'splitbutton.scss', 'splitbutton.css', {
  outputStyle: 'expanded',
  sourceMap: 'none'
});

var tree2 = compileSass(tree, 'loadpath_main.scss', 'loadpath_main.css', {
  outputStyle: 'expanded',
  sourceMap: 'none',
  loadPath: ['/loadpath']
});

module.exports = mergeTrees([tree1, tree2]);
