import type { CellStyle, Positions, Sticky } from './interfaces'

const sum = (q: number, w: number) => q + w
const lift = (list: readonly number[], value: number | undefined) =>
  void 0 !== value && (`${list.slice(0, value).reduce(sum, 0)}px` as const)

type AreaString = `${number}/${number}/${number}/${number}`
type Area = AreaString | readonly [r: number, c: number]

const getGridArea = (area: Area): AreaString => {
  if ('string' === typeof area) return area
  const [r, c] = area
  return `${r + 1}/${c + 1}/${r + 2}/${c + 2}`
}

const cellStyleMaker =
  ({ rows, cols }: { rows: readonly number[]; cols: readonly number[] }) =>
  (area: Area, sticky: Sticky = null): CellStyle => {
    const style: CellStyle = { gridArea: getGridArea(area) }
    if (sticky) {
      const top = lift(rows, sticky.r)
      const left = lift(cols, sticky.c)
      if (top || left) {
        style.position = 'sticky'
        if (top) style.top = top
        if (left) style.left = left
      }
    }
    return style
  }

const isArray: (arr: unknown) => arr is readonly unknown[] = Array.isArray

const getTotal = (sizes: Positions) => {
  if (isArray(sizes)) {
    const list = sizes
    const total = sizes.reduce(sum, 0)
    return { list, total } as const
  }
  const { length: count, size } = sizes
  const list = Array<number>(count).fill(size)
  const total = count * size
  return { list, total } as const
}

const toTemplate = (list: readonly number[]) =>
  list.map(s => `${s}px`).join(' ')

const outerStyle = {
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
  gridTemplate: string
}

type FormatProps = Readonly<{
  rowPositions: Positions
  colPositions: Positions
}>
export type Format = Readonly<{
  innerStyle: InnerStyle
  outerStyle: typeof outerStyle
  rowPositions: Positions
  colPositions: Positions
  cell: (area: Area, sticky?: Sticky) => CellStyle
}>
export const createFormat = ({
  rowPositions,
  colPositions,
}: FormatProps): Format => {
  const { total: height, list: rows } = getTotal(rowPositions)
  const { total: width, list: cols } = getTotal(colPositions)
  const template = `${toTemplate(rows)} / ${toTemplate(cols)}`
  const innerStyle: InnerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    display: 'grid',
    gridTemplate: template,
  }
  const cell = cellStyleMaker({ rows, cols })
  return { innerStyle, outerStyle, rowPositions, colPositions, cell }
}
