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
      height: '32px',
      width: '6px',
      display: 'grid',
      gridTemplate: 'repeat(8,4px)/repeat(1,6px)',
    })
    let list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '0,0,0,0-1/1/2/2',
      '1,0,0,0-2/1/3/2',
      '2,0,0,0-3/1/4/2',
      '3,0,0,0-4/1/5/2',
      '4,0,0,0-5/1/6/2',
      '5,0,0,0-6/1/7/2',
      '6,0,0,0-7/1/8/2',
      '7,0,0,0-8/1/9/2',
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
      height: '32px',
      width: '6px',
      display: 'grid',
      gridTemplate: 'repeat(8,4px)/repeat(1,6px)',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '0,0,0,0-1/1/2/2',
      '1,0,0,0-2/1/3/2',
      '2,0,0,0-3/1/4/2',
      '3,0,0,0-4/1/5/2',
      '4,0,0,0-5/1/6/2',
      '5,0,0,0-6/1/7/2',
      '6,0,0,0-7/1/8/2',
      '7,0,0,0-8/1/9/2',
    ])

    await pushDiv(
      {
        scrollTop: 41,
        scrollLeft: 0,
        clientHeight: 10,
        clientWidth: 6,
      },
      { top: 21, left: 0 },
    )
    r = v.render()
    expect(r.innerStyle).toEqual({
      height: '52px',
      width: '6px',
      display: 'grid',
      gridTemplate: 'repeat(13,4px)/repeat(1,6px)',
    })
    list = r.items(renderItem(r.getGridArea))
    expect(list).toEqual([
      '5,0,0,0-1/1/2/2',
      '6,0,0,0-2/1/3/2',
      '7,0,0,0-3/1/4/2',
      '8,0,0,0-4/1/5/2',
      '9,0,0,0-5/1/6/2',
      '10,0,0,0-6/1/7/2',
      '11,0,0,0-7/1/8/2',
      '12,0,0,0-8/1/9/2',
      '13,0,0,0-9/1/10/2',
      '14,0,0,0-10/1/11/2',
      '15,0,0,0-11/1/12/2',
      '16,0,0,0-12/1/13/2',
      '17,0,0,0-13/1/14/2',
    ])
  })
})
