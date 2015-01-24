# Broccoli Ruby Sass

## Installation

`npm install --save-dev broccoli-ruby-sass`

## Usage

```javascript
var compileRubySass = require('broccoli-ruby-sass');

compileRubySass('styles', 'main.scss', 'main.css', {
  imagePath: 'someImagePath',
  style: 'nested',
  sourceComments: true,
  sourcemap: 'none',
  bundleExec: true,
  require: 'someRubyThingToRequire',
  compass: true,
  loadPath: 'load path'
});
```

## Options

These can be passed in the options object as the last argument
to the Broccoli Ruby Sass plugin.

### imagePath

Type: string

Represents the public image path. When using the image-url() function in a stylesheet,
this path will be prepended to the path you supply. Example: Given an imagePath of
`/path/to/images`, `background-image: image-url('image.png')` will compile to 
`background-image: url("/path/to/images/image.png")`.

Thanks [grunt-sass] for that description!

### style

Type: string
Default: 'nested'
Values: 'nested', 'compressed', 'expanded'.

### sourcemap

Type: string
Default: 'none'

Configuration settings for outputting sourcemaps.

* auto: relative paths where possible, file URIs elsewhere
* file: always absolute file URIs
* inline: include the source text in the sourcemap
* none: no sourcemaps

### sourceComments

Type: boolean
Default: true

Print out comments in the compiled CSS that tell you the original line of the
source.

### require

Type: string

Require a ruby library before running the SASS compiler.
By default, requires no ruby library.
``

### compass

Type: boolean

Use compass mixins , will be passed as `--compass` to sass arguments.


### bundleExec

Type: boolean
Default: false

Use [bundler][bundler] when running ruby. Useful for
locking down the ruby version between projects.

### loadPath

Type: string
Default: ''

### unixNewlines

Type: boolean
default: true on *nix (Mac OSX, Linux, FreeBSD, etc), false on windows

Use unix style newlines in output.

### precision

Type: Number
Default: 5

How many digits of precision to use when outputting decimal numbers.

An string of filesystem path or importers which should be searched for Sass templates imported with the @import directive.

### customArgs

Type: Array
Default: []

Custom arguments that don't have a value, such as `--compass` and friends.

### cacheLocation

Type: string
default: .sass-cache

Place to put the sass cache files.

<!-- links -->

[bundler]: http://bundler.io/
[grunt-sass]: https://www.npmjs.org/package/grunt-sass
