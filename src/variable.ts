import { getRange } from './get-range'
import type {
  Controller,
  ControllerState,
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
  type NextState = Readonly<{ offset?: number; pageSize?: number }>
  const recalc = (next?: NextState): true | false => {
    if (next) {
      if (void 0 !== next.offset) {
        if (next.offset === state.offset) return false
        state = { offset: next.offset, pageSize: state.pageSize }
        return true
      }
      if (void 0 !== next.pageSize) {
        if (next.pageSize === state.pageSize) return false
        state = { offset: state.offset, pageSize: next.pageSize }
        return true
      }
    }
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
  const getState = (): ControllerState => ({
    offset: state.offset,
    pageSize: state.pageSize,
    realOffset: state.offset,
  })
  return { sizes, render, recalc, state: getState } as const
}

/** @internal */
const getTotal = (sizes: Sizes) => {
  let sum = 0
  for (let i = 0; i < sizes.length; ++i) sum += sizes[i]!
  return sum
}

/** @internal */
const getTemplate = (sizes: Sizes) => sizes.map(s => `${s}px`).join(' ')
