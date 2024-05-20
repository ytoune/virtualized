import { describe, expect, it } from 'vitest'
import { createController } from './controller'
import type { ScrollContainer } from './interfaces'

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
      range: [0, 6],
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
      gridConst: 2,
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
      range: [0, 6],
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
      gridConst: 2,
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
      range: [0, 9],
      innerSize: 85,
      gridTemplate: '0px repeat(9, 10px)',
      gridConst: 2,
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
      range: [0, 6],
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
      gridConst: 2,
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
      range: [0, 6],
      innerSize: 60,
      gridTemplate: '0px repeat(6, 10px)',
      gridConst: 2,
    })
    // スクロール量がビューポートサイズを超えた
    container = { offset: 25, pageSize: 20 }
    controller.recalc()
    // 0  1  2  3  4  5  6  7  8  9 ..
    //      20    40    60    80
    expect(controller.state()).toEqual({
      offset: 25,
      pageSize: 20,
      realOffset: 25,
    })
    expect(controller.render()).toEqual({
      range: [0, 9],
      innerSize: 85,
      gridTemplate: '0px repeat(9, 10px)',
      gridConst: 2,
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
  })
})
