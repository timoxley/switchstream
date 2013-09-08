"use strict"

var through = require('through')
var stream = require('stream')
var joiner = require('joiner-stream');
var duplexer = require('duplexer')

module.exports = function(fn) {
  function between(streams) {
    var aggregator = joiner();
    // pipe all streams into joiner
    var streamsArr = streams
    // handle objects
    if (!Array.isArray(streams)) {
      streamsArr = Object.keys(streams).map(function(key) {return streams[key]})
    }
    streamsArr.forEach(function(aStream) {
      aStream.pipe(aggregator)
    })
    return duplexer(through(function(data) {
      var result = fn.apply(null, arguments)
      if (Array.isArray(streams)) result = parseInt(Number(result), 10)
        var targetStream = streams[result]
      if (targetStream) targetStream.write(data)
    }), aggregator)
  }
  return between.between = between
}


