import { getIndex } from './get-range'
import type { Sizes, StickyPosition } from './interfaces'

type Range = readonly [start: number, end: number]

const { min, max } = Math
const { isArray } = Array as {
  isArray: (v: unknown) => v is readonly unknown[]
}

/**
 * @todo template をシンプルにするために発行される offset を pageSize に合わせる必要がある…
 * @internal
 */
export const getOffsetAndSize = (
  offset: number,
  pageSize: number,
  totalSize: number,
  sizes: Sizes,
  sticky: StickyPosition | null,
): readonly [origin: number, innerSize: number, range: Range] => {
  pageSize = max(0, pageSize)
  totalSize = max(0, totalSize)
  offset = max(0, min(offset, totalSize - pageSize))

  const ps2 = pageSize * 2
  const ps3 = pageSize + ps2
  const ps5 = ps3 + ps2

  const startIndex = getIndex(sizes, offset - ps2, false)
  const endIndex = getIndex(sizes, offset + ps3, true)

  const ro = min(ps2, offset)
  const sz = min(ps5, min(ps3, totalSize - offset) + ro)

  let top = 0
  let bot = 0

  if (sticky) {
    const stickySet = stickyAsSet(sticky)
    for (let i = 0; i < sizes.length; ++i)
      if (stickySet.has(i)) {
        if (i < startIndex) top += isArray(sizes) ? sizes[i]! : sizes.size
        if (endIndex < i) bot += isArray(sizes) ? sizes[i]! : sizes.size
      }
  }

  return [ro + top, sz + top + bot, [startIndex, endIndex]]
}

/** @internal */
const stickyAsSet = (sticky: StickyPosition): ReadonlySet<number> => {
  const set = new Set<number>()
  if ('number' === typeof sticky) for (let s = 0; s <= sticky; ++s) set.add(s)
  else for (const s of sticky) set.add(s)
  return set
}

/** @internal */
export const getRangeAndOut = (
  origin: number,
  pageSize: number,
  sizes: Sizes,
  sticky: StickyPosition | null,
) => {
  const ps2 = pageSize * 2
  const ps3 = pageSize + ps2

  const startIndex = getIndex(sizes, origin - ps2, false)
  const endIndex = getIndex(sizes, origin + ps3, true)

  let top = 0
  let bot = 0

  if (sticky) {
    const stickySet = stickyAsSet(sticky)
    for (let i = 0; i < sizes.length; ++i)
      if (stickySet.has(i)) {
        if (i < startIndex) top += isArray(sizes) ? sizes[i]! : sizes.size
        if (endIndex < i) bot += isArray(sizes) ? sizes[i]! : sizes.size
      }
  }

  return [[startIndex, endIndex], top, bot] as const
}
