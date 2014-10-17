var RSVP = require('rsvp');
var denodeify = RSVP.denodeify;
var readFile = denodeify(require('fs').readFile);
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var broccoli = require('broccoli');

chai.use(chaiAsPromised);

var assert = chai.assert;

describe('broccoli-ruby-sass', function() {

  var builtTo;

  function build() {
    return new RSVP.Promise(function(resolve) {
      var tree = broccoli.loadBrocfile();
      var builder = new broccoli.Builder(tree);
      return builder.build().then(function(dir) {
        // TODO: If I don't do this, the file built does not exist to node, huh?
        setTimeout(resolve.bind(null, dir), 750);
      });
    });
  }

  beforeEach(function() {
    return build().then(function(dir) {
      builtTo = dir;
    });
  });

  it('compiles templates with @extend', function() {
    var actualPath = require('path').join(builtTo, '/splitbutton.css');
    var fs = require('fs');
    var readActual = readFile.bind(null, actualPath);
    var readExpected = readFile.bind(null, './test/output/splitbutton.css');
    return RSVP.all([readActual(), readExpected()]).then(function(result) {
      var actual = result[0].toString(), expected = result[1].toString();
      assert(actual, 'actual is undefined');
      assert(expected, 'expected is undefined');
      assert.equal(actual, expected);
    });
  });

});
