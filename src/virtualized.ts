import { subscribeScroll } from './with-scroll'
import { createItemStyle, outerStyle } from './format'
import type {
  AreaString,
  Controller,
  HTMLElement,
  Sizes,
  Sticky,
  StickyPosition,
} from './interfaces'
import { screenHeight, screenWidth } from './libs/utils'
import { createController } from './libs/controller'

export interface ScrollProps {
  readonly top?: number
  readonly left?: number
}

const initOffset = () => 0

type State = Readonly<{
  scrollTop: number
  scrollLeft: number
  innerHeight: number
  innerWidth: number
  scrollHeight: number
  scrollWidth: number
}>
type Subscription = {
  unsubscribe: () => void
}
type Observable<T> = {
  subscribe: (
    next: ((v: T) => void) | { readonly next: (v: T) => void },
  ) => Subscription
}

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
  const rows = createController({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollTop, pageSize: div.clientHeight }
    },
    sizes: rowSizes,
    initOffset,
    defaultPageSize: screenHeight,
    sticky: stickyRows,
  })
  const cols = createController({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollLeft, pageSize: div.clientWidth }
    },
    sizes: colSizes,
    initOffset,
    defaultPageSize: screenWidth,
    sticky: stickyCols,
  })
  const subscribers = new Set<(s: State) => void>()
  const state$: Observable<State> = {
    subscribe: f => {
      const g = 'function' === typeof f ? f : f.next
      subscribers.add(g)
      return {
        unsubscribe: () => {
          subscribers.delete(g)
        },
      }
    },
  }
  const { onScroll, scroll } = createOnScroll(
    rows,
    cols,
    pin,
    divRef,
    scrollImpl,
    () => {
      const s = state()
      for (const f of subscribers) f(s)
    },
  )
  const sticky: Sticky | undefined =
    null !== stickyRows || null !== stickyCols
      ? { r: stickyRows, c: stickyCols }
      : void 0
  const render = () => renderImpl(rows, cols, sticky)
  const subscribe = () => subscribeScroll(divRef, onScroll)
  const state = (): State => {
    const rs = rows.state()
    const cs = cols.state()
    return {
      scrollTop: rs.offset,
      scrollLeft: cs.offset,
      innerHeight: rs.pageSize,
      innerWidth: cs.pageSize,
      scrollHeight: rows.totalSize,
      scrollWidth: cols.totalSize,
    }
  }
  return { render, onScroll, subscribe, scroll, state, state$ } as const
}

/** @internal */
const createOnScroll = (
  rows: Controller,
  cols: Controller,
  pin: () => void,
  divRef: () => HTMLElement | null,
  scrollImpl: (props: ScrollProps) => void,
  handleScroll: () => void,
) => {
  let scrolling = false
  const move = (r2?: number | boolean, c2?: number | boolean) => {
    if (false !== r2 || false !== c2) {
      scrolling = true
      const scrollProps: { top?: number; left?: number } = {}
      if ('number' === typeof r2) scrollProps.top = r2
      if ('number' === typeof c2) scrollProps.left = c2
      pin()
      if (void 0 !== scrollProps.top || void 0 !== scrollProps.left)
        scrollImpl(scrollProps)
      Promise.resolve().then(() => (scrolling = false))
    }
    handleScroll()
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
