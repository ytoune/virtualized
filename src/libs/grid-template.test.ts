import { describe, it, expect } from 'vitest'
import { getTemplate } from './grid-template'

const make =
  <R, A extends unknown[]>(_f: (...a: A) => R) =>
  () => ({
    title: (t: string) => ({
      exp: (ret: R, ...args: A) => ({ t, ret, args }),
      ret: (ret: R) => ({ args: (...args: A) => ({ t, ret, args }) }),
    }),
  })

describe('getTemplate', () => {
  const makeCase = make(getTemplate)
  const sizes = { length: 11, size: 10 } as const
  it.each<{
    ret: ReturnType<typeof getTemplate>
    args: Parameters<typeof getTemplate>
  }>([
    makeCase().title('ok').exp('0px repeat(6, 10px)', 0, sizes, [0, 6], null),
  ])('$args => $ret $t', ({ ret, args }) =>
    expect(getTemplate(...args)).toEqual(ret),
  )
})
