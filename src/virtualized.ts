import { getIndex } from './get-range'
import type {
  AreaString,
  HTMLElement,
  RenderItem,
  Sizes,
  Sticky,
} from './interfaces'
import { isArray } from './utils'
import { getNextOffset } from './virtual-offset'
import type { Scroll } from './with-scroll'
import { getInitted, subscribeImpl, updateScroll } from './with-scroll'
import { createItemStyle, getTotal, outerStyle } from './format'
import { createIterImpl } from './items'

const { min, max } = Math

export interface ScrollProps {
  readonly top?: number
  readonly left?: number
}

// type Overscan = Readonly<{
//   row?: Readonly<{ min: number; max?: number }>
//   col?: Readonly<{ min: number; max?: number }>
// }>
export type VirtualizedProps = Readonly<{
  pin: () => void
  divRef: () => HTMLElement | null
  scroll: (props: ScrollProps) => void
  rowSizes: Sizes
  colSizes: Sizes
  // overscan?: Overscan
}>
export const createVirtualized = ({
  pin,
  divRef,
  scroll,
  rowSizes,
  colSizes,
}: VirtualizedProps) => {
  const virtualRows = virtualizedImpl(rowSizes)
  const virtualCols = virtualizedImpl(colSizes)
  let virtualScroll: Scroll = getInitted()
  let realScroll: Scroll = virtualScroll
  let rowOffsets: readonly [current: number, prev: number] = [0, 0]
  let colOffsets: readonly [current: number, prev: number] = [0, 0]
  const onScroll = () => {
    const div = divRef()
    if (!div) return
    const prev = realScroll
    realScroll = updateScroll(realScroll, div)
    if (prev === realScroll) return
    const r2 = virtualRows.f(realScroll.top, realScroll.clientHeight)
    const c2 = virtualCols.f(realScroll.left, realScroll.clientWidth)
    const prevVRowOffset = virtualScroll.top
    const prevVColOffset = virtualScroll.left
    const nextVRowOffset = prevVRowOffset + r2.add
    const nextVColOffset = prevVColOffset + c2.add
    virtualScroll = {
      top: nextVRowOffset,
      left: nextVColOffset,
      clientHeight: realScroll.clientHeight,
      clientWidth: realScroll.clientWidth,
      topDirection: realScroll.topDirection,
      leftDirection: realScroll.leftDirection,
    }
    rowOffsets = [nextVRowOffset, prevVRowOffset]
    colOffsets = [nextVColOffset, prevVColOffset]
    if (r2.diff || c2.diff) {
      const scrollProps: { top?: number; left?: number } = {}
      if (r2.diff) scrollProps.top = r2.next
      if (c2.diff) scrollProps.left = c2.next
      scroll(scrollProps)
    }
    pin()
  }
  const render = (sticky?: Sticky) => {
    const rowRange = getRange(
      rowSizes,
      ...rowOffsets,
      virtualScroll.clientHeight / 4,
      virtualScroll.clientHeight,
    )
    const colRange = getRange(
      colSizes,
      ...colOffsets,
      virtualScroll.clientWidth / 4,
      virtualScroll.clientWidth,
    )
    const innerStyle = {
      height: `${virtualRows.s}px`,
      width: `${virtualCols.s}px`,
      display: 'grid',
      gridTemplateRows: getTemplate(rowSizes, ...rowRange),
      gridTemplateColumns: getTemplate(colSizes, ...colRange),
      gridTemplateAreas: 'none',
    } as const
    const rowIter = createIterImpl(rowRange, sticky?.r)
    const colIter = createIterImpl(colRange, sticky?.c)
    const items = <T>(renderItem: RenderItem<T>) => {
      const items: T[] = []
      if (rowSizes.length && colSizes.length) {
        rowIter((r, q) => {
          colIter((c, p) => {
            const el = renderItem(r, c, q, p)
            if (el) items.push(el)
          })
        })
      }
      return items
    }
    const getGridArea = (row: number, col: number): AreaString =>
      `${2 + row - rowRange[0]}/${2 + col - colRange[0]}/${3 + row - rowRange[0]}/${3 + col - colRange[0]}`
    const itemStyle = (row: number, col: number) =>
      createItemStyle(row, col, { rowSizes, colSizes, sticky, getGridArea })
    return { innerStyle, outerStyle, items, itemStyle, getGridArea } as const
  }
  const subscribe = () => subscribeImpl(divRef, onScroll)
  return { render, onScroll, subscribe } as const
}

const virtualizedImpl = (sizes: Sizes) => {
  const totalSize = getTotal(sizes)
  let prevOffset = null as null | number
  const f = (offset: number, clientSize: number) => {
    const size = min(clientSize * 5, totalSize)
    const next = getNextOffset(clientSize, totalSize, offset, clientSize, size)
    const diff = next - offset
    const prev = null === prevOffset ? next : prevOffset + diff
    prevOffset = next
    const add = next - prev
    return { next, prev, diff, add } as const
  }
  return { f, s: totalSize } as const
}

/** @internal */
const getRange = (
  sizes: Sizes,
  current: number,
  prev: number,
  overscanMin: number,
  overscanMax: number,
) => {
  const startOffset = current + (current < prev ? overscanMax : overscanMin)
  const endOffset = current + (prev < current ? overscanMax : overscanMin)

  const startIndex = getIndex(sizes, startOffset)
  const endIndex = getIndex(sizes, endOffset, true)

  return [startIndex, endIndex] as const
}

/** @internal */
const sumLimit = (sizes: Sizes, idx: number): number => {
  if (isArray(sizes)) {
    let sum = 0
    for (let i = 0; i < idx && i < sizes.length; ++i) sum += sizes[i]!
    return sum
  }
  return sizes.size * min(max(0, idx), sizes.length)
}

/** @internal */
const getTemplate = (sizes: Sizes, start: number, end: number) => {
  const pre = sumLimit(sizes, start)
  if (isArray(sizes))
    return `${pre}px ${sizes
      .slice(start, end + 1)
      .map(s => `${s}px`)
      .join(' ')}`
  return `${pre}px repeat(${1 + end - start}, ${sizes.size}px)`
}
