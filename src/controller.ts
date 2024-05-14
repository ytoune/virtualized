import type {
  Controller,
  ControllerState,
  ScrollContainer,
  ScrollState,
  FixedSizes as Sizes,
  StickyPosition,
} from './interfaces'
import { updateState } from './with-scroll'
import { getRange } from './get-range'
import { getNextOffset } from './next-offset'
import { getOffsetAndSize, getRangeAndOut } from './next-offset-2'

const { min, max, abs, floor } = Math

export type CreateProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  sticky: StickyPosition | null
  initOffset: () => number
  defaultPageSize: () => number
}>
export const createController = ({
  ref,
  sizes,
  sticky,
  initOffset,
  defaultPageSize,
}: CreateProps): Controller => {
  // const state: ScrollState = {
  //   offset: initOffset(),
  //   pageSize: defaultPageSize(),
  // }
  const virtualTotalSize = getTotal(sizes)
  let vo = initOffset()
  let ps = defaultPageSize()
  let ro!: number
  let rs!: number
  let range!: readonly [number, number]
  const recalcVar = () => {
    const [ro0, rs0] = getOffsetAndSize(vo, ps, virtualTotalSize)
    const [range0, outTop, outBot] = getRangeAndOut(vo, ps, sizes, sticky)
    ro = ro0 + outTop
    rs = rs0 + outTop + outBot
    range = range0
  }
  recalcVar()
  let prev = ro
  type NextState = Readonly<{ offset?: number; pageSize?: number }>
  const recalc = (next?: NextState): number | true | false => {
    if (next) {
      if (void 0 !== next.offset) {
        if (next.offset === vo) return false
        vo = next.offset
      } else if (void 0 !== next.pageSize) {
        if (next.pageSize === ps) return false
        ps = next.pageSize
      }
      recalcVar()
      return prev === ro || (prev = ro)
    } else {
      const div = ref()
      if (div) {
        const offset = max(div.offset, 0)
        const pageSize = min(div.pageSize, defaultPageSize())
        vo += offset - prev
        if (ps !== pageSize) {
          ps = pageSize
          recalcVar()
        }
        if (ps < abs(ro - offset)) {
          recalcVar()
        }
        return prev === ro || (prev = ro)
      }
      return false
    }
  }
  const render = () => {
    const innerSize = rs
    const preSize = vo - ro
    const gridTemplate = getTemplate(preSize, sizes, ...range)
    const gridConst = 2 - range[0]
    return { range, innerSize, gridTemplate, gridConst } as const
  }
  const getState = (): ControllerState => ({
    offset: vo,
    pageSize: ps,
    realOffset: ro,
  })
  return { sizes, render, recalc, state: getState } as const
}

/** @internal */
const getTotal = (sizes: Sizes) => {
  const { length: count, size } = sizes
  return count * size
}

/** @internal */
const sumLimit = (sizes: Sizes, idx: number): number =>
  sizes.size * min(max(0, idx), sizes.length)

/** @internal */
const getTemplate = (pre: number, sizes: Sizes, start: number, end: number) => {
  const p = sumLimit(sizes, start) - pre || 0
  return `${p}px repeat(${end - start}, ${sizes.size}px)`
}
