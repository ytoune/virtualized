import type { Format } from './format'
import { getRange } from './get-range'
import type { RenderItem, Sticky, StickyPosition } from './interfaces'
import type { Scroll } from './with-scroll'

const isArray: (arr: unknown) => arr is readonly unknown[] = Array.isArray

const positionsCaches = new WeakMap<readonly number[], ReadonlySet<number>>()

const iter = function* ([b, e]: readonly [number, number], s?: StickyPosition) {
  if (void 0 === s) {
    for (let i = b; i < e; ++i) yield [i, void 0] as const
    return
  }
  if ('number' === typeof s) {
    for (let i = b; i < e; ++i) if (s < i) yield [i, void 0] as const
    for (let i = 0; i <= s; ++i) yield [i, i] as const
    return
  }
  if (isArray(s)) {
    let u = positionsCaches.get(s)
    if (!u) positionsCaches.set(s, (u = new Set(s)))
    for (let i = b; i < e; ++i) if (!u.has(i)) yield [i, void 0] as const
    for (const i of s) yield [i, i] as const
    return
  }
  for (let i = b; i < e; ++i) if (!s.has(i)) yield [i, void 0] as const
  for (const i of s) yield [i, i] as const
}

export const createItems = <T>(
  format: Format,
  scroll: Scroll,
  sticky: Sticky,
  renderItem: RenderItem<T>,
): T[] => {
  const { colSizes, rowSizes, cell } = format
  const colCount = colSizes.length
  const rowCount = rowSizes.length
  const items: T[] = []
  if (rowCount && colCount) {
    const rowRange = getRange(
      rowSizes,
      scroll.clientHeight,
      scroll.top,
      scroll.topDirection,
    )
    const colRange = getRange(
      colSizes,
      scroll.clientWidth,
      scroll.left,
      scroll.leftDirection,
    )
    for (const [r, q] of iter(rowRange, sticky?.r))
      for (const [c, p] of iter(colRange, sticky?.c)) {
        const el = renderItem(r, c, cell([r, c], { c: p, r: q }))
        if (el) items.push(el)
      }
  }
  return items
}
