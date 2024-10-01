/**
 * - 描画範囲: 実際に html 要素に描画を行う元のコンテンツ全体における範囲
 * - 単純描画範囲: 各要素の大きさを無視して表示領域から計算した単純な描画範囲
 * - 継続範囲: この範囲内に表示領域が収まっている間は再描画を行わない
 *
 * - 表示領域: 0..10, コンテンツ: (25px \* 9) -> 描画範囲: 0..50, (単純描画範囲: 0..30), 継続範囲: 0..40, (単純継続範囲: 0..20)
 * - 表示領域: 35..45, コンテンツ: (25px \* 9) -> 描画範囲: 0..75, (単純描画範囲: 15..65), 継続範囲: 10..65, (単純継続範囲: 25..55)
 * - 表示領域: 50..60, コンテンツ: (25px \* 9) -> 描画範囲: 25..100, (単純描画範囲: 30..80), 継続範囲: 35..90, (単純継続範囲: 40..70)
 */

import { describe, expect, it } from 'vitest'
import type { Sizes } from './interfaces'
import { getRange } from './get-range'

describe('getRange', () => {
  const t = (
    p: `表示領域: ${number}..${number}, コンテンツ: (${number}px * ${number}) -> 描画範囲: ${number}..${number}, (単純描画範囲: ${number}..${number})`,
  ) => {
    const m = p.match(/\d+/giu)
    if (!m) throw new Error('unknown error.')
    const m2 = m.slice()
    let i = 0
    const shift = () => Number(m2[i++]!)
    const viewport = [shift(), shift()] as const
    const sizes = { size: shift(), length: shift() } as const
    const rangePx = [shift(), shift()] as const
    const simpleRangePx = [shift(), shift()] as const
    const offset = viewport[0]
    const pageSize = viewport[1] - viewport[0]
    const overscanSize = pageSize * 2
    let start = 0
    let end = 0
    for (let i = 0, tmp = 0; i < sizes.length; ++i, tmp += sizes.size) {
      if (tmp < rangePx[0]) ++start
      if (tmp < rangePx[1]) ++end
    }
    const range = [start, end] as const
    const title = `表示領域: ${viewport[0]}..${viewport[1]}, コンテンツ: (${sizes.size}px * ${sizes.length}) -> 描画範囲: ${rangePx[0]}..${rangePx[1]}, (idx: ${start}..${end}), (単純描画範囲: ${simpleRangePx[0]}..${simpleRangePx[1]})`
    return {
      title,
      sizes,
      offset,
      pageSize,
      overscanSize,
      range,
      simpleRangePx,
    } as const
  }
  const l = (...ls: readonly Parameters<typeof t>[0][]) => ls.map(t)
  const list: Readonly<{
    title: string
    sizes: Sizes
    offset: number
    pageSize: number
    overscanSize: number
    range: readonly [start: number, end: number]
    simpleRangePx?: readonly [start: number, end: number]
  }>[] = [
    ...l(
      '表示領域: 0..10, コンテンツ: (25px * 9) -> 描画範囲: 0..50, (単純描画範囲: 0..30)',
      '表示領域: 35..45, コンテンツ: (25px * 9) -> 描画範囲: 0..75, (単純描画範囲: 15..65)',
      '表示領域: 50..60, コンテンツ: (25px * 9) -> 描画範囲: 25..100, (単純描画範囲: 30..80)',
    ),
  ]
  for (const {
    title,
    sizes,
    offset,
    pageSize,
    overscanSize,
    range,
    simpleRangePx,
  } of list) {
    it(title, () => {
      expect(getRange(sizes, offset, pageSize, overscanSize)).toEqual(range)
      if (simpleRangePx) {
        const r2 = [
          Math.max(0, offset - overscanSize),
          offset + pageSize + overscanSize,
        ] as const
        expect(simpleRangePx).toEqual(r2)
      }
    })
  }
})
