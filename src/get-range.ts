import type { Sizes } from './interfaces'
import { binarySearch, isArray } from './utils'

const { min, max, floor, ceil } = Math

const positionsCaches = new WeakMap<readonly number[], number[]>()

export const getIndex = (s: Sizes, offset: number, end = false): number => {
  const count = s.length
  if (count) {
    let val: number
    if (isArray(s)) {
      let p = positionsCaches.get(s)
      if (!p) {
        p = []
        let t = 0
        for (const u of s) p.push((t += u))
        positionsCaches.set(s, p)
      }
      const positions = p
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

export const getRange = (
  sizes: Sizes,
  offset: number,
  pageSize: number,
  overscanSize = pageSize / 2,
): readonly [start: number, end: number] => {
  if (0 === sizes.length) return [0, 0]

  const startOffset = offset - overscanSize
  const endOffset = offset + pageSize + overscanSize
  const startIndex = getIndex(sizes, startOffset)
  const endIndex = getIndex(sizes, endOffset, true)

  return [startIndex, endIndex]
}
