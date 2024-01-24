# virtualized

[![npm version](https://badge.fury.io/js/@ytoune%2Fvirtualized.svg)](https://badge.fury.io/js/@ytoune%2Fvirtualized)

CSS Grid を利用した仮想スクロール実装用ユーティリティ

## createFormat

各種 CSS properties オブジェクトを生成する。  
gridTemplate を含む innerStyle や各セル用の gridArea を含む CSS を生成する cell 関数などを返す。

## withScroll

スクロール状況をまとめた状態管理を行う。

## createItems

画面内の要素のみを生成する。

## usage

React の仮想スクロール用コンポーネントの例。

```jsx
import { useEffect, useMemo, useRef, useState } from 'react'

import { createFormat, createItems, withScroll } from '@ytoune/virtualized'
import type { RenderItem, Sizes, Sticky } from '@ytoune/virtualized'

export type GridProps = Readonly<{
  rowSizes: Sizes
  colSizes: Sizes
  renderItem: RenderItem<JSX.Element>
  sticky: Sticky
}>
export const Grid = ({ colSizes, rowSizes, renderItem, sticky }: GridProps) => {
  const wrap = useRef<HTMLDivElement>(null)
  const sc = useRef(null as null | ReturnType<typeof withScroll>)
  sc.current ||= withScroll({
    divRef: () => wrap.current,
    set: f => setScroll(f),
  })
  const { init, onScroll, subscribe } = sc.current
  const [scroll, setScroll] = useState(init)
  useEffect(subscribe, [])
  const format = useMemo(
    () => createFormat({ colSizes, rowSizes }),
    [colSizes, rowSizes],
  )
  const items = useMemo(
    () => createItems(format, scroll, sticky, renderItem),
    [format, scroll, sticky, renderItem],
  )
  return <div ref={wrap} style={format.outerStyle} onScroll={onScroll}>
    <div style={format.innerStyle}>{items}</div>
  </div>
}
```

```jsx
import type { CellStyle } from '@ytoune/virtualized'
import { Grid } from './grid'

const fontSize = 16
const span = () => (text: string | null, s: CellStyle) => (
  <span
    style={{
      lineHeight: `${fontSize * 1.5}px`,
      textAlign: 'end',
      color: '#000',
      background: '#fff',
      ...s,
    }}
    key={s.gridArea}
  >
    {text}
  </span>
)

const chars = [...'abcdefghijklmnopqrstuvwxyz']
export const App = () =>
  <Grid
    rowSizes={{ size: fontSize * 1.5, length: 100_000 }}
    colSizes={[120, 80, 80, 80, 80, 80]}
    renderItem={(r, c, s) => {
      if (r && c) return span(chars[(r + c - 2) % chars.length]!, s)
      if (r) return span(`r${r}`, s)
      if (c) return span(`c${c}`, s)
      return span(null, s)
    }}
    sticky={{ r: 0, c: 2 }}
  />
```
