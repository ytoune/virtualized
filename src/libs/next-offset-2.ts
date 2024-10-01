import type { Sizes, StickyPosition } from '../interfaces'
import { getIndex } from './get-index'

const { min, max } = Math
const { isArray } = Array as {
  isArray: (v: unknown) => v is readonly unknown[]
}

/** @internal */
export const getOffsetAndSize = (
  origin: number,
  pageSize: number,
  totalSize: number,
): readonly [realOffset: number, size: number] => {
  pageSize = max(0, pageSize)
  totalSize = max(0, totalSize)
  origin = max(0, min(origin, totalSize - pageSize))

  const ps2 = pageSize * 2
  const ps3 = pageSize + ps2
  const ps5 = ps3 + ps2

  const ro = min(ps2, origin)
  const sz = min(ps5, min(ps3, totalSize - origin) + ro)

  return [ro, sz]
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
