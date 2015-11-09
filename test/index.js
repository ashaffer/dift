/**
 * Imports
 */

import test from 'tape'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from '../src'

/**
 * Tests
 *
 * Taken from: https://github.com/joshrtay/key-diff
 */

test('add', t => {
  let a = []
  let b = [{key: 'foo', val: 'bar'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('add many', t => {
  let a = []
  let b = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('add before/after', t => {
  let a = [{key: 'bar', val: 'two'}]
  let b = [
    {key: 'foo', val: 'one'},
    {key: 'bar', val: 'two'},
    {key: 'baz', val: 'three'}
  ]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('add middle', t => {
  let a = [{key: 'foo', val: 'one'}, {key: 'baz', val: 'four'}]
  let b = [
    {key: 'foo', val: 'one'},
    {key: 'bar', val: 'five'},
    {key: 'baz', val: 'four'}
  ]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('remove', t => {
  let a = [{key: 'foo', val: 'bar'}]
  let b = []
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('remove many', t => {
  let a = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]
  let b = []
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('remove one', t => {
  let a = [{key: 'bar', val: 'two'}, {key: 'foo', val: 'one'}]
  let b = [{key: 'bar', val: 'two'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('remove complex', t => {
  let a = [{key: 'bar', val: 'one'}, {key: 'foo', val: 'two'}, {key: 'bat', val: 'three'}, {key: 'baz', val: 'four'}, {key: 'quz', val: 'five'}]
  let b = [{key: 'foo', val: 'two'}, {key: 'baz', val: 'four'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})


test('update', t => {
  let a = [{key: 'foo', val: 'bar'}]
  let b = [{key: 'foo', val: 'box'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('update/remove', t => {
  let a = [
    {key: 'foo', val: 'one'},
    {key: 'bar', val: 'two'},
    {key: 'baz', val: 'three'}
  ]
  let b = [{key: 'foo', val: 'one'}, {key: 'baz', val: 'four'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('update/remove 2', t => {
  let a = [
    {key: 'foo', val: 'one'},
    {key: 'bar', val: 'five'},
    {key: 'baz', val: 'four'}
  ]
  let b = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'span'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('update/remove 3', t => {
  let a = [
    {key: 'bar', val: 'span'},
    {key: 'foo', val: 'one'}
  ]
  let b = [{key: 'foo', val: 'span'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('swap', t => {
  let a = [{key: 'foo', val: 'bar'}, {key: 'bat', val: 'box'}]
  let b = [{key: 'bat', val: 'box'}, {key: 'foo', val: 'bar'}]
  let c = clone(a)
  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

test('reverse', t => {
  let a = [{key: 'foo', val: 'one'}, {key: 'bat', val: 'two'}, {key: 'baz', val: 'three'}, {key: 'qux', val: 'four'}]
  let b = [{key: 'qux', val: 'four'}, {key: 'baz', val: 'three'}, {key: 'bat', val: 'two'}, {key: 'foo', val: 'one'}]
  let c = clone(a)
  let patch = update(c)

  let log = []

  diff(a, b, function (...args) {
    log.push(args[0])
    patch(...args)
  }, key)

  t.deepEqual(log, [MOVE, MOVE, MOVE, MOVE])
  t.deepEqual(c, b)

  t.end()
})

test('complex', t => {
  let a = [{key: 'foo', val: 'one'}, {key: 'bar', val: 'two'}, {key: 'baz', val: 'three'}]
  let b = [{key: 'bar', val: 'two'}, {key: 'foo', val: 'one'},  {key: 'bat', val: 'four'}]
  let c = clone(a)

  let patch = update(c)

  diff(a, b, patch, key)

  t.deepEqual(c, b)

  t.end()
})

function key (a) {
  return a.key
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
  remove(list, item)
  insertAt(list, idx, item)
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
