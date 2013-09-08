"use strict"

var Switchstream = require('../')
var test = require('tape')

var fs = require('fs')

var from = require('from')
var through = require('through')
var split = require('split')

test('it can switch between multiple streams', function(t) {
  t.plan(10)
  from([0,1,2,3,4,5,6,7,8,9])
  .pipe(Switchstream(function(data) {
    return !(data < 5)
  }).between([through(function(x) {
    t.ok(x < 5, x + ' < 5')
  }), through(function(y) {
    t.ok(y >= 5, y + ' >= 5')
  })]))
})

test('supports N streams', function(t) {
  t.plan(3)
  from([0,1,2])
  .pipe(Switchstream(function(data) {
    return data
  }).between([through(function(data) {
    t.equal(data, 0)
  }), through(function(data) {
    t.equal(data, 1)
  }), through(function(data) {
    t.equal(data, 2)
  })]))
})

test('supports named streams', function(t) {
  t.plan(3)
  from([0,1,2])
  .pipe(Switchstream(function(data) {
    if (data === 0) return 'zero'
    if (data === 1) return 'one'
    if (data === 2) return 'two'
  }).between({
    zero: through(function(data) {
      t.equal(data, 0)
    }),
    one: through(function(data) {
      t.equal(data, 1)
    }),
    two: through(function(data) {
    t.equal(data, 2)
    }),
  }))
})

test('does not crash if stream does not exist', function(t) {
  t.plan(1)
  from([0,1])
  .pipe(Switchstream(function(data) {
    if (data === 0) return 'ok'
    if (data === 1) return 'not exist'
  }).between({
    ok: through(function(data) {
      t.equal(data, 0)
    })
  }))
})

test('joins streams back together', function(t) {
  t.plan(6)
  var input = ['a','b', 'a']
  from(input)
  .pipe(Switchstream(function(data) {
    return data
  }).between({
    a: through(function(data) {
      t.equal(data, 'a')
      this.push(data.toUpperCase())
    }),
    b: through(function(data) {
      t.equal(data, 'b')
      this.push(data.toUpperCase())
    })
  }))
  .pipe(through(function(data) {
    t.equal(input.shift().toUpperCase(), data)
  }))
})


//test('supports async', function(t) {
  //t.plan(3)
  //var inputStream = fs.createReadStream(__dirname + '/input.txt', 'utf8')
  //inputStream._readableState.highWaterMark = 1
  //inputStream
  //.pipe(split(','))
  //.pipe(switchstream(function(data, fn) {
    //// wait a while
    //setTimeout(function() {
      //fn(null, data)
    //}, data * 100)
  //}, through(function(data) {
    //t.looseEqual(data, 0)
  //}), through(function(data) {
    //t.looseEqual(data, 1)
  //}), through(function(data) {
    //t.looseEqual(data, 2)
  //})))
//})
