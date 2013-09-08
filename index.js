"use strict"

var through = require('through')

module.exports = function(fn) {
  if (arguments.length === 1) return pass.bind(this, fn)
  else return pass.apply(this, arguments)
}

function pass(fn) {
  if (fn.length === 2) return passAsync.apply(this, arguments)
  var args = [].slice.call(arguments)
  args.shift() // remove fn arg.
  return through(function(data) {
    args[parseInt(Number(fn(data)), 10)].write(data)
  })
}

function passAsync(fn) {
  var args = [].slice.call(arguments)
  args.shift() // remove fn arg.
  return through(function(data) {
    fn(data, function(err, result) {
      args[parseInt(Number(result), 10)].write(data)
    })
  })
}
