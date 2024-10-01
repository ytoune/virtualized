import { describe, expect, it } from 'vitest'
import { getKeep } from './get-keep'

describe('getKeep', () => {
  const list: {
    pageSize: number
    totalSize: number
    startVPos: number
    endVPos: number
    keep: readonly [start: number, end: number]
  }[] = [
    // 表示領域: 0..10, コンテンツ: 0..225 -> 描画範囲: 0..50, (単純描画範囲: 0..30), 継続範囲: 0..40, (単純継続範囲: 0..20)
    {
      pageSize: 10,
      totalSize: 225,
      startVPos: 0,
      endVPos: 50,
      keep: [0, 40],
    },
    // 表示領域: 35..45, コンテンツ: 0..225 -> 描画範囲: 0..75, (単純描画範囲: 15..65), 継続範囲: 10..65, (単純継続範囲: 25..55)
    {
      pageSize: 10,
      totalSize: 225,
      startVPos: 0,
      endVPos: 75,
      keep: [0, 65],
    },
    {
      pageSize: 10,
      totalSize: 225,
      startVPos: 1,
      endVPos: 55,
      keep: [11, 45],
    },
    // 表示領域: 50..60, コンテンツ: 0..225 -> 描画範囲: 25..100, (単純描画範囲: 30..80), 継続範囲: 35..90, (単純継続範囲: 40..70)
    {
      pageSize: 10,
      totalSize: 225,
      startVPos: 25,
      endVPos: 100,
      keep: [35, 90],
    },
    {
      pageSize: 10,
      totalSize: 50,
      startVPos: 0,
      endVPos: 50,
      keep: [0, 50],
    },
    {
      pageSize: 10,
      totalSize: 60,
      startVPos: 0,
      endVPos: 60,
      keep: [0, 60],
    },
    {
      pageSize: 10,
      totalSize: 70,
      startVPos: 0,
      endVPos: 60,
      keep: [0, 50],
    },
    {
      pageSize: 100,
      totalSize: 50,
      startVPos: 0,
      endVPos: 50,
      keep: [0, 50],
    },
  ]
  const { stringify: e } = JSON
  for (const { pageSize, totalSize, startVPos, endVPos, keep } of list)
    it(`getKeep(${e([pageSize, totalSize, startVPos, endVPos])})=>${e(keep)}`, () => {
      expect(getKeep(pageSize, totalSize, startVPos, endVPos)).toEqual(keep)
    })
})
