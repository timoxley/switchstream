# switchstream

Change where data flows as it passes through the switchstream.

```js
var Switchstream = require('switchstream')

var switchstream = Switchstream(function(data) {
  // return the key of the stream you want to
  // pipe this data to
  if (data === 'a') return 'stream a'
  if (data === 'b') return 'stream b'
})

from(['a', 'b',  'a', 'a', 'b']) // example data
.pipe(switchstream.between({
  'stream-a': fs.createWriteStream('a.txt'),
  'stream-b': fs.createWriteStream('b.txt')
}))

// result will be a.txt with the three a's and b.txt with the two b's
```

## Licence
MIT
