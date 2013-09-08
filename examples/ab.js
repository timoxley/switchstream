var fs = require('fs')
var from = require('from')
var Switchstream = require('../')

var switchstream = Switchstream(function(data) {
  // return the index of the stream you want to
  // pipe this data to
  if (data === 'a') return 0
  if (data === 'b') return 1
})

var a = fs.createWriteStream(__dirname + '/a.txt')
var b = fs.createWriteStream(__dirname + '/b.txt')

from(['a', 'b',  'a', 'a', 'b']) // example data
.pipe(switchstream(a, b)) // a is index 0, b is index 1

// result will be a.txt full of the a's and b.txt full of the b's
