import { createOffsetManager } from './offset-manager'
import type {
  ScrollContainer,
  ScrollState,
  FixedSizes as Sizes,
} from './interfaces'
import { updateState } from './with-scroll'

const { min, max } = Math

export type FixedProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initState: () => ScrollState
  defaultPageSize: () => number
}>
export const createVirtualizedFixed = ({
  ref,
  sizes,
  initState,
  defaultPageSize,
}: FixedProps) => {
  let state: ScrollState = initState()
  const offsetManager = createOffsetManager(sizes, state.offset, state.pageSize)
  let lastOffset = null as null | number
  const recalc = (): number | true | false => {
    const div = ref()
    if (!div) return false
    const prev = state
    state = updateState(state, div, defaultPageSize)
    if (prev === state) return false
    const r2 = offsetManager.f(state.offset, state.pageSize)
    return r2.d && lastOffset !== r2.ro ? (lastOffset = r2.ro) : true
  }
  const render = () => {
    const [range, innerSize, preSize] = offsetManager.r()
    const gridTemplate = getTemplate(preSize, sizes, ...range)
    const gridConst = 2 - range[0]
    return { range, innerSize, gridTemplate, gridConst } as const
  }
  return { render, recalc } as const
}

/** @internal */
const sumLimit = (sizes: Sizes, idx: number): number =>
  sizes.size * min(max(0, idx), sizes.length)

/** @internal */
const getTemplate = (pre: number, sizes: Sizes, start: number, end: number) => {
  const p = sumLimit(sizes, start) - pre || 0
  return `${p}px repeat(${end - start}, ${sizes.size}px)`
}
