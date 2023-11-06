/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createFormat, createItems, withScroll } from './index'
import type { RenderItem, Sizes, Sticky } from './index'

interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}

it('main', () => {
  const item: RenderItem<string> = (r, c, s) =>
    JSON.stringify([r, c, s.gridArea, s.top, s.left])
  const { init, onScroll } = withScroll({
    divRef: () => div,
    set: s => {
      scroll = s(scroll)
    },
  })
  let div: HTMLElement | null = null
  let scroll = init
  const format = createFormat({
    rowSizes: { size: 4, length: 5 },
    colSizes: { size: 8, length: 3 },
  })
  expect(createItems(format, scroll, null, item)).toEqual([
    item(0, 0, { gridArea: '1/1/2/2' }),
    item(0, 1, { gridArea: '1/2/2/3' }),
    item(0, 2, { gridArea: '1/3/2/4' }),
    item(1, 0, { gridArea: '2/1/3/2' }),
    item(1, 1, { gridArea: '2/2/3/3' }),
    item(1, 2, { gridArea: '2/3/3/4' }),
    item(2, 0, { gridArea: '3/1/4/2' }),
    item(2, 1, { gridArea: '3/2/4/3' }),
    item(2, 2, { gridArea: '3/3/4/4' }),
    item(3, 0, { gridArea: '4/1/5/2' }),
    item(3, 1, { gridArea: '4/2/5/3' }),
    item(3, 2, { gridArea: '4/3/5/4' }),
    item(4, 0, { gridArea: '5/1/6/2' }),
    item(4, 1, { gridArea: '5/2/6/3' }),
    item(4, 2, { gridArea: '5/3/6/4' }),
  ])
  div = {
    scrollTop: 0,
    scrollLeft: 0,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  expect(createItems(format, scroll, null, item)).toEqual([
    item(0, 0, { gridArea: '1/1/2/2' }),
    item(0, 1, { gridArea: '1/2/2/3' }),
    item(0, 2, { gridArea: '1/3/2/4' }),
    item(1, 0, { gridArea: '2/1/3/2' }),
    item(1, 1, { gridArea: '2/2/3/3' }),
    item(1, 2, { gridArea: '2/3/3/4' }),
    item(2, 0, { gridArea: '3/1/4/2' }),
    item(2, 1, { gridArea: '3/2/4/3' }),
    item(2, 2, { gridArea: '3/3/4/4' }),
  ])
  div = {
    scrollTop: 9,
    scrollLeft: 12,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  expect(createItems(format, scroll, null, item)).toEqual([
    item(1, 0, { gridArea: '2/1/3/2' }),
    item(1, 1, { gridArea: '2/2/3/3' }),
    item(1, 2, { gridArea: '2/3/3/4' }),
    item(2, 0, { gridArea: '3/1/4/2' }),
    item(2, 1, { gridArea: '3/2/4/3' }),
    item(2, 2, { gridArea: '3/3/4/4' }),
    item(3, 0, { gridArea: '4/1/5/2' }),
    item(3, 1, { gridArea: '4/2/5/3' }),
    item(3, 2, { gridArea: '4/3/5/4' }),
    item(4, 0, { gridArea: '5/1/6/2' }),
    item(4, 1, { gridArea: '5/2/6/3' }),
    item(4, 2, { gridArea: '5/3/6/4' }),
  ])
  div = {
    scrollTop: 18,
    scrollLeft: 22,
    clientHeight: 2,
    clientWidth: 2,
  }
  onScroll()
  expect(createItems(format, scroll, null, item)).toEqual([
    item(3, 1, { gridArea: '4/2/5/3' }),
    item(3, 2, { gridArea: '4/3/5/4' }),
    item(4, 1, { gridArea: '5/2/6/3' }),
    item(4, 2, { gridArea: '5/3/6/4' }),
  ])
})
