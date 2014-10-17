var RSVP = require('rsvp');
var denodeify = RSVP.denodeify;
var readFile = denodeify(require('fs').readFile);
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var broccoli = require('broccoli');
var path = require('path');

chai.use(chaiAsPromised);

var assert = chai.assert;

describe('broccoli-ruby-sass', function() {

  var builtTo;

  function build() {
    var tree = broccoli.loadBrocfile();
    var builder = new broccoli.Builder(tree);
    return builder.build();
  }

  beforeEach(function() {
    return build().then(function(dir) {
      builtTo = dir.directory;
    });
  });

  it('compiles templates with @extend', function() {
    var actualPath = require('path').resolve(builtTo + '/splitbutton.css');
    var readActual = readFile.bind(null, actualPath);
    var readExpected = readFile.bind(null, './test/output/splitbutton.css');
    return RSVP.all([readActual(), readExpected()]).then(function(result) {
      var actual = result[0].toString(), expected = result[1].toString();
      assert(actual, 'actual is undefined');
      assert(expected, 'expected is undefined');
      assert.equal(actual, expected);
    });
  });

  it("uses the load path correctly, e.g. doesn't look up in file system root", function(){
    var actualPath = require('path').resolve(builtTo + '/loadpath_main.css');
    var readActual = readFile.bind(null, actualPath);
    var readExpected = readFile.bind(null, './test/output/loadpath_main.css');
    return RSVP.all([readActual(), readExpected()]).then(function(result) {
      var actual = result[0].toString(), expected = result[1].toString();
      assert(actual, 'actual is undefined');
      assert(expected, 'expected is undefined');
      assert.equal(actual, expected);
    });
  });

});
