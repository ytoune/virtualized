import { describe, expect, it } from 'vitest'
import type { ScrollContainer, StickyPosition } from '../interfaces'
import { createController } from './controller'

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

  const gridItems = (start: number, end: number, grid: number) => {
    const items: [index: number, gridConst: number][] = []
    for (let i = start, g = grid; i < end; ++i, ++g) items.push([i, g])
    return items
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
      items: [index: number, gridConst: number][]
      innerSize: number
      gridTemplate: string
    }
    scroll?: {
      container: ScrollContainer
      recalc: number | boolean
      state: {
        offset: number
        pageSize: number
        realOffset: number
      }
      render: {
        items: [index: number, gridConst: number][]
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
        items: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
        ],
        // 裏ではスクロールを考慮してビューポートの５倍までの幅を持たせる
        innerSize: 60,
        gridTemplate: 'repeat(6,10px)',
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
        expect(controller.recalc()).toBe(s.recalc)
        expect(controller.state()).toEqual(s.state)
        expect(controller.render()).toEqual(s.render)
      }
  })

  it('固定がない場合', () => {
    let container = null as null | ScrollContainer
    container = null
    const controller = createController({
      ref: () => container,
      sizes: { length: 11, size: 10 },
      sticky: null,
      initOffset: () => 0,
      defaultPageSize: () => 20,
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
      items: gridItems(0, 6, 1),
      // 裏ではスクロールを考慮してビューポートの５倍までの幅を持たせる
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
    // 少しだけスクロールする
    container = { offset: 15, pageSize: 20 }
    expect(controller.recalc()).toBe(false)
    expect(controller.state()).toEqual({
      offset: 15,
      pageSize: 20,
      realOffset: 15,
    })
    // 閾値を超えるまでは描画範囲はそのまま
    expect(controller.render()).toEqual({
      items: gridItems(0, 6, 1),
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
    // スクロール量がビューポートサイズを超えた
    container = { offset: 25, pageSize: 20 }
    expect(controller.recalc()).toBe(25)
    expect(controller.state()).toEqual({
      offset: 25,
      pageSize: 20,
      realOffset: 25,
    })
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60    80
    expect(controller.render()).toEqual({
      items: gridItems(0, 9, 1),
      innerSize: 90,
      gridTemplate: 'repeat(9,10px)',
    })
    container = { offset: 90, pageSize: 20 }
    expect(controller.recalc()).toBe(40)
    expect(controller.state()).toEqual({
      offset: 90,
      pageSize: 20,
      realOffset: 40,
    })
    // 0  1  2  3  4  5  6  7  8  9  0  1  b
    //                  60    80    00    20
    expect(controller.render()).toEqual({
      items: gridItems(5, 11, 1),
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
  })

  it('固定が上にある場合', () => {
    let container = null as null | ScrollContainer
    container = null
    const controller = createController({
      ref: () => container,
      sizes: { length: 21, size: 10 },
      sticky: [1], // 2 行目は固定されていて常に表示
      initOffset: () => 0,
      defaultPageSize: () => 20,
    })
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60
    expect(controller.state()).toEqual({
      offset: 0,
      pageSize: 20,
      realOffset: 0,
    })
    expect(controller.render()).toEqual({
      items: gridItems(0, 6, 1),
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
    // 少しだけスクロールする
    container = { offset: 15, pageSize: 20 }
    expect(controller.recalc()).toBe(false)
    expect(controller.state()).toEqual({
      offset: 15,
      pageSize: 20,
      realOffset: 15,
    })
    // 閾値を超えるまでは描画範囲はそのまま
    expect(controller.render()).toEqual({
      items: gridItems(0, 6, 1),
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
    // スクロール量がビューポートサイズを超えた
    container = { offset: 25, pageSize: 20 }
    expect(controller.recalc()).toBe(25)
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60    80
    expect(controller.state()).toEqual({
      offset: 25,
      pageSize: 20,
      realOffset: 25,
    })
    expect(controller.render()).toEqual({
      items: gridItems(0, 9, 1),
      innerSize: 90,
      gridTemplate: 'repeat(9,10px)',
    })
    // 大きくスクロール
    container = { offset: 70, pageSize: 20 }
    expect(controller.recalc()).toBe(50)
    // 0  1  2  3  4  5  6  7  8  9 10 11 ..
    //    sss   0    20    40    60    80
    expect(controller.state()).toEqual({
      offset: 70,
      pageSize: 20,
      realOffset: 50, // 固定分を含めて 50px
    })
    expect(controller.render()).toEqual({
      items: [[1, 1, true], ...gridItems(3, 13, 2)],
      innerSize: 110,
      gridTemplate: 'repeat(11,10px)',
    })
  })

  it('force scroll', () => {
    let container = null as null | ScrollContainer
    container = null
    const controller = createController({
      ref: () => container,
      sizes: { length: 21, size: 10 } as const,
      sticky: [1], // 2 行目は固定されていて常に表示
      initOffset: () => 0,
      defaultPageSize: () => 20,
    })
    expect(controller.state()).toEqual({
      offset: 0,
      pageSize: 20,
      realOffset: 0,
    })
    expect(controller.render()).toEqual({
      items: gridItems(0, 6, 1),
      innerSize: 60,
      gridTemplate: 'repeat(6,10px)',
    })
    // 少しだけスクロールする
    container = { offset: 15, pageSize: 20 }
    expect(controller.recalc()).toBe(false)
    expect(controller.state()).toEqual({
      offset: 15,
      pageSize: 20,
      realOffset: 15,
    })
    // 強制移動
    expect(controller.recalc({ offset: 0 })).toBe(0)
    expect(controller.state()).toEqual({
      offset: 0,
      pageSize: 20,
      realOffset: 0,
    })
    // 大きく強制移動
    expect(controller.recalc({ offset: 70 })).toBe(50)
    // 0  1  2  3  4  5  6  7  8  9 10 11 ..
    //    sss   0    20    40    60    80
    expect(controller.state()).toEqual({
      offset: 70,
      pageSize: 20,
      realOffset: 50, // 固定分を含めて 50px
    })
    expect(controller.render()).toEqual({
      items: [[1, 1, true], ...gridItems(3, 13, 2)],
      innerSize: 110,
      gridTemplate: 'repeat(11,10px)',
    })
  })
})
