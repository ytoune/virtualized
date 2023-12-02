import type { CellStyle, Sizes } from './interfaces'

const isArray: (arr: unknown) => arr is readonly unknown[] = Array.isArray

const sum = (arr: readonly number[], len = arr.length) => {
  const len2 = Math.min(arr.length, len)
  let sum = 0
  for (let i = 0; i < len2; ++i) sum += arr[i]!
  return sum
}

type Sticky = Readonly<{ r?: number; c?: number }> | null
const lift = (list: Sizes, value: number | undefined) => {
  if (void 0 !== value) {
    if (isArray(list)) return `${sum(list, value)}px` as const
    return `${Math.min(list.length, value) * list.size}px` as const
  }
}

type AreaString = `${number}/${number}/${number}/${number}`
type Area = AreaString | readonly [r: number, c: number]

const getGridArea = (area: Area): AreaString => {
  if ('string' === typeof area) return area
  const [r, c] = area
  return `${r + 1}/${c + 1}/${r + 2}/${c + 2}`
}

type GetCellStyle = (area: Area, sticky?: Sticky) => CellStyle

const cellStyleMaker = (
  { rows, cols }: { rows: Sizes; cols: Sizes },
  areaOnly: boolean | undefined,
): GetCellStyle =>
  areaOnly
    ? area => ({ gridArea: getGridArea(area) })
    : (area, sticky) => {
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

const getTotal = (sizes: Sizes) => {
  if (isArray(sizes)) return sum(sizes)
  const { length: count, size } = sizes
  return count * size
}

const toTemplate = (sizes: Sizes) => {
  if (isArray(sizes)) return sizes.map(s => `${s}px`).join(' ')
  return `repeat(${sizes.length}, ${sizes.size}px)`
}

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
  rowSizes: Sizes
  colSizes: Sizes
  areaOnly?: boolean
}>
export type Format = Readonly<{
  innerStyle: InnerStyle
  outerStyle: typeof outerStyle
  rowSizes: Sizes
  colSizes: Sizes
  cell: GetCellStyle
}>
export const createFormat = ({
  rowSizes: rows,
  colSizes: cols,
  areaOnly,
}: FormatProps): Format => {
  const height = getTotal(rows)
  const width = getTotal(cols)
  const template = `${toTemplate(rows)} / ${toTemplate(cols)}`
  const innerStyle: InnerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    display: 'grid',
    gridTemplate: template,
  }
  const cell = cellStyleMaker({ rows, cols }, areaOnly)
  return { innerStyle, outerStyle, rowSizes: rows, colSizes: cols, cell }
}
