import type {
  Controller,
  ControllerState,
  ScrollContainer,
  ScrollState,
  FixedSizes as Sizes,
} from './interfaces'
import { updateState } from './with-scroll'
import { getRange } from './get-range'
import { getNextOffset } from './next-offset'

const { min, max, abs } = Math

export type FixedProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initOffset: () => number
  defaultPageSize: () => number
}>
export const createVirtualizedFixed = ({
  ref,
  sizes,
  initOffset,
  defaultPageSize,
}: FixedProps): Controller => {
  let state: ScrollState = { offset: initOffset(), pageSize: defaultPageSize() }
  const virtualTotalSize = getTotal(sizes)
  let ro2 = null as null | number
  let vo = state.offset
  type NextState = Readonly<{ offset?: number; pageSize?: number }>
  const recalc = (next?: NextState): number | true | false => {
    const prev = state
    if (next) {
      if (void 0 !== next.offset) {
        if (next.offset === vo) return false
        vo = next.offset
      } else if (void 0 !== next.pageSize) {
        if (next.pageSize === state.pageSize) return false
        state = { offset: state.offset, pageSize: next.pageSize }
      }
    } else {
      const div = ref()
      if (!div) return false
      state = updateState(state, div, defaultPageSize)
      if (prev === state) return false
      if (prev.pageSize === state.pageSize)
        if (null !== ro2 && abs(ro2 - state.offset) <= 2) {
          state = prev
          return false
        }
    }
    const [r0, v0] = getNextOffset(
      virtualTotalSize,
      state.pageSize,
      prev.pageSize,
      state.offset,
      prev.offset,
      vo,
    )
    vo = v0
    ro2 = state.offset
    if (2 < abs(state.offset - r0)) {
      state = { offset: r0, pageSize: state.pageSize }
      return state.offset
    }
    return true
  }
  const render = () => {
    const [b, e] = getRange(sizes, vo, state.pageSize)
    const innerSize = min(state.pageSize * 5, virtualTotalSize)
    const preSize = vo - state.offset
    const gridTemplate = getTemplate(preSize, sizes, b, e)
    const range: [b: number, e: number, s?: true][] = []
    for (let i = b, g = 2; i < e; ++i, ++g) range.push([i, g])
    return { range, innerSize, gridTemplate } as const
  }
  const getState = (): ControllerState => ({
    offset: vo,
    pageSize: state.pageSize,
    realOffset: state.offset,
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
