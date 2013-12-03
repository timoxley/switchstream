"use strict"

var through = require('through2')
var PassThrough = require('readable-stream').PassThrough
var duplexer = require('duplexer2')

module.exports = function(options, fn) {
  if (!fn) fn = options, options = undefined
  options = options || { objectMode: true, bubbleErrors: false }

  function between(streams) {
    var aggregator = new PassThrough(options)
    // pipe all streams into aggregator
    Object.keys(streams).forEach(function(key) {
      if (streams[key].pipe) streams[key].pipe(aggregator)
    })

    var readable = through(options, function(data, enc, done) {
      if (fn.length < 3) {
        // sync
        handleResult(null, fn.call(this, data, enc))
      } else {
        // async
        fn.call(this, data, enc, handleResult)
      }

      function handleResult(err, result) {
        if (err) return done(err)
        if (Array.isArray(streams)) result = parseInt(Number(result), 10)
        var targetStream = streams[result]
        if (!targetStream) return done(new Error('no stream for ' + typeof result + ': ' + result))
        targetStream.write(data)
        done()
      }
    })

    readable.on('error', function(err) {
      // this prevents throw.
      // errors seem to get bubbled to the duplexer anyway?
      // note options.bubbleErrors is false?
    })

    return duplexer(options, readable, aggregator)
  }

  return between.between = between
}
