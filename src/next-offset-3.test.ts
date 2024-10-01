import { describe, it, expect } from 'vitest'
import { getOffsetAndSize } from './next-offset-3'
import type { StickyPosition } from './interfaces'

type Range = readonly [start: number, end: number]

const make =
  <
    R = readonly [origin: number, innerSize: number, range: Range],
    A extends readonly unknown[] = readonly [
      offset: number,
      pageSize: number,
      totalSize: number,
      // sizes: Sizes,
      sticky: StickyPosition | null,
    ],
  >() =>
  () => ({
    title: (t: string) => ({
      exp: (ret: R, ...args: A) => ({ t, ret, args }),
      ret: (ret: R) => ({ args: (...args: A) => ({ t, ret, args }) }),
    }),
  })

describe('getOffsetAndSize', () => {
  const makeCase = make()
  const sizes = { size: 10, length: 11 } as const
  it.each<{
    ret: readonly [origin: number, innerSize: number, range: Range]
    args: readonly [
      offset: number, // 現在の表示位置
      pageSize: number, // ビューポートの大きさ
      totalSize: number, // コンテンツ全体の大きさ
      // sizes: Sizes,
      sticky: StickyPosition | null,
    ]
    t: string
  }>([
    // スクロール位置が上端にある場合。
    // コンテンツの最上部が表示される必要がある。
    makeCase()
      .title('上端')
      .exp([0, 60, [0, 6]], 0, 20, 110, null),
    // 上端から少しスクロールした状態
    makeCase()
      .title('途中')
      .exp([15, 75, [0, 8]], 15, 20, 110, null),
    // .exp([15, 75, [0, 6]], 15, 20, 110, null),
    // 新しい origin が大きくずれるなら更新？

    // makeCase().title('途中').exp([25, 85], 25, 20, 110, null),
    // makeCase().title('途中').exp([40, 100], 45, 20, 110, null),
    // makeCase().title('途中').exp([40, 95], 55, 20, 110, null),
    // makeCase().title('下端').exp([40, 60], 90, 20, 110, null),

    // makeCase().title('少ない行数').exp([0, 20], -5, 20, 20, null),
    // makeCase().title('少ない行数').exp([0, 20], 0, 20, 20, null),
    // makeCase().title('少ない行数').exp([0, 20], 5, 20, 20, null),
    // makeCase().title('少ない行数').exp([0, 20], 10, 20, 20, null),

    // makeCase().title('特に少ない行数').exp([0, 10], 10, 20, 10, null),
  ])('$args => $ret $t', ({ ret, args }) => {
    const [offset, pageSize, totalSize, sticky] = args
    const res = getOffsetAndSize(offset, pageSize, totalSize, sizes, sticky)
    expect(res).toEqual(ret)
  })
})
