import { describe, it, expect } from 'vitest'
import type { ScrollProps } from './virtualized'
import { createVirtualized } from './virtualized'
import type { HTMLElement } from './interfaces'

type Bin = 0 | 1
type AreaString = `${number}/${number}/${number}/${number}`
type LineString = `${number},${number},${Bin},${Bin}-${AreaString}`

describe('virtualized', () => {
  it('ok', async () => {
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
    const pushDiv = async (d: HTMLElement, p: ScrollProps | null) => {
      div = d
      calledProp = []
      pinned = 0
      v.onScroll()
      await new Promise<void>(r => setTimeout(r, 1))
      expect(calledProp).toEqual(null !== p ? [p] : [])
      expect(pinned).toBe(1)
    }
    const renderItem =
      (area: (row: number, col: number) => AreaString) =>
      (ir: number, ic: number, sr?: true, sc?: true): LineString =>
        `${ir},${ic},${sr ? 1 : 0},${sc ? 1 : 0}-${area(ir, ic)}`
    await pushDiv(
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
      gridTemplate: '0px repeat(5, 4px)/0px repeat(1, 6px)',
    })
    let list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '0,0,0,0-2/2/3/3',
      '1,0,0,0-3/2/4/3',
      '2,0,0,0-4/2/5/3',
      '3,0,0,0-5/2/6/3',
      '4,0,0,0-6/2/7/3',
    ])

    await pushDiv(
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
      gridTemplate: '0px repeat(8, 4px)/0px repeat(1, 6px)',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '0,0,0,0-2/2/3/3',
      '1,0,0,0-3/2/4/3',
      '2,0,0,0-4/2/5/3',
      '3,0,0,0-5/2/6/3',
      '4,0,0,0-6/2/7/3',
      '5,0,0,0-7/2/8/3',
      '6,0,0,0-8/2/9/3',
      '7,0,0,0-9/2/10/3',
    ])

    await pushDiv(
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
      gridTemplate: '8px repeat(9, 4px)/0px repeat(1, 6px)',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '7,0,0,0-2/2/3/3',
      '8,0,0,0-3/2/4/3',
      '9,0,0,0-4/2/5/3',
      '10,0,0,0-5/2/6/3',
      '11,0,0,0-6/2/7/3',
      '12,0,0,0-7/2/8/3',
      '13,0,0,0-8/2/9/3',
      '14,0,0,0-9/2/10/3',
      '15,0,0,0-10/2/11/3',
    ])
  })
})
