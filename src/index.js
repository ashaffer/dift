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

function dift (prev, next, effect, key = defaultKey) {
  const prevLen = prev.length
  const nextLen = next.length

  if (prevLen === 0) {
    if (nextLen === 0) return
    else {
      // All creates
      for (let i = 0; i < nextLen; i++) {
        effect(CREATE, null, next[i], i)
      }
      return
    }
  } else if (nextLen === 0) {
    // All removes
    for (let i = 0; i < prevLen; i++) {
      effect(REMOVE, prev[i], null, i)
    }

    return
  }

  let pStartIdx = 0
  let pEndIdx = prevLen - 1
  let nStartIdx = 0
  let nEndIdx = nextLen - 1
  let pStartItem = prev[pStartIdx]
  let pEndItem = prev[pEndIdx]
  let nStartItem = next[nStartIdx]
  let nEndItem = next[nEndIdx]
  let created = 0

  // List head is the same
  while (pStartIdx < prevLen && nStartIdx < nextLen && equal(pStartItem, nStartItem)) {
    effect(UPDATE, pStartItem, nStartItem)
    pStartItem = prev[++pStartIdx]
    nStartItem = next[++nStartIdx]
  }

  // Reversed
  while (pStartIdx <= pEndIdx && nEndIdx >= nStartIdx && equal(pStartItem, nEndItem)) {
    effect(MOVE, pStartItem, nEndItem, nEndIdx)
    pStartItem = prev[++pStartIdx]
    nEndItem = next[--nEndIdx]
  }

  // The above two cases each could have processed the entire list (whereas the next two
  // cannot if these didn't).  So bail out early here if we can.
  if (nStartIdx === nextLen && pStartIdx === prevLen) {
    return
  }

  // Reversed the other way (in case of e.g. reverse and append)
  while (pEndIdx >= pStartIdx && nStartIdx <= nEndIdx && equal(nStartItem, pEndItem)) {
    effect(MOVE, pEndItem, nStartItem, nStartIdx)
    pEndItem = prev[--pEndIdx]
    nStartItem = next[++nStartIdx]
  }

  // List tail is the same
  while (pEndIdx >= pStartIdx && nEndIdx >= nStartIdx && equal(pEndItem, nEndItem)) {
    effect(UPDATE, pEndItem, nEndItem)
    pEndItem = prev[--pEndIdx]
    nEndItem = next[--nEndIdx]
  }

  const prevMap = keyMap(prev, pStartIdx, pEndIdx + 1, key)
  const keep = {}

  for(; nStartIdx <= nEndIdx; nStartItem = next[++nStartIdx]) {
    const oldIdx = prevMap[nStartItem.key]

    if (isUndefined(oldIdx)) {
      effect(CREATE, null, nStartItem, nStartIdx)
      ++created
    } else {
      keep[oldIdx] = true
      effect(oldIdx === nStartIdx ? UPDATE : MOVE, prev[oldIdx], nStartItem, nStartIdx)
    }
  }

  // If there are no creations, then you have to
  // remove exactly max(prevLen - nextLen, 0) elements in this
  // diff. You have to remove one more for each element
  // that was created. This means once we have
  // removed that many, we can stop.
  const necessaryRemovals = (prevLen - nextLen) + created
  for (let removals = 0; removals < necessaryRemovals; pStartItem = prev[++pStartIdx]) {
    if (isUndefined(keep[pStartIdx])) {
      effect(REMOVE, pStartItem)
      ++removals
    }
  }

  function equal (a, b) {
    return key(a) === key(b)
  }
}

function defaultKey (a) {
  return a.key
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
