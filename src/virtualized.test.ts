import { describe, it, expect } from 'vitest'
import type { ScrollProps } from './virtualized'
import { createVirtualized } from './virtualized'
import type { HTMLElement } from './interfaces'

describe('virtualized', () => {
  it('ok', () => {
    let div = null as HTMLElement | null
    div = null
    const scroll = (p: ScrollProps): void => {
      p
      // window.scroll(p)
    }
    const pin = (): void => {
      // pass
    }
    const v = createVirtualized({
      pin,
      divRef: () => div,
      scroll,
      rowSizes: { size: 4, length: 25 }, // total 100
      colSizes: { size: 4, length: 1 }, // total 4
    })
    const pushDiv = (d: HTMLElement) => {
      div = d
      v.onScroll()
    }
    pushDiv({
      scrollTop: 0,
      scrollLeft: 0,
      clientHeight: 10,
      clientWidth: 4,
    })
    const r = v.render()
    expect(r.outerStyle).toEqual({
      width: '100%',
      height: '100%',
      overflow: 'scroll',
      margin: 0,
      padding: 0,
    })
    // expect()
  })
})
