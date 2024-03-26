import { describe, it, expect } from 'vitest'
import { createItems } from './items'
import type { RenderItem, Sizes } from './interfaces'

const item = ((r: number, c: number) =>
  JSON.stringify([r, c])) satisfies RenderItem<string>

// const dump = (items: readonly string[]) => {
//   const code = (s: string) => {
//     const { stringify: e, parse: q } = JSON
//     const [r, c, g, t, l] = q(s)
//     return `item(${r},${c},{gridArea:${
//       e(g) + (t ? `,top:${e(t)}` : '') + (l ? `,left:${e(l)}` : '')
//     }}),`
//   }
//   console.log(items.map(code).join(''))
// }

describe('createItems', () => {
  const e = (o: unknown) => JSON.stringify(o).replace(/"/giu, '')
  const list: {
    title: string
    args: Parameters<typeof createItems<string>>
    ret: ReturnType<typeof createItems<string>>
  }[] = [
    {
      title: 'ok',
      args: [
        { rowSizes: { size: 4, length: 15 }, colSizes: { size: 8, length: 5 } },
        { top: { offset: 0, pageSize: 5 }, left: { offset: 0, pageSize: 10 } },
        item,
      ],
      ret: [item(0, 0), item(0, 1), item(1, 0), item(1, 1)],
    },
  ]
  for (const { title, args, ret } of list) {
    it(title, () => {
      expect(createItems(...args)).toEqual(ret)
    })
  }
  const list2: {
    title?: string
    sizes: Sizes
    offset: number
    clientSize: number
    ret: [start: number, end: number]
  }[] = [
    {
      sizes: { size: 4, length: 15 },
      offset: 0,
      clientSize: 4,
      ret: [0, 2],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 0,
      clientSize: 5,
      ret: [0, 2],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 0,
      clientSize: 9,
      ret: [0, 4],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 0,
      clientSize: 60,
      ret: [0, 15],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 1,
      clientSize: 4,
      ret: [0, 2],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 10,
      clientSize: 5,
      ret: [1, 5],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 10,
      clientSize: 50,
      ret: [0, 15],
    },
    {
      sizes: { size: 4, length: 15 },
      offset: 10,
      clientSize: 10,
      ret: [1, 7],
    },
  ]
  for (const {
    title,
    sizes,
    offset,
    clientSize,
    ret: [start, end],
  } of list2) {
    it(`${title ? `${title}: ` : ''}${e({ sizes, offset, clientSize })}`, () => {
      const ret: string[] = []
      for (let i = start; i < end; ++i) ret.push(item(i, 0))
      expect(
        createItems(
          { rowSizes: sizes, colSizes: { size: 24, length: 1 } },
          {
            top: { offset, pageSize: clientSize },
            left: { offset: 0, pageSize: 24 },
          },
          item,
        ),
      ).toEqual(ret)
    })
  }
})
