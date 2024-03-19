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
  innerSize: number,
  scrollOffset: number,
  scrollDirection: boolean | 'backward' | 'forward',
  overscanSize = 20,
): readonly [number, number] => {
  const count = sizes.length

  if (0 === count) return [0, 0]

  const overscanBackward =
    true === scrollDirection || 'backward' === scrollDirection
      ? max(0, overscanSize)
      : 0
  const overscanForward =
    true === scrollDirection || 'forward' === scrollDirection
      ? max(0, overscanSize)
      : 0

  const startOffset = scrollOffset - overscanBackward
  const endOffset = innerSize + scrollOffset + overscanForward
  const startIndex = getIndex(sizes, startOffset)
  const endIndex = getIndex(sizes, endOffset, true)

  return [startIndex, endIndex]
  // return [max(0, min(count - 1, startIndex)), max(0, min(count, endIndex))]
}
