import type { FixedSizes as Sizes, StickyPosition } from '../interfaces'

const { min, max } = Math

/** @internal */
const sumLimit = (sizes: Sizes, idx: number): number =>
  sizes.size * min(max(0, idx), sizes.length)

type Range = readonly [start: number, end: number]

/** @internal */
export const getTemplate = (
  origin: number,
  sizes: Sizes,
  [start, end]: Range,
  _sticky: StickyPosition | null,
): string => {
  const p = max(0, sumLimit(sizes, start) - origin || 0)
  return `${p}px repeat(${end - start}, ${sizes.size}px)`
}
