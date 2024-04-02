import { describe, it, expect } from 'vitest'
import { createItemStyle } from './format'
import type { AreaString, Sizes, Sticky } from './interfaces'

describe('createItemStyle', () => {
  const list: {
    args: {
      row: number
      col: number
      rowSizes: Sizes
      colSizes: Sizes
      sticky?: Sticky
      getGridArea?: (row: number, col: number) => AreaString
    }
    ret: ReturnType<typeof createItemStyle>
  }[] = [
    {
      args: {
        row: 0,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
      },
      ret: { gridArea: '1/1/2/2' },
    },
    {
      args: {
        row: 2,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
      },
      ret: { gridArea: '3/1/4/2' },
    },
    {
      args: {
        row: 0,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
        sticky: { r: 0 },
      },
      ret: { gridArea: '1/1/2/2', position: 'sticky', top: '0px' },
    },
    {
      args: {
        row: 1,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
        sticky: { r: 0 },
      },
      ret: { gridArea: '2/1/3/2' },
    },
    {
      args: {
        row: 2,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
        sticky: { r: [1, 2] },
      },

      ret: { gridArea: '3/1/4/2', position: 'sticky', top: '4px' },
    },
    {
      args: {
        row: 2,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
        sticky: { r: [0, 1, 2] },
      },
      ret: { gridArea: '3/1/4/2', position: 'sticky', top: '8px' },
    },
    {
      args: {
        row: 2,
        col: 0,
        rowSizes: { size: 4, length: 10 },
        colSizes: { size: 10, length: 1 },
        sticky: { r: [1, 2] },
        getGridArea: (r, c) => `${r}/${c}/9/9`,
      },

      ret: { gridArea: '2/0/9/9', position: 'sticky', top: '4px' },
    },
  ]
  const rep = (_: unknown, v: unknown) => ('function' === typeof v ? '<fn>' : v)
  const e = (v: unknown) => JSON.stringify(v, rep).replace(/"/giu, '')
  for (const { args, ret } of list)
    it(e(args), () => {
      const { row, col, ...rest } = args
      expect(createItemStyle(row, col, rest)).toEqual(ret)
    })
})
