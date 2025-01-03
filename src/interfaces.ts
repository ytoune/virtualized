export type StickyPosition = number | readonly number[] | ReadonlySet<number>
export type Sticky = Readonly<{
  r?: StickyPosition | null
  c?: StickyPosition | null
}> | null

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

/**
 * Destination entity for drawing, such as a div element
 */
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

export type ControllerState = Readonly<{
  offset: number
  pageSize: number
  realOffset: number
}>

export type NextState =
  | Readonly<{ offset: number; pageSize?: undefined; realOffset?: undefined }>
  | Readonly<{ offset?: undefined; pageSize: number; realOffset?: undefined }>
  | Readonly<{ offset?: undefined; pageSize?: undefined; realOffset: number }>

export type RenderedItem = readonly [
  itemIndex: number,
  gridStart: number,
  isSticky?: true,
]

export type Rendered = Readonly<{
  items: readonly RenderedItem[]
  innerSize: number
  gridTemplate: string
}>

export type Controller = Readonly<{
  sizes: Sizes
  totalSize: number
  state: () => ControllerState
  /**
   * Recalculates or set the internal state.
   * Returns false if there was no change in the state.
   * If a number is returned, scrolling is required.
   */
  recalc: (state?: NextState) => number | boolean
  /**
   * Calculates and returns the values for rendering.
   */
  render: () => Rendered
}>
