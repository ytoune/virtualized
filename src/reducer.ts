import type { NextState, Rendered, Sizes, StickyPosition } from './interfaces'
import { render } from './libs/render'
import { createStickyManager, getTotal } from './libs/utils'

export type VirtualizedState = Readonly<{
  offset: number
  pageSize: number
  diff: number
  realOffset: number
  rendered: Rendered
  keep: readonly [start: number, end: number]
}>
type State = VirtualizedState

export const createReducer = (sizes: Sizes, sticky: StickyPosition | null) => {
  const virtualTotalSize = getTotal(sizes)
  const sticky2 = createStickyManager(sticky)
  const init = (offset: number, pageSize: number): State => {
    const r = render(sizes, sticky2, offset, pageSize, virtualTotalSize)
    return {
      offset,
      pageSize,
      diff: r.diff,
      realOffset: offset - r.diff,
      rendered: r.rendered,
      keep: r.keep,
    }
  }
  const reducer = (state: State, next: NextState): State => {
    const { offset: vo, pageSize: ps, diff, keep } = state
    const inKeep = (vo: number) => keep[0] <= vo && vo + ps < keep[1]
    const recalc = (offset: number, pageSize: number): State => {
      const r = render(sizes, sticky2, offset, pageSize, virtualTotalSize)
      return {
        offset,
        pageSize,
        diff: r.diff,
        realOffset: offset - r.diff,
        rendered: r.rendered,
        keep: r.keep,
      }
    }
    const update = (offset: number): State => {
      if (offset === vo) return state
      if (inKeep(offset)) {
        const ret = { ...state }
        ret.offset = offset
        ret.realOffset = offset - diff
        return ret
      }
      return recalc(offset, ps)
    }
    if (void 0 !== next.realOffset) return update(next.realOffset + diff)
    if (void 0 !== next.offset) return update(next.offset)
    if (void 0 !== next.pageSize) {
      if (next.pageSize === ps) return state
      return recalc(vo, next.pageSize)
    }
    return state
  }
  return { reducer, init } as const
}
