import { getRange } from './get-range'
import type { RenderItem, Sizes, Sticky, StickyPosition } from './interfaces'
import { isArray } from './utils'
import type { Scroll } from './with-scroll'

const positionsCaches = new WeakMap<readonly number[], ReadonlySet<number>>()
const getCached = (k: readonly number[]) => {
  let v = positionsCaches.get(k)
  if (!v) positionsCaches.set(k, (v = new Set(k)))
  return v
}

const createIterImpl = (
  [b, e]: readonly [number, number],
  s?: StickyPosition,
): ((cb: (i: number, p?: true) => void) => void) => {
  if (void 0 === s)
    return (cb: (i: number) => void) => {
      for (let i = b; i < e; ++i) cb(i)
    }
  if ('number' === typeof s)
    return (cb: (i: number, p?: true) => void) => {
      for (let i = b; i < e; ++i) if (s < i) cb(i)
      for (let i = 0; i <= s; ++i) cb(i, true)
    }
  const u: ReadonlySet<number> = isArray(s) ? getCached(s) : s
  return (cb: (i: number, p?: true) => void) => {
    for (let i = b; i < e; ++i) if (!u.has(i)) cb(i)
    for (const i of s) cb(i, true)
  }
}

export const createIdxIter = (
  sizes: Sizes,
  innerSize: number,
  scrollOffset: number,
  scrollDirection: boolean | 'backward' | 'forward',
  stickyPosition: StickyPosition | undefined,
  overscanCount = 20,
) =>
  createIterImpl(
    getRange(sizes, innerSize, scrollOffset, scrollDirection, overscanCount),
    stickyPosition,
  )

type Format = Readonly<{
  rowSizes: Sizes
  colSizes: Sizes
  sticky?: Sticky
}>
export const createItems = <T>(
  { colSizes, rowSizes, sticky }: Format,
  scroll: Scroll,
  renderItem: RenderItem<T>,
  overscanCount = 20,
): T[] => {
  const items: T[] = []
  if (rowSizes.length && colSizes.length) {
    const rowIter = createIdxIter(
      rowSizes,
      scroll.clientHeight,
      scroll.top,
      scroll.topDirection,
      sticky?.r,
      overscanCount,
    )
    const colIter = createIdxIter(
      colSizes,
      scroll.clientWidth,
      scroll.left,
      scroll.leftDirection,
      sticky?.c,
      overscanCount,
    )
    rowIter((r, q) => {
      colIter((c, p) => {
        const el = renderItem(r, c, q, p)
        if (el) items.push(el)
      })
    })
  }
  return items
}
