import { describe, it, expect } from 'vitest'
import type { ScrollProps } from './virtualized'
import { createVirtualized } from './virtualized'
import type { HTMLElement } from './interfaces'

type Bin = 0 | 1
type AreaString = `${number}/${number}/${number}/${number}`
type LineString = `${number},${number},${Bin},${Bin}-${AreaString}`

describe('virtualized', () => {
  it('ok', () => {
    let div = null as HTMLElement | null
    div = null
    let calledProp: ScrollProps[] = []
    const scroll = (p: ScrollProps): void => {
      calledProp.push(p)
    }
    let pinned = 0
    const pin = (): void => {
      ++pinned
    }
    const v = createVirtualized({
      pin,
      divRef: () => div,
      scroll,
      rowSizes: { size: 4, length: 25 }, // total 100
      colSizes: { size: 6, length: 1 }, // total 6
    })
    const pushDiv = (d: HTMLElement, p: ScrollProps | null) => {
      div = d
      calledProp = []
      pinned = 0
      v.onScroll()
      expect(calledProp).toEqual(null !== p ? [p] : [])
      expect(pinned).toBe(1)
    }
    const renderItem =
      (area: (row: number, col: number) => AreaString) =>
      (ir: number, ic: number, sr?: true, sc?: true): LineString =>
        `${ir},${ic},${sr ? 1 : 0},${sc ? 1 : 0}-${area(ir, ic)}`
    pushDiv(
      {
        scrollTop: 0,
        scrollLeft: 0,
        clientHeight: 10,
        clientWidth: 6,
      },
      null,
    )
    let r = v.render()
    expect(r.outerStyle).toEqual({
      width: '100%',
      height: '100%',
      overflow: 'scroll',
      margin: 0,
      padding: 0,
    })
    expect(r.innerStyle).toEqual({
      height: '50px',
      width: '6px',
      display: 'grid',
      gridTemplateRows: '0px repeat(4, 4px)',
      gridTemplateColumns: '0px repeat(1, 6px)',
      gridTemplateAreas: 'none',
    })
    let list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '0,0,0,0-2/2/3/3',
      '1,0,0,0-3/2/4/3',
      '2,0,0,0-4/2/5/3',
      '3,0,0,0-5/2/6/3',
    ])

    pushDiv(
      {
        scrollTop: 10,
        scrollLeft: 0,
        clientHeight: 10,
        clientWidth: 6,
      },
      null,
    )
    r = v.render()
    expect(r.innerStyle).toEqual({
      height: '50px',
      width: '6px',
      display: 'grid',
      gridTemplateRows: '4px repeat(7, 4px)',
      gridTemplateColumns: '0px repeat(1, 6px)',
      gridTemplateAreas: 'none',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '1,0,0,0-2/2/3/3',
      '2,0,0,0-3/2/4/3',
      '3,0,0,0-4/2/5/3',
      '4,0,0,0-5/2/6/3',
      '5,0,0,0-6/2/7/3',
      '6,0,0,0-7/2/8/3',
      '7,0,0,0-8/2/9/3',
    ])

    pushDiv(
      {
        scrollTop: 41,
        scrollLeft: 0,
        clientHeight: 10,
        clientWidth: 6,
      },
      { top: 21 },
    )
    r = v.render()
    expect(r.innerStyle).toEqual({
      height: '50px',
      width: '6px',
      display: 'grid',
      gridTemplateRows: '36px repeat(7, 4px)',
      gridTemplateColumns: '0px repeat(1, 6px)',
      gridTemplateAreas: 'none',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '9,0,0,0-2/2/3/3',
      '10,0,0,0-3/2/4/3',
      '11,0,0,0-4/2/5/3',
      '12,0,0,0-5/2/6/3',
      '13,0,0,0-6/2/7/3',
      '14,0,0,0-7/2/8/3',
      '15,0,0,0-8/2/9/3',
    ])
  })
})
