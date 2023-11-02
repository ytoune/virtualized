import type { Sizes } from './interfaces'

const isArray: (arr: unknown) => arr is readonly unknown[] = Array.isArray

const { min, max, floor, ceil } = Math

/** めぐる式二分探索 */
const binarySearch = (N: number, ask: (i: number) => boolean): number => {
  let ng = -1
  let ok = N
  while (ok - ng > 1) {
    const m = (ng + ok) >> 1 // = floor((ng + ok) / 2)
    if (ask(m)) ok = m
    else ng = m
  }
  return ok
}

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
): readonly [number, number] => {
  const overscanCount = 20

  const count = sizes.length

  if (0 === count) return [0, 0]

  const startIndex = getIndex(sizes, scrollOffset)
  const endIndex = getIndex(sizes, innerSize + scrollOffset, true)

  const overscanBackward =
    true === scrollDirection || 'backward' === scrollDirection
      ? max(1, overscanCount)
      : 1
  const overscanForward =
    true === scrollDirection || 'forward' === scrollDirection
      ? max(1, overscanCount)
      : 1

  return [
    max(0, min(count - 1, startIndex - overscanBackward)),
    max(0, min(count, endIndex + overscanForward)),
  ]
}
