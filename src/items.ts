import type { Format } from './format'
import { getRange } from './get-range'
import type { RenderItem, Sticky, StickyPosition } from './interfaces'
import { isArray } from './utils'
import type { Scroll } from './with-scroll'

const positionsCaches = new WeakMap<readonly number[], ReadonlySet<number>>()
const getCached = (k: readonly number[]) => {
  let v = positionsCaches.get(k)
  if (!v) positionsCaches.set(k, (v = new Set(k)))
  return v
}

const createIter = (
  [b, e]: readonly [number, number],
  s?: StickyPosition,
): ((cb: (i: number, p?: number) => void) => void) => {
  if (void 0 === s)
    return (cb: (i: number) => void) => {
      for (let i = b; i < e; ++i) cb(i)
    }
  if ('number' === typeof s)
    return (cb: (i: number, p?: number) => void) => {
      for (let i = b; i < e; ++i) if (s < i) cb(i)
      for (let i = 0; i <= s; ++i) cb(i, i)
    }
  const u: ReadonlySet<number> = isArray(s) ? getCached(s) : s
  return (cb: (i: number, p?: number) => void) => {
    for (let i = b; i < e; ++i) if (!u.has(i)) cb(i)
    for (const i of s) cb(i, i)
  }
}

export const createItems = <T>(
  format: Format,
  scroll: Scroll,
  sticky: Sticky,
  renderItem: RenderItem<T>,
  overscanCount = 20,
): T[] => {
  const { colSizes, rowSizes, cell } = format
  const items: T[] = []
  if (rowSizes.length && colSizes.length) {
    const rowIter = createIter(
      getRange(
        rowSizes,
        scroll.clientHeight,
        scroll.top,
        scroll.topDirection,
        overscanCount,
      ),
      sticky?.r,
    )
    const colIter = createIter(
      getRange(
        colSizes,
        scroll.clientWidth,
        scroll.left,
        scroll.leftDirection,
        overscanCount,
      ),
      sticky?.c,
    )
    rowIter((r, q) => {
      colIter((c, p) => {
        const el = renderItem(r, c, cell([r, c], { c: p, r: q }))
        if (el) items.push(el)
      })
    })
  }
  return items
}
