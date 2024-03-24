export type StickyPosition = number | readonly number[] | ReadonlySet<number>
export type Sticky = Readonly<{ r?: StickyPosition; c?: StickyPosition }> | null

export type FixedSizes = Readonly<{ size: number; length: number }>
export type VariableSizes = readonly number[]

export type Sizes = FixedSizes | VariableSizes

export type AreaString = `${number}/${number}/${number}/${number}`

export type CellStyle = {
  gridArea: string
  position?: 'sticky'
  top?: `${number}px`
  left?: `${number}px`
}

export type RenderItem<T> = (
  row: number,
  col: number,
  isStickyRow: true | undefined,
  isStickyCol: true | undefined,
) => T | null

export interface ScrollContainer {
  readonly offset: number
  readonly pageSize: number
}

export type ScrollState = Readonly<{
  offset: number
  pageSize: number
  direction: false | 'backward' | 'forward'
}>

export interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}
