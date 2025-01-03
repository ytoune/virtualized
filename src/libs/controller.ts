import type {
  Controller,
  ControllerState,
  Rendered,
  ScrollContainer,
  Sizes,
  StickyPosition,
  NextState,
} from '../interfaces'
import { render as getRendered } from './render'
import { getTotal, createStickyManager } from './utils'

const { min, max } = Math

export type CreateProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  sticky: StickyPosition | null
  initOffset: () => number
  initPageSize?: () => number
  /** ウィンドウのサイズなどそのとき考え得る最大のビューポートの大きさ */
  defaultPageSize: () => number
}>
export const createController = ({
  ref,
  sizes,
  sticky: stickyData,
  initOffset,
  initPageSize,
  defaultPageSize,
}: CreateProps): Controller => {
  const virtualTotalSize = getTotal(sizes)
  const sticky = createStickyManager(stickyData)

  /** 実際に html 要素に描画を行う元のコンテンツ全体における範囲の開始位置 */
  let vo = initOffset()
  /** 実際に html 要素に描画を行う元のコンテンツ全体における範囲の大きさ */
  let ps = initPageSize?.() ?? defaultPageSize()

  /** vo と実際の offset の差 ( `vo === ro + diff` ) */
  let diff!: number
  let rendered!: Rendered

  /** vo がこの範囲内の場合は再描画不要 */
  let keep!: readonly [start: number, end: number]

  const inKeep = (vo: number) => keep[0] <= vo && vo + ps < keep[1]

  const recalcVar = () => {
    ;({ rendered, diff, keep } = getRendered(
      sizes,
      sticky,
      vo,
      ps,
      virtualTotalSize,
    ))
  }

  recalcVar()

  const recalc = (next?: NextState): number | false => {
    if (next) {
      if (void 0 !== next.realOffset) {
        const offset = next.realOffset + diff
        if (offset === vo) return false
        if (inKeep((vo = offset))) return vo - diff
      } else if (void 0 !== next.offset) {
        if (next.offset === vo) return false
        if (inKeep((vo = next.offset))) return vo - diff
      } else if (void 0 !== next.pageSize) {
        if (next.pageSize === ps) return false
        ps = next.pageSize
      }
      recalcVar()
      return vo - diff
    } else {
      const div = ref()
      if (div) {
        const ro = max(div.offset, 0)
        const pageSize = min(div.pageSize, defaultPageSize())
        vo = ro + diff
        if (ps !== pageSize || !inKeep(vo)) {
          ps = pageSize
          recalcVar()
          return vo - diff
        }
      }
    }
    return false
  }
  const render = () => rendered
  const getState = (): ControllerState => ({
    offset: vo,
    pageSize: ps,
    realOffset: vo - diff,
  })
  return {
    sizes,
    render,
    recalc,
    state: getState,
    totalSize: virtualTotalSize,
  } as const
}
