/**
 * Imports
 */

import test from 'tape'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from '../src'

/**
 * Benchmarks
 */

test('benchmark random permutation', t => {
  const a = generate(100000)
  trial(a, permute(a))
  t.end()
})

test('benchmark reverse', t => {
  const a = generate(100000)
  trial(a, a.slice(0).reverse())
  t.end()
})

function trial (a, b) {
  const deltas = []

  for (let i = 0; i < 100; i++) {
    const t = +new Date()
    diff(a, b, noop)
    deltas.push((+new Date) - t)
  }

  console.log('mean', mean(deltas))
  console.log('variance', variance(deltas))
}

function noop () {}

function generate (n) {
  const a = []

  for (let i = 0; i < n; i++) {
    a.push({key: i})
  }

  return a
}

function permute (list) {
  const newList = []
  list = list.slice(0)
  for (let i = 0, len = list.length; i < len; i++) {
    const r = Math.floor(Math.random() * 100000) % list.length
    newList.push(list[r])
    list.splice(r, 1)
  }

  return newList
}

function mean (list) {
  return list.reduce(plus, 0) / list.length
}

function variance (list) {
  const sum = list.reduce(plus, 0)
  const sqSum = list.reduce(squareSum, 0)

  return (sqSum - ((sum * sum) / list.length)) / list.length
}

function plus (a, b) {
  return a + b
}

function squareSum (a, b) {
  return a + b * b
}
