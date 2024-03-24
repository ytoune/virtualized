import type {
  AreaString,
  HTMLElement,
  RenderItem,
  ScrollContainer,
  ScrollState,
  Sizes,
  Sticky,
} from './interfaces'
import { isArray, screenHeight, screenWidth } from './utils'
import { subscribeImpl } from './with-scroll'
import { createItemStyle, outerStyle } from './format'
import { createIterImpl } from './items'
import { createVirtualizedVariable } from './variable'
import { createVirtualizedFixed } from './fixed'

export interface ScrollProps {
  readonly top?: number
  readonly left?: number
}

type CreateManagerProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initState: () => ScrollState
  defaultPageSize: () => number
}>
const createManager = (
  props: CreateManagerProps,
):
  | ReturnType<typeof createVirtualizedVariable>
  | ReturnType<typeof createVirtualizedFixed> =>
  (isArray(props.sizes) ? createVirtualizedVariable : createVirtualizedFixed)(
    props as Parameters<typeof createVirtualizedVariable>[0] &
      Parameters<typeof createVirtualizedFixed>[0],
  )

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
  const rowManager = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollTop, pageSize: div.clientHeight }
    },
    sizes: rowSizes,
    initState: () =>
      ({ offset: 0, pageSize: screenHeight(), direction: false }) as const,
    defaultPageSize: screenHeight,
  })
  const colManager = createManager({
    ref: () => {
      const div = divRef()
      return div && { offset: div.scrollLeft, pageSize: div.clientWidth }
    },
    sizes: colSizes,
    initState: () =>
      ({ offset: 0, pageSize: screenWidth(), direction: false }) as const,
    defaultPageSize: screenWidth,
  })
  let scrolling = false
  const onScroll = () => {
    const div = divRef()
    if (!div || scrolling) return
    const r2 = rowManager.recalc()
    const c2 = colManager.recalc()
    if (false !== r2 || false !== c2) {
      scrolling = true
      const scrollProps: { top?: number; left?: number } = {}
      if ('number' === typeof r2) scrollProps.top = r2
      if ('number' === typeof c2) scrollProps.left = c2
      pin()
      if (scrollProps.top || scrollProps.left) scroll(scrollProps)
      Promise.resolve().then(() => (scrolling = false))
    }
  }
  const render = (sticky?: Sticky) => {
    const r2 = rowManager.render()
    const c2 = colManager.render()
    const innerStyle = {
      height: `${r2.innerSize}px`,
      width: `${c2.innerSize}px`,
      display: 'grid',
      gridTemplate: `${r2.gridTemplate}/${c2.gridTemplate}`,
    } as const
    const rowIter = createIterImpl(r2.range, sticky?.r)
    const colIter = createIterImpl(c2.range, sticky?.c)
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
      `${row + r2.gridConst}/${col + c2.gridConst}/${1 + row + r2.gridConst}/${1 + col + c2.gridConst}`
    const itemStyle = (row: number, col: number) =>
      createItemStyle(row, col, { rowSizes, colSizes, sticky, getGridArea })
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
  const subscribe = () => subscribeImpl(divRef, onScroll)
  return { render, onScroll, subscribe } as const
}
