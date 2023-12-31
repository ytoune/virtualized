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
  style: CellStyle,
) => T | null
