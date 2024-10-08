import type {
  AreaString,
  CellStyle,
  Sizes,
  Sticky,
  StickyPosition,
} from './interfaces'
import { isArray } from './libs/utils'

const lift = (
  idx: number,
  list: Sizes,
  pos: StickyPosition | null,
): `${number}px` | undefined => {
  if (null === pos) return
  if ('number' === typeof pos) return idx === pos ? '0px' : void 0
  const get = isArray(list) ? (i: number) => list[i]! : () => list.size
  let sum = 0
  for (const i of pos) {
    if (idx === i) return `${sum}px`
    sum += get(i)
  }
}

type LiftMemoTuple = readonly [
  Sizes,
  StickyPosition | null,
  { v: ReturnType<typeof lift> }[],
]

const liftMemo = {
  row: new Map<number, LiftMemoTuple>(),
  col: new Map<number, LiftMemoTuple>(),
} as const
const memoizedLift = (
  key: 'row' | 'col',
  idx: number,
  list: Sizes,
  pos: StickyPosition | null,
) => {
  const map = liftMemo[key]
  let v = map.get(idx)
  if (!(v && v[0] === list && v[1] === pos)) v = [list, pos, []]
  return (v[2][idx] ??= { v: lift(idx, list, pos) }).v
}

const defaultGetGridArea = (row: number, col: number): AreaString =>
  `${row + 1}/${col + 1}/${row + 2}/${col + 2}`

export const createItemStyle = (
  row: number,
  col: number,
  {
    rowSizes,
    colSizes,
    sticky,
    getGridArea = defaultGetGridArea,
  }: Readonly<{
    rowSizes: Sizes
    colSizes: Sizes
    sticky?: Sticky
    getGridArea?: (row: number, col: number) => AreaString
  }>,
): CellStyle => {
  const style: CellStyle = { gridArea: getGridArea(row, col) }
  if (sticky) {
    const top = memoizedLift('row', row, rowSizes, sticky.r ?? null)
    const left = memoizedLift('col', col, colSizes, sticky.c ?? null)
    if (top || left) {
      style.position = 'sticky'
      if (top) style.top = top
      if (left) style.left = left
    }
  }
  return style
}

/** @internal */
const getTotal = (sizes: Sizes) => {
  if (isArray(sizes)) {
    let sum = 0
    for (let i = 0; i < sizes.length; ++i) sum += sizes[i]!
    return sum
  }
  const { length: count, size } = sizes
  return count * size
}

/** @internal */
const getTemplate = (sizes: Sizes) => {
  if (isArray(sizes)) return sizes.map(s => `${s}px`).join(' ')
  return `repeat(${sizes.length}, ${sizes.size}px)`
}

/** @internal */
export const outerStyle = {
  width: '100%',
  height: '100%',
  overflow: 'scroll',
  margin: 0,
  padding: 0,
} as const

type InnerStyle = {
  width: `${number}px`
  height: `${number}px`
  display: 'grid'
  gridTemplate: `${string}/${string}`
}

/** @deprecated */
export const createFormat = ({
  rowSizes,
  colSizes,
  sticky,
}: Readonly<{
  rowSizes: Sizes
  colSizes: Sizes
  sticky?: Sticky
}>) => {
  const innerStyle: InnerStyle = {
    height: `${getTotal(rowSizes)}px`,
    width: `${getTotal(colSizes)}px`,
    display: 'grid',
    gridTemplate: `${getTemplate(rowSizes)}/${getTemplate(colSizes)}`,
  }
  return { rowSizes, colSizes, sticky, innerStyle, outerStyle }
}
