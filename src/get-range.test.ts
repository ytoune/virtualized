import { getIndex } from './get-range'

const isArray: (arr: unknown) => arr is readonly unknown[] = Array.isArray

describe('getIndex', () => {
  const list: [
    args: Parameters<typeof getIndex>,
    ret: ReturnType<typeof getIndex>,
  ][] = [
    [[{ length: 0, size: 10 }, 10], 0],
    [[{ length: 0, size: 10 }, 10, true], 0],
    [[{ length: 5, size: 10 }, -10], 0],
    [[{ length: 5, size: 10 }, 9], 0],
    [[{ length: 5, size: 10 }, 10], 1],
    [[{ length: 5, size: 10 }, 15], 1],
    [[{ length: 5, size: 10 }, 19], 1],
    [[{ length: 5, size: 10 }, 20], 2],
    [[{ length: 5, size: 10 }, 60], 4],
    [[{ length: 5, size: 10 }, -10, true], 1],
    [[{ length: 5, size: 10 }, 10, true], 1],
    [[{ length: 5, size: 10 }, 11, true], 2],
    [[{ length: 5, size: 10 }, 15, true], 2],
    [[{ length: 5, size: 10 }, 20, true], 2],
    [[{ length: 5, size: 10 }, 21, true], 3],
    [[{ length: 5, size: 10 }, 60, true], 5],
    [[[80, 120, 160, 40, 40, 40], 250], 2],
    [[[80, 120, 160, 40, 40, 40], 250 + 796, true], 6],
  ]
  const make2 = (args: Parameters<typeof getIndex>) => {
    const args2 = args.slice() as typeof args
    const sizes = args[0]
    if (!isArray(sizes)) {
      args2[0] = Array(sizes.length).fill(sizes.size)
      return args2
    }
  }
  for (const [args, ret] of list) {
    it(JSON.stringify(args), () => {
      expect(getIndex(...args)).toEqual(ret)
    })
    const args2 = make2(args)
    if (args2)
      it(JSON.stringify(args2), () => {
        expect(getIndex(...args2)).toEqual(ret)
      })
  }
})
