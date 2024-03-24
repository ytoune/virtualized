import { getTotal } from './format'
import { getIndex } from './get-range'
import type { Sizes } from './interfaces'
import { getNextOffset } from './next-offset'

const { min, abs } = Math

/** @internal */
export const createOffsetManager = (
  sizes: Sizes,
  initVirtualOffset: number,
  initClientSize: number,
) => {
  const virtualTotalSize = getTotal(sizes)
  let vo = initVirtualOffset
  let ro = null as null | number
  let ps = null as null | number
  let range: readonly [start: number, end: number] = [0, 0]
  let ro2 = null as null | number
  const f = (realOffset: number, clientSize: number) => {
    if (null !== ro2 && abs(ro2 - realOffset) <= 2 && ps === clientSize)
      return { vo, ro, d: false } as const
    const o = getNextOffset(
      virtualTotalSize,
      clientSize,
      ps ?? clientSize,
      realOffset,
      ro ?? realOffset,
      vo,
    )
    ps = clientSize
    range = getRange(sizes, o[1], ps)
    ;[ro, vo] = o
    const d = 2 < abs(ro - realOffset)
    ro2 = realOffset
    return { vo, ro, d } as const
  }
  const r = () =>
    [
      range,
      min((ps ?? initClientSize) * 5, virtualTotalSize),
      vo - (ro ?? vo),
    ] as const
  return { f, r } as const
}

/** @internal */
const getRange = (
  sizes: Sizes,
  current: number,
  clientSize: number,
): readonly [start: number, end: number] => {
  const startOffset = current - clientSize
  const endOffset = current + clientSize + clientSize

  const startIndex = getIndex(sizes, startOffset)
  const endIndex = getIndex(sizes, endOffset, true)

  return [startIndex, endIndex] as const
}
