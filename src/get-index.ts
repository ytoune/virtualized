import type { Sizes, VariableSizes } from './interfaces'
import { isArray, binarySearch } from './utils'

const { min, max, floor, ceil } = Math
const positionsCaches = new WeakMap<readonly number[], number[]>()

/** @internal */
export const getPositions = (s: VariableSizes) => {
  let p = positionsCaches.get(s)
  if (!p) {
    p = []
    let t = 0
    for (const u of s) p.push((t += u))
    positionsCaches.set(s, p)
  }
  return p
}

export const getIndex = (s: Sizes, offset: number, end = false): number => {
  const count = s.length
  if (count) {
    let val: number
    if (isArray(s)) {
      const positions = getPositions(s)
      val = end
        ? binarySearch(count, i => offset <= positions[i]!) + 1
        : binarySearch(count, i => offset < positions[i]!)
    } else {
      val = end ? ceil(offset / s.size) : floor(offset / s.size)
    }
    return end ? max(1, min(count, val)) : max(0, min(count - 1, val))
  }
  return 0
}
