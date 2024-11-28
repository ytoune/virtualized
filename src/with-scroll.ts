import type { HTMLElement, ScrollContainer, ScrollState } from './interfaces'
import { screenHeight, screenWidth } from './libs/utils'

const { floor, min, max } = Math

/** @internal */
const getInitted = () =>
  ({
    top: { offset: 0, pageSize: screenHeight() },
    left: { offset: 0, pageSize: screenWidth() },
  }) as const satisfies Scroll

/** @internal */
export const updateState = (
  prevState: ScrollState,
  div: ScrollContainer,
  defaultPageSize: () => number,
): ScrollState => {
  const offset = max(floor(div.offset), 0)
  const pageSize = min(floor(div.pageSize), defaultPageSize())
  return offset !== prevState.offset || pageSize !== prevState.pageSize
    ? { offset, pageSize }
    : prevState
}

const ON_SCROLL = 1
const ON_RESIZE = 2
type ON_SCROLL = typeof ON_SCROLL
type ON_RESIZE = typeof ON_RESIZE

/** @internal */
const updateScroll = (
  prevScroll: Scroll,
  div: HTMLElement,
  type: ON_SCROLL | ON_RESIZE,
): Scroll => {
  const top = updateState(
    prevScroll.top,
    type === ON_SCROLL
      ? { offset: div.scrollTop, pageSize: prevScroll.top.pageSize }
      : { offset: prevScroll.top.offset, pageSize: div.clientHeight },
    screenHeight,
  )
  const left = updateState(
    prevScroll.left,
    type === ON_SCROLL
      ? { offset: div.scrollLeft, pageSize: prevScroll.left.pageSize }
      : { offset: prevScroll.left.offset, pageSize: div.clientWidth },
    screenWidth,
  )
  return top !== prevScroll.top || left !== prevScroll.left
    ? { top, left }
    : prevScroll
}

type ScrollProps = Readonly<{
  divRef: () => HTMLElement | null
  set: (f: (scroll: Scroll) => Scroll) => void
}>
export type Scroll = Readonly<{ top: ScrollState; left: ScrollState }>
export const withScroll = ({ divRef, set }: ScrollProps) => {
  const init = getInitted()
  const onScroll = () => {
    const div = divRef()
    if (div) set(e => updateScroll(e, div, ON_SCROLL))
  }
  const onResize = () => {
    const div = divRef()
    if (div) set(e => updateScroll(e, div, ON_RESIZE))
  }
  const subscribe = (): Unsubscribe =>
    subscribeScroll(divRef, onScroll, onResize)
  return { init, onScroll, onResize, subscribe } as const
}

type Unsubscribe = () => void

export const subscribeScroll = (
  divRef: () => HTMLElement | null,
  onScroll: () => void,
  onResize: () => void = onScroll,
  doResize = true,
): Unsubscribe => {
  const cleans: (() => void)[] = []
  try {
    if (doResize) {
      // 正しい画面サイズの取得
      onResize()
    }
    window.addEventListener('resize', onResize, { passive: true })
    cleans.push(() => window.removeEventListener('resize', onResize))
    const observer = new ResizeObserver(onResize)
    cleans.push(() => observer.disconnect())
    const div = divRef()
    if (div instanceof Element) {
      observer.observe(div)
      div.addEventListener('scroll', onScroll, { passive: true })
      cleans.push(() => div.removeEventListener('scroll', onScroll))
    }
  } catch (x) {
    // pass
    console.error(x)
  }
  return () => {
    for (let i = 0; i < cleans.length; ++i) cleans[i]!()
  }
}
