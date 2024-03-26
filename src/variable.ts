import { getRange } from './get-range'
import type {
  Controller,
  ScrollContainer,
  ScrollState,
  VariableSizes as Sizes,
} from './interfaces'
import { updateState } from './with-scroll'

export type VariableProps = Readonly<{
  ref: () => ScrollContainer | null
  sizes: Sizes
  initOffset: () => number
  defaultPageSize: () => number
}>
export const createVirtualizedVariable = ({
  ref,
  sizes,
  initOffset,
  defaultPageSize,
}: VariableProps): Controller => {
  let state: ScrollState = { offset: initOffset(), pageSize: defaultPageSize() }
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
  return { sizes, render, recalc } as const
}

/** @internal */
const getTotal = (sizes: Sizes) => {
  let sum = 0
  for (let i = 0; i < sizes.length; ++i) sum += sizes[i]!
  return sum
}

/** @internal */
const getTemplate = (sizes: Sizes) => sizes.map(s => `${s}px`).join(' ')
