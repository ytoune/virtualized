import type { Rendered, RenderedItem, Sizes } from '../interfaces'
import { getIndex, getPositions } from './get-index'
import { getKeep } from './get-keep'
import { isArray } from './utils'

const getPosition = (sizes: Sizes, index: number): number =>
  isArray(sizes) ? getPositions(sizes)[index]! : sizes.size * index

export const render = (
  sizes: Sizes,
  sticky: Readonly<{
    /** 固定されている要素の index の配列 */
    arr: readonly number[]
    /** 固定されている要素の index の set */
    set: ReadonlySet<number>
  }>,
  virtualOffset: number,
  pageSize: number,
  totalSize: number,
) => {
  const overscanSize = pageSize + pageSize
  const startIndex = getIndex(sizes, virtualOffset - overscanSize, false)
  const endIndex = getIndex(
    sizes,
    virtualOffset + pageSize + overscanSize,
    true,
  )

  const startVPos = getPosition(sizes, startIndex)
  const endVPos = getPosition(sizes, endIndex)

  const pre: number[] = []
  const suf: number[] = []
  for (const i of sticky.arr)
    if (i < startIndex) pre.push(i)
    else if (endIndex <= i) suf.push(i)

  const items: RenderedItem[] = []
  let g = 1
  for (const i of pre) items.push([i, g++, true])
  for (let i = startIndex; i < endIndex; ++i) items.push([i, g++])
  for (const i of suf) items.push([i, g++, true])

  let innerSize = 0
  let gridTemplate = ''
  let preSize = 0
  if (isArray(sizes)) {
    let tmpSize: number
    for (const [i] of items) {
      innerSize += tmpSize = sizes[i]!
      gridTemplate += `${tmpSize}px `
      if (sticky.set.has(i)) preSize += tmpSize
    }
    gridTemplate = gridTemplate.slice(0, -1)
  } else {
    innerSize = items.length * sizes.size
    gridTemplate = `repeat(${items.length},${sizes.size}px)`
    preSize = pre.length * sizes.size
  }

  /** vo と実際の offset の差 ( `vo === ro + diff` ) */
  const diff = startVPos - preSize

  /** vo がこの範囲内の場合は再描画不要 */
  const keep = getKeep(pageSize, totalSize, startVPos, endVPos)

  const rendered: Rendered = { items, innerSize, gridTemplate }

  return { rendered, diff, keep } as const
}
