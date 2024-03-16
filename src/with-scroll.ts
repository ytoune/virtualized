import { getDirection } from './utils'

const { floor, min, max } = Math

interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}

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
  const init: Scroll = {
    top: 0,
    left: 0,
    clientHeight: screenHeight(),
    clientWidth: screenWidth(),
    topDirection: false,
    leftDirection: false,
  }
  const onScroll = () => {
    const div = divRef()
    if (div)
      set(e => {
        const left = max(floor(div.scrollLeft), 0)
        const top = max(floor(div.scrollTop), 0)
        const clientWidth = min(floor(div.clientWidth), screenWidth())
        const clientHeight = min(floor(div.clientHeight), screenHeight())
        return top !== e.top ||
          left !== e.left ||
          clientHeight !== e.clientHeight ||
          clientWidth !== e.clientWidth ||
          false !== e.topDirection ||
          false !== e.leftDirection
          ? {
              top,
              left,
              clientHeight,
              clientWidth,
              topDirection: getDirection(top, e.top),
              leftDirection: getDirection(left, e.left),
            }
          : e
      })
  }
  const subscribe = (): Unsubscribe => {
    const cleans: (() => void)[] = []
    try {
      onScroll()
      window.addEventListener('resize', onScroll, { passive: true })
      cleans.push(() => window.removeEventListener('resize', onScroll))
      const observer = new ResizeObserver(onScroll)
      cleans.push(() => observer.disconnect())
      const div = divRef()
      if (div instanceof Element) {
        observer.observe(div)
        div.addEventListener('scroll', onScroll, { passive: true })
        cleans.push(() => div.removeEventListener('scroll', onScroll))
      }
    } catch {
      // pass
    }
    return () => {
      for (let i = 0; i < cleans.length; ++i) cleans[i]!()
    }
  }
  return { init, onScroll, subscribe } as const
}
