import { it, expect } from 'vitest'

import type { HTMLElement } from './interfaces'
import { createContainerStyles, createItems, withScroll } from './index'
import type { RenderItem } from './index'

it('main', () => {
  const item = ((r: number, c: number, rs?: true, cs?: true) =>
    JSON.stringify([r, c, rs, cs])) satisfies RenderItem<string>
  const { init, onScroll } = withScroll({
    divRef: () => div,
    set: s => {
      scroll = s(scroll)
    },
  })
  let div: HTMLElement | null = null
  let scroll = init
  const sizes = {
    rowSizes: { size: 4, length: 5 },
    colSizes: { size: 8, length: 3 },
  } as const
  const format = createContainerStyles(sizes)
  expect(format).toEqual({
    innerStyle: {
      width: '24px',
      height: '20px',
      display: 'grid',
      gridTemplateRows: 'repeat(5, 4px)',
      gridTemplateColumns: 'repeat(3, 8px)',
      gridTemplateAreas: 'none',
    },
    outerStyle: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
      margin: 0,
      padding: 0,
    },
  })
  expect(createItems(sizes, scroll, item)).toEqual([
    item(0, 0),
    item(0, 1),
    item(0, 2),
    item(1, 0),
    item(1, 1),
    item(1, 2),
    item(2, 0),
    item(2, 1),
    item(2, 2),
    item(3, 0),
    item(3, 1),
    item(3, 2),
    item(4, 0),
    item(4, 1),
    item(4, 2),
  ])
  div = {
    scrollTop: 0,
    scrollLeft: 0,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  expect(createItems(sizes, scroll, item)).toEqual([
    item(0, 0),
    item(0, 1),
    item(1, 0),
    item(1, 1),
  ])
  div = {
    scrollTop: 9,
    scrollLeft: 12,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  expect(createItems(sizes, scroll, item)).toEqual([
    item(2, 1),
    item(2, 2),
    item(3, 1),
    item(3, 2),
    item(4, 1),
    item(4, 2),
  ])
  div = {
    scrollTop: 18,
    scrollLeft: 22,
    clientHeight: 2,
    clientWidth: 2,
  }
  onScroll()
  expect(createItems(sizes, scroll, item)).toEqual([item(4, 2)])
  div = {
    scrollTop: 17,
    scrollLeft: 22,
    clientHeight: 2,
    clientWidth: 2,
  }
  onScroll()
  expect(createItems(sizes, scroll, item, 10)).toEqual([
    item(1, 2),
    item(2, 2),
    item(3, 2),
    item(4, 2),
  ])
})
