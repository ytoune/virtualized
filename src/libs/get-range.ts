import type { Sizes } from '../interfaces'
import { getIndex } from './get-index'

export const getRange = (
  sizes: Sizes,
  offset: number,
  pageSize: number,
  overscanSize = pageSize / 2,
): readonly [start: number, end: number] => {
  if (0 === sizes.length) return [0, 0]

  const startOffset = offset - overscanSize
  const endOffset = offset + pageSize + overscanSize
  const startIndex = getIndex(sizes, startOffset)
  const endIndex = getIndex(sizes, endOffset, true)

  return [startIndex, endIndex]
}
