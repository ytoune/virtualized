import type { HTMLElement } from './interfaces'
import { getDirection } from './utils'

const { floor, min, max } = Math

type Unsubscribe = () => void

const screenHeight = (): number => {
  try {
    return window.screen.height
  } catch {
    return 1 / 0
  }
}
const screenWidth = (): number => {
  try {
    return window.screen.width
  } catch {
    return 1 / 0
  }
}

/** @internal */
export const getInitted = () =>
  ({
    top: 0,
    left: 0,
    clientHeight: screenHeight(),
    clientWidth: screenWidth(),
    topDirection: false,
    leftDirection: false,
  }) as const satisfies Scroll

/** @internal */
export const updateScroll = (prevScroll: Scroll, div: HTMLElement): Scroll => {
  const left = max(floor(div.scrollLeft), 0)
  const top = max(floor(div.scrollTop), 0)
  const clientWidth = min(floor(div.clientWidth), screenWidth())
  const clientHeight = min(floor(div.clientHeight), screenHeight())
  // false !== prevScroll.topDirection ||
  // false !== prevScroll.leftDirection ||
  return top !== prevScroll.top ||
    left !== prevScroll.left ||
    clientHeight !== prevScroll.clientHeight ||
    clientWidth !== prevScroll.clientWidth
    ? {
        top,
        left,
        clientHeight,
        clientWidth,
        topDirection: getDirection(top, prevScroll.top),
        leftDirection: getDirection(left, prevScroll.left),
      }
    : prevScroll
}

type ScrollProps = Readonly<{
  divRef: () => HTMLElement | null
  set: (f: (scroll: Scroll) => Scroll) => void
}>
export type Scroll = Readonly<{
  top: number
  left: number
  clientHeight: number
  clientWidth: number
  topDirection: false | 'backward' | 'forward'
  leftDirection: false | 'backward' | 'forward'
}>
export const withScroll = ({ divRef, set }: ScrollProps) => {
  const init = getInitted()
  const onScroll = () => {
    const div = divRef()
    if (div) set(e => updateScroll(e, div))
  }
  const subscribe = (): Unsubscribe => subscribeImpl(divRef, onScroll)
  return { init, onScroll, subscribe } as const
}

/** @internal */
export const subscribeImpl = (
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
  } catch {
    // pass
  }
  return () => {
    for (let i = 0; i < cleans.length; ++i) cleans[i]!()
  }
}
