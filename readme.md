# virtualized

## usage

```typescript
import { useEffect, useMemo, useRef, useState } from 'react'

import { createFormat, createItems, withScroll } from '@ytoune/virtualized'
import type { RenderItem, Sizes, Sticky } from '@ytoune/virtualized/interfaces'

const emptyArr = [] as const

export type GridProps = Readonly<{
  colWidths: Sizes
  rowHeights: Sizes
  renderItem: RenderItem<JSX.Element>
  sticky: Sticky
}>
export const Grid = ({ colWidths, rowHeights, renderItem, sticky }: GridProps) => {
  const wrap = useRef<HTMLDivElement>(null)
  const sc = useRef(null as null | ReturnType<typeof withScroll>)
  sc.current ||= withScroll({
    divRef: () => wrap.current,
    set: f => setScroll(f),
  })
  const { init, onScroll, subscribe } = sc.current
  const [scroll, setScroll] = useState(init)
  useEffect(subscribe, emptyArr)
  const format = useMemo(
    () => createFormat({ colWidths, rowHeights }),
    [colWidths, rowHeights],
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
