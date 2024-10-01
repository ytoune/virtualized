import { describe, expect, it } from 'vitest'
import { render } from './render'
import type { Sizes } from './interfaces'
import { isArray } from './utils'

describe('render', () => {
  const list: {
    sizes: Sizes
    sticky: readonly number[]
    offset: number
    pageSize: number
    expected: ReturnType<typeof render>
  }[] = [
    {
      sizes: { size: 25, length: 9 },
      sticky: [],
      offset: 0,
      pageSize: 10,
      expected: {
        rendered: {
          items: [
            [0, 1],
            [1, 2],
          ],
          innerSize: 50,
          gridTemplate: 'repeat(2,25px)',
        },
        keep: [0, 40],
        diff: 0,
      },
    },
    {
      // 表示領域: 190..200, コンテンツ: 0..225 -> 描画範囲: 150..225, (単純描画範囲: 170..220), 継続範囲: 160..225, (単純継続範囲: 180..210)
      sizes: { size: 25, length: 9 },
      sticky: [1],
      offset: 190,
      pageSize: 10,
      expected: {
        rendered: {
          items: [
            [1, 1, true],
            [6, 2],
            [7, 3],
            [8, 4],
          ],
          innerSize: 100,
          gridTemplate: 'repeat(4,25px)',
        },
        keep: [160, 225],
        diff: 125,
      },
    },
    {
      sizes: { size: 10, length: 1000 },
      sticky: [1, 4, 7],
      offset: 5000,
      pageSize: 100,
      expected: {
        rendered: {
          items: [
            [1, 1, true],
            [4, 2, true],
            [7, 3, true],
            ...(function* () {
              for (
                let s: [number, number] = [480, 4], e = 529;
                s[0] <= e;
                ++s[0], ++s[1]
              )
                yield [...s] satisfies [number, number]
            })(),
          ],
          innerSize: 530,
          gridTemplate: 'repeat(53,10px)',
        },
        keep: [4900, 5200],
        diff: 4770,
      },
    },
  ]
  const { stringify: e } = JSON
  for (const { sizes, sticky, offset, pageSize, expected } of list) {
    it(e({ sizes, sticky, offset, pageSize }), () => {
      const arr = sticky
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((q, w) => q - w)
      const set = new Set(arr)
      const totalSize = isArray(sizes)
        ? sizes.reduce((a, v) => a + v, 0)
        : sizes.length * sizes.size
      const res = render(sizes, { arr, set }, offset, pageSize, totalSize)
      expect(res).toEqual(expected)
    })
  }
})
