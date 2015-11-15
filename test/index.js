/**
 * Imports
 */

import test from 'tape'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from '../src'
import powerset from 'powerset'
import permutations from 'array-permutation'

/**
 * Tests
 *
 * Taken from: https://github.com/joshrtay/key-diff
 */

test('add', t => {
  const a = []
  const b = [{key: 'foo', val: 'bar'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('add many', t => {
  const a = []
  const b = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('add before/after', t => {
  const a = [{key: 'bar', val: 'two'}]
  const b = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'two'}, {key: 'baz', val: 'three'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('add middle', t => {
  const a = [{key: 'foo', val: 'one'}, {key: 'baz', val: 'four'}]
  const b = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'five'}, {key: 'baz', val: 'four'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('remove', t => {
  const a = [{key: 'foo', val: 'bar'}]
  const b = []

  t.deepEqual(b, run(a, b))
  t.end()
})

test('remove many', t => {
  const a = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]
  const b = []

  t.deepEqual(b, run(a, b))
  t.end()
})

test('remove one', t => {
  const a = [{key: 'bar', val: 'two'}, {key: 'foo', val: 'one'}]
  const b = [{key: 'bar', val: 'two'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('remove complex', t => {
  const a = [{key: 'bar', val: 'one'}, {key: 'foo', val: 'two'}, {key: 'bat', val: 'three'}, {key: 'baz', val: 'four'}, {key: 'quz', val: 'five'}]
  const b = [{key: 'foo', val: 'two'}, {key: 'baz', val: 'four'}]

  t.deepEqual(b, run(a, b))
  t.end()
})


test('update', t => {
  const a = [{key: 'foo', val: 'bar'}]
  const b = [{key: 'foo', val: 'box'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('update/remove', t => {
  const a = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'two'}, {key: 'baz', val: 'three'}]
  const b = [{key: 'foo', val: 'one'}, {key: 'baz', val: 'four'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('update/remove 2', t => {
  const a = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'five'}, {key: 'baz', val: 'four'}]
  const b = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'span'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('update/remove 3', t => {
  const a = [{key: 'bar', val: 'span'}, {key: 'foo', val: 'one'}]
  const b = [{key: 'foo', val: 'span'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('swap', t => {
  const a = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]
  const b = [{key: 'bat', val: 'box'}, {key: 'foo', val: 'bar'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('reverse', t => {
  const a = [{key: 'foo', val: 'one'}, {key: 'bat', val: 'two'}, {key: 'baz', val: 'three'}, {key: 'qux', val: 'four'}]
  const b = [{key: 'qux', val: 'four'}, {key: 'baz', val: 'three'}, {key: 'bat', val: 'two'}, {key: 'foo', val: 'one'}]
  const c = clone(a)
  const patch = update(c)
  const log = []

  diff(a, b, function (...args) {
    log.push(args[0])
    patch(...args)
  }, key)

  t.deepEqual(log, [MOVE, MOVE, MOVE, MOVE])
  t.deepEqual(c, b)

  t.end()
})

test('complex', t => {
  const a = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'two'}, {key: 'baz', val: 'three'}]
  const b = [{key: 'bar', val: 'two'}, {key: 'foo', val: 'one'},  {key: 'bat', val: 'four'}]

  t.deepEqual(b, run(a, b))
  t.end()
})

test('insert (3), rearrange', t => {
  for (let i = 0; i < 1000; i++) {
    const a = range(0, 10)
    const b = randomize(range(0, 10).concat(range(11, 14)))

    t.deepEqual(b, run(a, b))
  }

  t.end()
})

test('remove (3), rearrange', t => {
  for (let i = 0; i < 1000; i++) {
    const a = range(0, 13)
    const b = randomize(range(0, 10))

    t.deepEqual(b, run(a, b))
  }
  t.end()
})

test('remove (3), insert (3), rearrange', t => {
  for (let i = 0; i < 1000; i++) {
    const a = range(0, 13)
    const b = randomize(range(0, 10).concat(14, 17))

    t.deepEqual(b, run(a, b))
  }
  t.end()
})

test('empty initial', t => {
  const a = []
  const b = range(0, 10)

  t.deepEqual(b, run(a, b))
  t.end()
})

test('reversed sides, middle rearranged', t => {
  const a = range(0, 10)
  const b = [13, 3, 2, 9, 5, 8, 7, 12, 11, 6, 4, 1, 0].map(i => ({key: i}))

  t.deepEqual(b, run(a, b))
  t.end()
})

test('exhaustive - same items', t => {
  const a = range(0, 10)
  const ps = powerset(range(0, 8))

  for (let i = 0; i < ps.length; i++) {
    for (let b of permutations(ps[i])) {
      t.deepEqual(b, run(a, b))
    }
  }

  t.end()
})

test('exhaustive - mixed items', t => {
  const a = range(0, 10)
  const ps = powerset(range(7, 15))

  for (let i = 0; i < ps.length; i++) {
    for (let b of permutations(ps[i])) {
      t.deepEqual(b, run(a, b))
    }
  }

  t.end()
})

test('exhaustive - permutations', t => {
  const a = range(0, 8)

  for (let b of permutations(range(0, 8))) {
    t.deepEqual(b, run(a, b))
  }

  t.end()
})

function run (a, b) {
  const c = a.slice()
  diff(a, b, update(c), key)
  return c
}

function key (a) {
  return a.key
}

function randomize (list) {
  const newList = []

  for (let i = 0, len = list.length; i < len; i++) {
    const j = Math.floor(Math.random() * 100000) % list.length
    newList.push(list[j])
    list.splice(j, 1)
  }

  return newList
}

function range (begin, end) {
  const r = []

  for (let i = begin; i < end; i++) {
    r.push({key: i})
  }

  return r
}

function update (list) {
  return function(type, prev, next, pos) {
    switch(type) {
      case CREATE:
        insertAt(list, pos, next)
        break
      case REMOVE:
        remove(list, prev)
        break
      case MOVE:
        patch(list, prev, next)
        move(list, pos, prev)
        break
      case UPDATE:
        patch(list, prev, next)
        break
    }
  }
}

function insertAt (list, idx, item) {
  if (list[idx]) {
    list.splice(idx, 0, item)
  } else {
    list.push(item)
  }
}

function indexOf (list, item) {
  let i = 0
  for (; i < list.length; ++i) {
    if (list[i] === item) {
      return i
    }
  }
  return -1
}

function remove (list, item) {
  list.splice(indexOf(list, item), 1)
}

function move(list, idx, item) {
  const oldIdx = indexOf(list, item)
  insertAt(list, idx, item)
  list.splice(oldIdx < idx ? oldIdx : oldIdx + 1, 1)
}

function patch(list, pItem, nItem) {
  for (let key in pItem) {
    delete pItem[key]
  }
  for (let key in nItem) {
    pItem[key] = nItem[key]
  }
  return pItem
}

function clone (list) {
  return list.slice(0)
}
