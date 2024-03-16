export type StickyPosition = number | readonly number[] | ReadonlySet<number>
export type Sticky = Readonly<{ r?: StickyPosition; c?: StickyPosition }> | null

export type Sizes =
  | Readonly<{ size: number; length: number }>
  | readonly number[]

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

export interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}
