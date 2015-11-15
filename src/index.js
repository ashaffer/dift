/**
 * Imports
 */

import {createBv, setBit, getBit} from 'bit-vector'

/**
 * Actions
 */

const CREATE = 0
const UPDATE = 1
const MOVE = 2
const REMOVE = 3

/**
 * dift
 */

function dift (prev, next, effect, key) {
  let pStartIdx = 0
  let nStartIdx = 0
  let pEndIdx = prev.length - 1
  let nEndIdx = next.length - 1
  let pStartItem = prev[pStartIdx]
  let nStartItem = next[nStartIdx]

  // List head is the same
  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nStartItem)) {
    effect(UPDATE, pStartItem, nStartItem, nStartIdx)
    pStartItem = prev[++pStartIdx]
    nStartItem = next[++nStartIdx]
  }

  // The above case is orders of magnitude more common than the others, so fast-path it
  if (nStartIdx > nEndIdx && pStartIdx > pEndIdx) {
    return
  }

  let pEndItem = prev[pEndIdx]
  let nEndItem = next[nEndIdx]
  let movedFromFront = 0

  // Reversed
  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nEndItem)) {
    effect(MOVE, pStartItem, nEndItem, (pEndIdx - movedFromFront) + 1)
    pStartItem = prev[++pStartIdx]
    nEndItem = next[--nEndIdx]
    ++movedFromFront
  }

  // Reversed the other way (in case of e.g. reverse and append)
  while (pEndIdx >= pStartIdx && nStartIdx <= nEndIdx && equal(nStartItem, pEndItem)) {
    effect(MOVE, pEndItem, nStartItem, nStartIdx)
    pEndItem = prev[--pEndIdx]
    nStartItem = next[++nStartIdx]
    --movedFromFront
  }

  // List tail is the same
  while (pEndIdx >= pStartIdx && nEndIdx >= nStartIdx && equal(pEndItem, nEndItem)) {
    effect(UPDATE, pEndItem, nEndItem, nEndIdx)
    pEndItem = prev[--pEndIdx]
    nEndItem = next[--nEndIdx]
  }

  if (pStartIdx > pEndIdx) {
    while (nStartIdx <= nEndIdx) {
      effect(CREATE, null, nStartItem, nStartIdx)
      nStartItem = next[++nStartIdx]
    }

    return
  }

  if (nStartIdx > nEndIdx) {
    while (pStartIdx <= pEndIdx) {
      effect(REMOVE, pStartItem)
      pStartItem = prev[++pStartIdx]
    }

    return
  }

  let created = 0
  let pivotDest = null
  let pivotIdx = pStartIdx - movedFromFront
  const keepBase = pStartIdx
  const keep = createBv(pEndIdx - pStartIdx)

  const prevMap = keyMap(prev, pStartIdx, pEndIdx + 1, key)

  for(; nStartIdx <= nEndIdx; nStartItem = next[++nStartIdx]) {
    const oldIdx = prevMap[key(nStartItem)]

    if (isUndefined(oldIdx)) {
      effect(CREATE, null, nStartItem, pivotIdx++)
      ++created
    } else if (pStartIdx !== oldIdx) {
      setBit(keep, oldIdx - keepBase)
      effect(MOVE, prev[oldIdx], nStartItem, pivotIdx++)
    } else {
      pivotDest = nStartIdx
    }
  }

  if (pivotDest !== null) {
    setBit(keep, 0)
    effect(MOVE, prev[pStartIdx], next[pivotDest], pivotDest)
  }

  // If there are no creations, then you have to
  // remove exactly max(prevLen - nextLen, 0) elements in this
  // diff. You have to remove one more for each element
  // that was created. This means once we have
  // removed that many, we can stop.
  const necessaryRemovals = (prev.length - next.length) + created
  for (let removals = 0; removals < necessaryRemovals; pStartItem = prev[++pStartIdx]) {
    if (!getBit(keep, pStartIdx - keepBase)) {
      effect(REMOVE, pStartItem)
      ++removals
    }
  }

  function equal (a, b) {
    return key(a) === key(b)
  }
}

function isUndefined (val) {
  return typeof val === 'undefined'
}

function keyMap (items, start, end, key) {
  const map = {}

  for (let i = start; i < end; ++i) {
    map[key(items[i])] = i
  }

  return map
}

/**
 * Exports
 */

export default dift
export {
  CREATE,
  UPDATE,
  MOVE,
  REMOVE
}
