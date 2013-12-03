"use strict"

var Switchstream = require('../')
var test = require('tape')

var fs = require('fs')

var from = require('from')
var through = require('through2').bind(null, {objectMode: true})
var split = require('split')

// wrapper to make through2 callback more like through
function tf(fn) {
  return function(data, enc, done) {
    fn.call(this, data)
    done()
  }
}

test('it can switch between multiple streams', function(t) {
  t.plan(10)
  from([0,1,2,3,4,5,6,7,8,9])
  .pipe(Switchstream(function(data) {
    return !(data < 5)
  }).between([through(tf(function(x) {
    t.ok(x < 5, x + ' < 5')
  })), through(tf(function(y) {
    t.ok(y >= 5, y + ' >= 5')
  }))]))
})

test('supports N streams', function(t) {
  t.plan(3)
  from([0,1,2])
  .pipe(Switchstream(function(data) {
    return data
  }).between([through(tf(function(data) {
    t.equal(data, 0)
  })), through(tf(function(data) {
    t.equal(data, 1)
  })), through(tf(function(data) {
    t.equal(data, 2)
  }))]))
})

test('supports named streams', function(t) {
  t.plan(3)
  from([0,1,2])
  .pipe(Switchstream(function(data) {
    if (data === 0) return 'zero'
    if (data === 1) return 'one'
    if (data === 2) return 'two'
  }).between({
    zero: through(tf(function(data) {
      t.equal(data, 0)
    })),
    one: through(tf(function(data) {
      t.equal(data, 1)
    })),
    two: through(tf(function(data) {
      t.equal(data, 2)
    })),
  }))
})

test('does not crash if stream does not exist', function(t) {
  t.plan(2)
  from([0,1])
  .pipe(Switchstream(function(data) {
    if (data === 0) return 'ok'
    if (data === 1) return 'not exist'
  }).between({
    ok: through(tf(function(data) {
      t.equal(data, 0)
    }))
  }))
  .on('error', function(err) {
    t.ok(err)
  })
})

test('joins streams back together', function(t) {
  t.plan(6)
  var input = ['a','b', 'a']
  from(input)
  .pipe(Switchstream(function(data) {
    return data
  }).between({
    a: through(tf(function(data) {
      t.equal(data, 'a')
      this.push(data.toUpperCase())
    })),
    b: through(tf(function(data) {
      t.equal(data, 'b')
      this.push(data.toUpperCase())
    }))
  }))
  .pipe(through(tf(function(data) {
    t.equal(input.shift().toUpperCase(), data)
  })))
})

test('supports async', function(t) {
  t.plan(3)
  var inputStream = fs.createReadStream(__dirname + '/input.txt', 'utf8')
  inputStream._readableState.highWaterMark = 1
  inputStream
  .pipe(split(','))
  .pipe(Switchstream(function(data, enc, fn) {
    // wait a while
    setTimeout(function() {
      fn(null, 'stream' + parseInt(data, 10))
    }, data * 100)
  }).between({
    'stream0': through(tf(function(data) {
      t.looseEqual(data, 0)
    })),
    'stream1': through(tf(function(data) {
      t.looseEqual(data, 1)
    })),
    'stream2': through(tf(function(data) {
      t.looseEqual(data, 2)
    }))
  }))
})
