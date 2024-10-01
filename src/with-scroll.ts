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

/** @internal */
const updateScroll = (prevScroll: Scroll, div: HTMLElement): Scroll => {
  const top = updateState(
    prevScroll.top,
    { offset: div.scrollTop, pageSize: div.clientHeight },
    screenHeight,
  )
  const left = updateState(
    prevScroll.left,
    { offset: div.scrollLeft, pageSize: div.clientWidth },
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
    if (div) set(e => updateScroll(e, div))
  }
  const subscribe = (): Unsubscribe => subscribeScroll(divRef, onScroll)
  return { init, onScroll, subscribe } as const
}

type Unsubscribe = () => void

export const subscribeScroll = (
  divRef: () => HTMLElement | null,
  onScrollOrResize: () => void,
): Unsubscribe => {
  const cleans: (() => void)[] = []
  try {
    onScrollOrResize()
    window.addEventListener('resize', onScrollOrResize, { passive: true })
    cleans.push(() => window.removeEventListener('resize', onScrollOrResize))
    const observer = new ResizeObserver(onScrollOrResize)
    cleans.push(() => observer.disconnect())
    const div = divRef()
    if (div instanceof Element) {
      observer.observe(div)
      div.addEventListener('scroll', onScrollOrResize, { passive: true })
      cleans.push(() => div.removeEventListener('scroll', onScrollOrResize))
    }
  } catch (x) {
    // pass
    console.error(x)
  }
  return () => {
    for (let i = 0; i < cleans.length; ++i) cleans[i]!()
  }
}
