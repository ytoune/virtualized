import { describe, expect, it } from 'vitest'
import { createController } from './controller'
import type { ScrollContainer, StickyPosition } from './interfaces'

describe('createController', () => {
  // it('hoge', () => {
  //   expect('').toBe('')
  // })

  /**

pagesize=10 // ビューポートの大きさ
origin=0 // 現在描画している場所の起点
current=0 // 仮想画面でのスクロール量

current が変化して origin との差が pagesize より大きくなったら
origin に current を代入して再描画

   */

  const gridRange = (start: number, end: number, grid: number) => {
    const range: [index: number, gridConst: number][] = []
    for (let i = start, g = grid; i < end; ++i, ++g) range.push([i, g])
    return range
  }

  // simple test cases
  it.each<{
    t: string
    args: {
      offset: number
      pageSize: number
      sizes: { size: number; length: number }
      sticky: StickyPosition | null
    }
    state: {
      offset: number
      pageSize: number
      realOffset: number
    }
    render: {
      range: [index: number, gridConst: number][]
      innerSize: number
      gridTemplate: string
    }
    scroll?: {
      container: ScrollContainer
      state: {
        offset: number
        pageSize: number
        realOffset: number
      }
      render: {
        range: [index: number, gridConst: number][]
        innerSize: number
        gridTemplate: string
      }
    }[]
  }>([
    {
      t: 'ok',
      args: {
        offset: 0,
        pageSize: 20,
        sizes: { size: 10, length: 11 },
        sticky: null,
      },
      state: {
        offset: 0,
        pageSize: 20,
        realOffset: 0,
      },
      render: {
        // 描画する item の範囲: 0 <= i < 6
        range: [
          [0, 2],
          [1, 3],
          [2, 4],
          [3, 5],
          [4, 6],
          [5, 7],
        ],
        // 裏ではスクロールを考慮してビューポートの５倍までの幅を持たせる
        innerSize: 60,
        gridTemplate: '0px repeat(6, 10px)',
      },
    },
  ])('$t $args', ({ args, state, render, scroll }) => {
    let container = null as null | ScrollContainer
    const controller = createController({
      ref: () => container,
      sizes: args.sizes,
      sticky: args.sticky,
      initOffset: () => args.offset,
      defaultPageSize: () => args.pageSize,
    })
    expect(controller.state()).toEqual(state)
    expect(controller.render()).toEqual(render)
    if (scroll)
      for (const s of scroll) {
        container = s.container
        controller.recalc()
        expect(controller.state()).toEqual(s.state)
        expect(controller.render()).toEqual(s.render)
      }
  })

  it('固定がない場合', () => {
    let container = null as null | ScrollContainer
    const ref = () => container
    const sizes = { length: 11, size: 10 } as const
    const sticky = null
    const initOffset = () => 0
    const defaultPageSize = () => 20
    container = null
    const controller = createController({
      ref,
      sizes,
      sticky,
      initOffset,
      defaultPageSize,
    })
    expect(controller.state()).toEqual({
      offset: 0,
      pageSize: 20,
      realOffset: 0,
    })
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60
    expect(controller.render()).toEqual({
      // 描画する item の範囲: 0 <= i < 6
      range: gridRange(0, 6, 2),
      // 裏ではスクロールを考慮してビューポートの５倍までの幅を持たせる
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
    })
    // 少しだけスクロールする
    container = { offset: 15, pageSize: 20 }
    controller.recalc()
    expect(controller.state()).toEqual({
      offset: 15,
      pageSize: 20,
      realOffset: 15,
    })
    // 閾値を超えるまでは描画範囲はそのまま
    expect(controller.render()).toEqual({
      range: gridRange(0, 6, 2),
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
    })
    // スクロール量がビューポートサイズを超えた
    container = { offset: 25, pageSize: 20 }
    controller.recalc()
    expect(controller.state()).toEqual({
      offset: 25,
      pageSize: 20,
      realOffset: 25,
    })
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60    80
    expect(controller.render()).toEqual({
      range: gridRange(0, 9, 2),
      innerSize: 85,
      gridTemplate: '0px repeat(9, 10px)',
    })
  })

  it('固定が上にある場合', () => {
    let container = null as null | ScrollContainer
    const ref = () => container
    const sizes = { length: 21, size: 10 } as const
    const sticky = [1] // 2 行目は固定されていて常に表示
    const initOffset = () => 0
    const defaultPageSize = () => 20
    container = null
    const controller = createController({
      ref,
      sizes,
      sticky,
      initOffset,
      defaultPageSize,
    })
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60
    expect(controller.state()).toEqual({
      offset: 0,
      pageSize: 20,
      realOffset: 0,
    })
    expect(controller.render()).toEqual({
      range: gridRange(0, 6, 2),
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
    })
    // 少しだけスクロールする
    container = { offset: 15, pageSize: 20 }
    controller.recalc()
    expect(controller.state()).toEqual({
      offset: 15,
      pageSize: 20,
      realOffset: 15,
    })
    // 閾値を超えるまでは描画範囲はそのまま
    expect(controller.render()).toEqual({
      range: gridRange(0, 6, 2),
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
    })
    // スクロール量がビューポートサイズを超えた
    container = { offset: 25, pageSize: 20 }
    controller.recalc()
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60    80
    /**
     * @todo template をシンプルにするために発行される offset を pageSize に合わせる必要がある…
     */
    expect(controller.state()).toEqual({
      offset: 25,
      pageSize: 20,
      realOffset: 25,
    })
    expect(controller.render()).toEqual({
      range: gridRange(0, 9, 2),
      innerSize: 85,
      gridTemplate: '0px repeat(9, 10px)',
    })
    // 大きくスクロール
    container = { offset: 70, pageSize: 20 }
    controller.recalc()
    // 0  1  2  3  4  5  6  7  8  9 10 11 ..
    //    sss   0    20    40    60    80
    expect(controller.state()).toEqual({
      offset: 70,
      pageSize: 20,
      realOffset: 50, // 固定分を含めて 50px
    })
    expect(controller.render()).toEqual({
      range: gridRange(3, 13, 2),
      innerSize: 110,
      gridTemplate: '0px repeat(10, 10px)',
    })
  })
})
