import { it, expect } from 'vitest'

import type { HTMLElement } from './interfaces'
import { createContainerStyles, createItems, withScroll } from './index'
import type { RenderItem, Scroll } from './index'

it('main', () => {
  const item = ((r: number, c: number, rs?: true, cs?: true) =>
    JSON.stringify([r, c, rs, cs])) satisfies RenderItem<string>
  const isItems = (u: unknown) => {
    const _throw = () => {
      throw new Error(`${JSON.stringify(u)} is not items`)
    }
    if (!Array.isArray(u)) return _throw()
    for (const v of u) {
      if ('string' !== typeof v) return _throw()
      if (!/^\[\d,\d,(true|null),(true|null)\]$/.test(v)) return _throw()
    }
  }
  const { init, onScroll } = withScroll({
    divRef: () => div,
    set: s => {
      scroll = s(scroll)
    },
  })
  let div: HTMLElement | null = null
  let scroll: Scroll = init
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
      gridTemplate: 'repeat(5, 4px)/repeat(3, 8px)',
      // gridTemplateRows: 'repeat(5, 4px)',
      // gridTemplateColumns: 'repeat(3, 8px)',
      // gridTemplateAreas: 'none',
    },
    outerStyle: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
      margin: 0,
      padding: 0,
    },
  })
  isItems(createItems(sizes, scroll, item))
  div = {
    scrollTop: 0,
    scrollLeft: 0,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  isItems(createItems(sizes, scroll, item))
  div = {
    scrollTop: 9,
    scrollLeft: 12,
    clientHeight: 5,
    clientWidth: 10,
  }
  onScroll()
  isItems(createItems(sizes, scroll, item))
  div = {
    scrollTop: 18,
    scrollLeft: 22,
    clientHeight: 2,
    clientWidth: 2,
  }
  onScroll()
  isItems(createItems(sizes, scroll, item))
  div = {
    scrollTop: 17,
    scrollLeft: 22,
    clientHeight: 2,
    clientWidth: 2,
  }
  onScroll()
  isItems(createItems(sizes, scroll, item))
})
