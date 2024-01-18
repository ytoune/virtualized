import { createFormat } from './format'
import type { CellStyle } from './interfaces'
import { createItems } from './items'

const item = (r: number, c: number, s: CellStyle): string =>
  JSON.stringify([r, c, s.gridArea, s.top, s.left])

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
  const scroll = {
    top: 0,
    left: 0,
    clientHeight: 15,
    clientWidth: 10,
    topDirection: false,
    leftDirection: false,
  }
  const list: {
    title: string
    args: Parameters<typeof createItems<string>>
    ret: ReturnType<typeof createItems<string>>
  }[] = [
    {
      title: 'ok',
      args: [
        createFormat({
          rowSizes: { size: 4, length: 15 },
          colSizes: { size: 8, length: 5 },
        }),
        { ...scroll, top: 0, left: 0, clientHeight: 5, clientWidth: 10 },
        null,
        item,
      ],
      ret: [
        item(0, 0, { gridArea: '1/1/2/2' }),
        item(0, 1, { gridArea: '1/2/2/3' }),
        item(0, 2, { gridArea: '1/3/2/4' }),
        item(1, 0, { gridArea: '2/1/3/2' }),
        item(1, 1, { gridArea: '2/2/3/3' }),
        item(1, 2, { gridArea: '2/3/3/4' }),
        item(2, 0, { gridArea: '3/1/4/2' }),
        item(2, 1, { gridArea: '3/2/4/3' }),
        item(2, 2, { gridArea: '3/3/4/4' }),
      ],
    },
  ]
  for (const { title, args, ret } of list) {
    it(title, () => {
      expect(createItems(...args)).toEqual(ret)
    })
  }
})
