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
  style: CellStyle,
) => T | null

export interface ScrollContainer {
  readonly offset: number
  readonly pageSize: number
}

export type ScrollState = Readonly<{
  offset: number
  pageSize: number
}>

export interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}

export type Controller = Readonly<{
  sizes: Sizes
  /**
   * Recalculates the internal state.
   * Returns false if there was no change in the state.
   * If a number is returned, scrolling is required.
   */
  recalc: () => number | boolean
  /**
   * Calculates and returns the values for rendering.
   */
  render: () => Readonly<{
    range: readonly [start: number, end: number]
    innerSize: number
    gridTemplate: string
    gridConst: number
  }>
}>
