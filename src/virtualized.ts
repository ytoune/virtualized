import { getIndex } from './get-range'
import type {
  AreaString,
  HTMLElement,
  RenderItem,
  Sizes,
  Sticky,
} from './interfaces'
import { isArray } from './utils'
import { getNextOffset } from './next-offset'
import type { Scroll } from './with-scroll'
import { getInitted, subscribeImpl, updateScroll } from './with-scroll'
import { createItemStyle, getTotal, outerStyle } from './format'
import { createIterImpl } from './items'

const { min, max, abs } = Math

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
  let virtualScroll: Scroll = getInitted()
  let realScroll: Scroll = virtualScroll
  const rowOffsetManager = createOffsetManager(
    rowSizes,
    realScroll.top,
    realScroll.clientHeight,
  )
  const colOffsetManager = createOffsetManager(
    colSizes,
    realScroll.left,
    realScroll.clientWidth,
  )
  let scrolling = false
  let lastScrollTop = null as null | number
  let lastScrollLeft = null as null | number
  const onScroll = () => {
    const div = divRef()
    if (!div || scrolling) return
    const prev = realScroll
    realScroll = updateScroll(realScroll, div)
    if (prev === realScroll) return
    const r2 = rowOffsetManager.f(realScroll.top, realScroll.clientHeight)
    const c2 = colOffsetManager.f(realScroll.left, realScroll.clientWidth)
    virtualScroll = {
      top: r2.vo,
      left: c2.vo,
      clientHeight: realScroll.clientHeight,
      clientWidth: realScroll.clientWidth,
      topDirection: realScroll.topDirection,
      leftDirection: realScroll.leftDirection,
    }
    scrolling = true
    const scrollProps: { top?: number; left?: number } = {}
    if (r2.d && lastScrollTop !== r2.ro) lastScrollTop = scrollProps.top = r2.ro
    if (c2.d && lastScrollLeft !== c2.ro)
      lastScrollLeft = scrollProps.left = c2.ro
    if (scrollProps.top || scrollProps.left) scroll(scrollProps)
    pin()
    scrolling = false
  }
  const render = (sticky?: Sticky) => {
    const [rowRange, height, preRow] = rowOffsetManager.r()
    const [colRange, width, preCol] = colOffsetManager.r()
    const innerStyle = {
      height: `${height}px`,
      width: `${width}px`,
      display: 'grid',
      // gridTemplateRows: getTemplate(preRow, rowSizes, ...rowRange),
      // gridTemplateColumns: getTemplate(preCol, colSizes, ...colRange),
      // gridTemplateAreas: 'none',
      gridTemplate: `${getTemplate(
        preRow,
        rowSizes,
        ...rowRange,
      )}/${getTemplate(preCol, colSizes, ...colRange)}`,
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
    return {
      innerStyle,
      outerStyle,
      items,
      itemStyle,
      getGridArea,
      rowRange,
      colRange,
    } as const
  }
  const subscribe = () => subscribeImpl(divRef, onScroll)
  return { render, onScroll, subscribe } as const
}

/** @internal */
const createOffsetManager = (
  sizes: Sizes,
  initVirtualOffset: number,
  initClientSize: number,
) => {
  const virtualTotalSize = getTotal(sizes)
  let vo = initVirtualOffset
  let ro = null as null | number
  let ps = null as null | number
  let range: readonly [start: number, end: number] = [0, 0]
  let ro2 = null as null | number
  const f = (realOffset: number, clientSize: number) => {
    if (null !== ro2 && abs(ro2 - realOffset) <= 2 && ps === clientSize)
      return { vo, ro, d: false } as const
    const o = getNextOffset(
      virtualTotalSize,
      clientSize,
      ps ?? clientSize,
      realOffset,
      ro ?? realOffset,
      vo,
    )
    ps = clientSize
    range = getRange(sizes, o[1], vo, ps)
    ;[ro, vo] = o
    const d = 2 < abs(ro - realOffset)
    ro2 = realOffset
    return { vo, ro, d } as const
  }
  const r = () =>
    [
      range,
      min((ps ?? initClientSize) * 5, virtualTotalSize),
      vo - (ro ?? vo),
    ] as const
  return { f, r } as const
}

/** @internal */
const getRange = (
  sizes: Sizes,
  current: number,
  prev: number,
  clientSize: number,
): readonly [start: number, end: number] => {
  const startOffset = current - clientSize
  const endOffset = current + clientSize + clientSize

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
const getTemplate = (pre: number, sizes: Sizes, start: number, end: number) => {
  const p = sumLimit(sizes, start) - pre
  if (isArray(sizes))
    return `${p}px ${sizes
      .slice(start, end)
      .map(s => `${s}px`)
      .join(' ')}`
  return `${p}px repeat(${end - start}, ${sizes.size}px)`
}
