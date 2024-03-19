import { describe, it, expect } from 'vitest'
import { getNextOffset } from './next-offset'

describe('getNextOffset', () => {
  it.each<{
    expectedRealOffset: number
    totalSize: number
    pageSize: number
    offset: number
  }>([
    { expectedRealOffset: 0, totalSize: 100, pageSize: 10, offset: 0 },
    { expectedRealOffset: 0, totalSize: 100, pageSize: 100, offset: 0 },
    { expectedRealOffset: 0, totalSize: 100, pageSize: 20, offset: 0 },
    { expectedRealOffset: 20, totalSize: 100, pageSize: 20, offset: 20 },
    { expectedRealOffset: 80, totalSize: 100, pageSize: 20, offset: 80 },
    { expectedRealOffset: 25, totalSize: 100, pageSize: 10, offset: 45 },
    { expectedRealOffset: 15, totalSize: 100, pageSize: 10, offset: 15 },
    { expectedRealOffset: 20, totalSize: 100, pageSize: 10, offset: 20 },
    { expectedRealOffset: 29, totalSize: 100, pageSize: 10, offset: 29 },
    { expectedRealOffset: 20, totalSize: 100, pageSize: 10, offset: 30 },
    { expectedRealOffset: 20, totalSize: 100, pageSize: 10, offset: 40 },
    { expectedRealOffset: 20, totalSize: 100, pageSize: 10, offset: 70 },
    { expectedRealOffset: 30, totalSize: 100, pageSize: 10, offset: 80 },
    { expectedRealOffset: 40, totalSize: 100, pageSize: 10, offset: 90 },
  ])(
    '[totalSize:$totalSize,pageSize:$pageSize,offset:$offset] => [$expectedRealOffset,$offset]',
    ({ expectedRealOffset, totalSize, pageSize, offset }) =>
      expect(
        getNextOffset(totalSize, pageSize, pageSize, offset, offset, offset),
      ).toEqual([expectedRealOffset, offset]),
  )
  it.each<{
    ret: ReturnType<typeof getNextOffset>
    args: Parameters<typeof getNextOffset>
  }>([
    { ret: [0, 0], args: [100, 20, 20, 0, 0, 0] },
    { ret: [0, 0], args: [100, 40, 20, 0, 0, 0] },
    { ret: [60, 60], args: [100, 40, 20, 80, 80, 80] },
    { ret: [60, 60], args: [100, 40, 20, 60, 80, 80] },
    { ret: [15, 90], args: [100, 5, 10, 15, 40, 90] },
    { ret: [0, 0], args: [280, 750, 750, 0, 0, 0] },
  ])('$args => $ret, $t', ({ ret, args }) =>
    expect(getNextOffset(...args)).toEqual(ret),
  )
})
