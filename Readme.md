# switchstream

Change where data flows as it passes through the switchstream.

```js
var Switchstream = require('switchstream')

var switchstream = Switchstream(function(data) {
  // return the index of the stream you want to
  // pipe this data to
  if (data === 'a') return 0
  if (data === 'b') return 1
})

var a = fs.createWriteStream('a.txt')
var b = fs.createWriteStream('b.txt')

from(['a', 'b',  'a', 'a', 'b']) // example data
.pipe(switchstream(a, b)) // a is index 0, b is index 1

// result will be a.txt with the three a's and b.txt with the two b's
```

## Licence
MIT
