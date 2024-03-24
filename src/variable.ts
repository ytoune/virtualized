import type {
  ScrollContainer,
  ScrollState,
  VariableSizes as Sizes,
} from './interfaces'
import { updateState } from './with-scroll'
import { getTotal } from './format'

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
  const range: readonly [start: number, end: number] = [0, sizes.length]
  const innerSize = getTotal(sizes)
  const gridTemplate = getTemplate(sizes)
  const gridConst = 1
  const render = () => ({ range, innerSize, gridTemplate, gridConst }) as const
  return { render, recalc } as const
}

/** @internal */
const getTemplate = (sizes: Sizes) => sizes.map(s => `${s}px`).join(' ')
