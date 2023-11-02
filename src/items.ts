import type { Format } from './format'
import { getRange } from './get-range'
import type { RenderItem, Sticky } from './interfaces'
import type { Scroll } from './with-scroll'

const iter = function* ([b, e]: readonly [number, number], s?: number) {
  for (let i = b; i < e; ++i)
    if (void 0 === s || s < i) yield [i, void 0] as const
  if (void 0 !== s) for (let i = 0; i <= s; ++i) yield [i, i] as const
}

export const createItems = <T>(
  format: Format,
  scroll: Scroll,
  sticky: Sticky,
  renderItem: RenderItem<T>,
): T[] => {
  const { colPositions, rowPositions, cell } = format
  const colCount = colPositions.length
  const rowCount = rowPositions.length
  const items: T[] = []
  if (rowCount && colCount) {
    const rowRange = getRange(
      rowPositions,
      scroll.clientHeight,
      scroll.top,
      scroll.topDirection,
    )
    const colRange = getRange(
      colPositions,
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
