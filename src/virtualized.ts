import type {
  AreaString,
  Controller,
  HTMLElement,
  ScrollContainer,
  Sizes,
  Sticky,
} from './interfaces'
import { isArray, screenHeight, screenWidth } from './utils'
import { subscribeScroll } from './with-scroll'
import { createItemStyle, outerStyle } from './format'
import { createVirtualizedVariable } from './variable'
import { createVirtualizedFixed } from './fixed'

export interface ScrollProps {
  readonly top?: number
  readonly left?: number
}

type CreateManagerProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initOffset: () => number
  defaultPageSize: () => number
}>
const createManager = (props: CreateManagerProps): Controller =>
  (isArray(props.sizes) ? createVirtualizedVariable : createVirtualizedFixed)(
    props as Parameters<typeof createVirtualizedVariable>[0] &
      Parameters<typeof createVirtualizedFixed>[0],
  )

const initOffset = () => 0

export type VirtualizedProps = Readonly<{
  pin: () => void
  divRef: () => HTMLElement | null
  scroll: (props: ScrollProps) => void
  rowSizes: Sizes
  colSizes: Sizes
}>
export const createVirtualized = ({
  pin,
  divRef,
  scroll,
  rowSizes,
  colSizes,
}: VirtualizedProps) => {
  const rows = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollTop, pageSize: div.clientHeight }
    },
    sizes: rowSizes,
    initOffset,
    defaultPageSize: screenHeight,
  })
  const cols = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollLeft, pageSize: div.clientWidth }
    },
    sizes: colSizes,
    initOffset,
    defaultPageSize: screenWidth,
  })
  const onScroll = createOnScroll(rows, cols, pin, divRef, scroll)
  const render = (sticky?: Sticky) => renderImpl(rows, cols, sticky)
  const subscribe = () => subscribeScroll(divRef, onScroll)
  return { render, onScroll, subscribe } as const
}

/** @internal */
const createOnScroll = (
  rows: Controller,
  cols: Controller,
  pin: () => void,
  divRef: () => HTMLElement | null,
  scroll: (props: ScrollProps) => void,
) => {
  let scrolling = false
  const onScroll = () => {
    const div = divRef()
    if (!div || scrolling) return
    const r2 = rows.recalc()
    const c2 = cols.recalc()
    if (false !== r2 || false !== c2) {
      scrolling = true
      const scrollProps: { top?: number; left?: number } = {}
      if ('number' === typeof r2 && r2) scrollProps.top = r2
      if ('number' === typeof c2 && c2) scrollProps.left = c2
      pin()
      if (scrollProps.top || scrollProps.left) scroll(scrollProps)
      Promise.resolve().then(() => (scrolling = false))
    }
  }
  return onScroll
}

/** @internal */
const renderImpl = (rows: Controller, cols: Controller, sticky?: Sticky) => {
  const r2 = rows.render()
  const c2 = cols.render()
  const innerStyle = {
    height: `${r2.innerSize}px`,
    width: `${c2.innerSize}px`,
    display: 'grid',
    gridTemplate: `${r2.gridTemplate}/${c2.gridTemplate}`,
  } as const
  const items = <T>(
    renderItem: (
      row: number,
      col: number,
      isStickyRow: true | undefined,
      isStickyCol: true | undefined,
    ) => T | null,
  ) => {
    const items: T[] = []
    if (rows.sizes.length && cols.sizes.length) {
      for (const ri of r2.range)
        for (const ci of c2.range) {
          const el = renderItem(ri[0], ci[0], ri[2], ci[2])
          if (el) items.push(el)
        }
    }
    return items
  }
  const gridAreaMap: Record<`${number},${number}`, AreaString> = {}
  for (const [rk, ri] of r2.range)
    for (const [ck, ci] of c2.range)
      gridAreaMap[`${rk},${ck}`] = `${ri}/${ci}/${1 + ri}/${1 + ci}`
  const getGridArea = (row: number, col: number): AreaString =>
    gridAreaMap[`${row},${col}`]!
  const itemStyle = (row: number, col: number) =>
    createItemStyle(row, col, {
      rowSizes: rows.sizes,
      colSizes: cols.sizes,
      sticky,
      getGridArea,
    })
  return {
    innerStyle,
    outerStyle,
    items,
    itemStyle,
    getGridArea,
    rowRange: r2.range,
    colRange: c2.range,
  } as const
}
