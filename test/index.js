"use strict"

var switchstream = require('../')
var test = require('tape')

var fs = require('fs')

var from = require('from')
var through = require('through')
var split = require('split')

test('it can switch between multiple streams', function(t) {
  t.plan(10)
  from([0,1,2,3,4,5,6,7,8,9])
  .pipe(switchstream(function(data) {
    return !(data < 5)
  }, through(function(x) {
    t.ok(x < 5)
  }), through(function(y) {
    t.ok(y >= 5)
  })))
})

test('it can be partially applied', function(t) {
  var switcher = switchstream(function(data) {
    return !(data < 5)
  })
  t.plan(10)
  from([0,1,2,3,4,5,6,7,8,9])
  .pipe(switcher(through(function(x) {
    t.ok(x < 5)
  }), through(function(y) {
    t.ok(y >= 5)
  })))
})

test('supports N streams', function(t) {
  t.plan(3)
  from([0,1,2])
  .pipe(switchstream(function(data) {
    return data
  }, through(function(data) {
    t.equal(data, 0)
  }), through(function(data) {
    t.equal(data, 1)
  }), through(function(data) {
    t.equal(data, 2)
  })))
})

test('supports async', function(t) {
  t.plan(3)
  var inputStream = fs.createReadStream(__dirname + '/input.txt', 'utf8')
  inputStream._readableState.highWaterMark = 1
  inputStream
  .pipe(split(','))
  .pipe(switchstream(function(data, fn) {
    // wait a while
    setTimeout(function() {
      fn(null, data)
    }, data * 100)
  }, through(function(data) {
    t.looseEqual(data, 0)
  }), through(function(data) {
    t.looseEqual(data, 1)
  }), through(function(data) {
    t.looseEqual(data, 2)
  })))
})
