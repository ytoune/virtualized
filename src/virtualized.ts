import type {
  AreaString,
  Controller,
  HTMLElement,
  ScrollContainer,
  Sizes,
  Sticky,
  StickyPosition,
} from './interfaces'
import { screenHeight, screenWidth } from './utils'
import { subscribeScroll } from './with-scroll'
import { createItemStyle, outerStyle } from './format'
import { createController } from './controller'
// import { createVirtualizedVariable } from './variable'
// import { createVirtualizedFixed } from './fixed'

export interface ScrollProps {
  readonly top?: number
  readonly left?: number
}

type CreateManagerProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  sticky: StickyPosition | null
  initOffset: () => number
  defaultPageSize: () => number
}>
const createManager = (props: CreateManagerProps): Controller =>
  createController(props)
// (isArray(props.sizes) ? createVirtualizedVariable : createVirtualizedFixed)(
//   props as Parameters<typeof createVirtualizedVariable>[0] &
//     Parameters<typeof createVirtualizedFixed>[0],
// )

const initOffset = () => 0

export type VirtualizedProps = Readonly<{
  pin: () => void
  divRef: () => HTMLElement | null
  scroll: (props: ScrollProps) => void
  rowSizes: Sizes
  colSizes: Sizes
  stickyRows?: StickyPosition | null
  stickyCols?: StickyPosition | null
}>
export const createVirtualized = ({
  pin,
  divRef,
  scroll: scrollImpl,
  rowSizes,
  colSizes,
  stickyRows = null,
  stickyCols = null,
}: VirtualizedProps) => {
  const rows = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollTop, pageSize: div.clientHeight }
    },
    sizes: rowSizes,
    initOffset,
    defaultPageSize: screenHeight,
    sticky: stickyRows,
  })
  const cols = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollLeft, pageSize: div.clientWidth }
    },
    sizes: colSizes,
    initOffset,
    defaultPageSize: screenWidth,
    sticky: stickyCols,
  })
  const { onScroll, scroll } = createOnScroll(
    rows,
    cols,
    pin,
    divRef,
    scrollImpl,
  )
  const sticky: Sticky | undefined =
    null !== stickyRows || null !== stickyCols
      ? { r: stickyRows, c: stickyCols }
      : void 0
  const render = () => renderImpl(rows, cols, sticky)
  const subscribe = () => subscribeScroll(divRef, onScroll)
  const state = () => {
    const rs = rows.state()
    const cs = cols.state()
    return {
      scrollTop: rs.offset,
      scrollLeft: cs.offset,
      innerHeight: rs.pageSize,
      innerWidth: cs.pageSize,
    }
  }
  return { render, onScroll, subscribe, scroll, state } as const
}

/** @internal */
const createOnScroll = (
  rows: Controller,
  cols: Controller,
  pin: () => void,
  divRef: () => HTMLElement | null,
  scrollImpl: (props: ScrollProps) => void,
) => {
  let scrolling = false
  const move = (r2?: number | boolean, c2?: number | boolean) => {
    if (false !== r2 || false !== c2) {
      scrolling = true
      const scrollProps: { top?: number; left?: number } = {}
      if ('number' === typeof r2 && r2) scrollProps.top = r2
      if ('number' === typeof c2 && c2) scrollProps.left = c2
      pin()
      if (scrollProps.top || scrollProps.left) scrollImpl(scrollProps)
      Promise.resolve().then(() => (scrolling = false))
    }
  }
  const onScroll = () => {
    const div = divRef()
    if (!div || scrolling) return
    move(rows.recalc(), cols.recalc())
  }
  const scroll = (top?: number, left?: number) => {
    move(
      void 0 !== top ? rows.recalc({ offset: top }) : void 0,
      void 0 !== left ? cols.recalc({ offset: left }) : void 0,
    )
  }
  return { onScroll, scroll } as const
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
      for (const [rk, , rs] of r2.items)
        for (const [ck, , cs] of c2.items) {
          const el = renderItem(rk, ck, rs, cs)
          if (el) items.push(el)
        }
    }
    return items
  }
  const gridAreaMap: Record<`${number},${number}`, AreaString> = {}
  for (const [rk, ri] of r2.items)
    for (const [ck, ci] of c2.items)
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
    rowRange: r2.items,
    colRange: c2.items,
  } as const
}
