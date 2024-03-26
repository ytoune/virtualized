import { getRange } from './get-index'
import type { RenderItem, Sizes, Sticky, StickyPosition } from './interfaces'
import { isArray } from './utils'
import type { Scroll } from './with-scroll'

const positionsCaches = new WeakMap<readonly number[], ReadonlySet<number>>()
const getCached = (k: readonly number[]) => {
  let v = positionsCaches.get(k)
  if (!v) positionsCaches.set(k, (v = new Set(k)))
  return v
}

/** @internal */
export const createIterImpl = (
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
  scrollOffset: number,
  innerSize: number,
  stickyPosition: StickyPosition | undefined,
  overscanSize?: number,
) =>
  createIterImpl(
    getRange(sizes, scrollOffset, innerSize, overscanSize),
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
): T[] => {
  const items: T[] = []
  if (rowSizes.length && colSizes.length) {
    const rowIter = createIdxIter(
      rowSizes,
      scroll.top.offset,
      scroll.top.pageSize,
      sticky?.r,
    )
    const colIter = createIdxIter(
      colSizes,
      scroll.left.offset,
      scroll.left.pageSize,
      sticky?.c,
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
