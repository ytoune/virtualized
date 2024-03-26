import { getRange } from './get-index'
import type {
  ScrollContainer,
  ScrollState,
  VariableSizes as Sizes,
} from './interfaces'
import { updateState } from './with-scroll'

export type VariableProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initState: () => ScrollState
  defaultPageSize: () => number
}>
export const createVirtualizedVariable = ({
  ref,
  sizes,
  initState,
  defaultPageSize,
}: VariableProps) => {
  let state: ScrollState = initState()
  const recalc = (): true | false => {
    const div = ref()
    if (!div) return false
    const prev = state
    state = updateState(state, div, defaultPageSize)
    return prev !== state
  }
  const innerSize = getTotal(sizes)
  const gridTemplate = getTemplate(sizes)
  const gridConst = 1
  const render = () => {
    const range = getRange(sizes, state.offset, state.pageSize)
    return { range, innerSize, gridTemplate, gridConst } as const
  }
  return { render, recalc } as const
}

/** @internal */
const getTotal = (sizes: Sizes) => {
  let sum = 0
  for (let i = 0; i < sizes.length; ++i) sum += sizes[i]!
  return sum
}

/** @internal */
const getTemplate = (sizes: Sizes) => sizes.map(s => `${s}px`).join(' ')
