
# dift

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Super fast list diff algorithm.  Highly optimized for operations common in virtual DOM based UI systems, specifically: prepend, append, reverse, remove all, create all.  However, it performs very well in the worst case (random rearrangement) as well.

Without really researching it or benchmarking, i'm going to invoke [Cunningham's Law](https://meta.wikimedia.org/wiki/Cunningham%27s_Law) and say that it is the fastest key-based list diff algorithm in existence for this particular application in javascript.

## Installation

    $ npm install dift

## Usage

Params:

   * `prev` - The old list
   * `next` - The new list
   * `effect` - A function that receives operations.  You can execute your operations in here, or aggregate them into some buffer to be executed elsewhere, that is up to you.
   * `key` - Return a value used to compare two list items to determine whether they are equal.

### Effects

  * `CREATE` - Receives `(type = CREATE, prev = null, next = newItem, pos = positionToCreate)`
  * `UPDATE` - Receives `(type = UPDATE, prev = oldItem, next = newItem)`
  * `MOVE` - Receives `(type = MOVE, prev = oldItem, next = newItem, pos = newPosition)`
  * `REMOVE` - Receives `(type = REMOVE, prev = oldItem)`

## Example

```javascript
import diff, {CREATE, UPDATE, MOVE, REMOVE} from 'dift'

function diffChildren (prevList, nextList, node) {
  diff(prevList, nextList, function (type, prev, next, pos) {
    switch (type) {
      case CREATE:
        node.insertBefore(create(next), node.childNodes[pos] || null))
        break
      case UPDATE:
        update(prev, next, prev.element)
        break
      case MOVE:
        node.insertBefore(update(prev, next), prev.element)
        break
      case REMOVE:
        node.removeChild(prev.element)
        break
    }
  })
}
```

## Correctness

List diff is extremely tricky to implement correctly.  There are a lot of subtle edge cases and many of them are hard to think of a priori.  To deal with this, dift has not just extensive tests but *exhaustive* tests.  dift's tests explore the entire state space of roughly 8-10 item lists and ensure that the operations generated correctly produce the desired output.

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
