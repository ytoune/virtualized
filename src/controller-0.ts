import { getTemplate } from './grid-template'
import type {
  Controller,
  ControllerState,
  ScrollContainer,
  FixedSizes as Sizes,
  StickyPosition,
} from './interfaces'
import { getOffsetAndSize, getRangeAndOut } from './next-offset-2'

const { min, max, abs } = Math

export type CreateProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  sticky: StickyPosition | null
  initOffset: () => number
  /** ウィンドウのサイズなどそのとき考え得る最大のビューポートの大きさ */
  defaultPageSize: () => number
}>
export const createController = ({
  ref,
  sizes,
  sticky,
  initOffset,
  defaultPageSize,
}: CreateProps): Controller => {
  const virtualTotalSize = getTotal(sizes)
  let vo = initOffset()
  let ps = defaultPageSize()
  let origin!: number
  let rs!: number
  let range!: [start: number, end: number, isSticky?: true][]
  let gridTemplate!: string
  const recalcVar = () => {
    const [ro0, rs0] = getOffsetAndSize(vo, ps, virtualTotalSize)
    const [range0, outTop, outBot] = getRangeAndOut(vo, ps, sizes, sticky)
    const [b, e] = range0
    origin = ro0 + outTop
    rs = rs0 + outTop + outBot
    const tmp: [start: number, end: number, isSticky?: true][] = []
    for (let i = b, g = 2; i < e; ++i, ++g) tmp.push([i, g])
    range = tmp
    gridTemplate = getTemplate(origin, sizes, range0, sticky)
  }
  recalcVar()
  let prev = origin
  let ro = origin
  type NextState = Readonly<{ offset?: number; pageSize?: number }>
  const recalc = (next?: NextState): number | true | false => {
    if (next) {
      if (void 0 !== next.offset) {
        if (next.offset === vo) return false
        vo = next.offset
        ro = vo - origin
      } else if (void 0 !== next.pageSize) {
        if (next.pageSize === ps) return false
        ps = next.pageSize
      }
      recalcVar()
      return prev === origin || ((ro = origin), (prev = origin))
    } else {
      const div = ref()
      if (div) {
        const offset = max(div.offset, 0)
        const pageSize = min(div.pageSize, defaultPageSize())
        vo += offset - ro
        ro = offset
        if (ps !== pageSize) {
          ps = pageSize
          recalcVar()
        }
        if (ps < abs(origin - offset)) {
          recalcVar()
        }
        return prev === origin || ((ro = origin), (prev = origin))
      }
      return false
    }
  }
  const render = () => ({ items: range, innerSize: rs, gridTemplate }) as const
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
