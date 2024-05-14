import { describe, it, expect } from 'vitest'
import { getOffsetAndSize } from './next-offset-2'

const make =
  <R, A extends unknown[]>(_f: (...a: A) => R) =>
  () => ({
    title: (t: string) => ({
      exp: (ret: R, ...args: A) => ({ t, ret, args }),
      ret: (ret: R) => ({ args: (...args: A) => ({ t, ret, args }) }),
    }),
  })

describe('getOffsetAndSize', () => {
  const makeCase = make(getOffsetAndSize)
  it.each<{
    ret: ReturnType<typeof getOffsetAndSize>
    args: Parameters<typeof getOffsetAndSize>
  }>([
    makeCase().title('上端').exp([0, 60], 0, 20, 110),
    makeCase().title('途中').exp([15, 75], 15, 20, 110),
    makeCase().title('途中').exp([25, 85], 25, 20, 110),
    makeCase().title('途中').exp([40, 100], 45, 20, 110),
    makeCase().title('途中').exp([40, 95], 55, 20, 110),
    makeCase().title('下端').exp([40, 60], 90, 20, 110),

    makeCase().title('少ない行数').exp([0, 20], -5, 20, 20),
    makeCase().title('少ない行数').exp([0, 20], 0, 20, 20),
    makeCase().title('少ない行数').exp([0, 20], 5, 20, 20),
    makeCase().title('少ない行数').exp([0, 20], 10, 20, 20),

    makeCase().title('特に少ない行数').exp([0, 10], 10, 20, 10),
  ])('$args => $ret $t', ({ ret, args }) =>
    expect(getOffsetAndSize(...args)).toEqual(ret),
  )
})
