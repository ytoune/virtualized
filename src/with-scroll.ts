const tryOr = <T>(f: () => T, v: T) => {
  try {
    return f()
  } catch {
    return v
  }
}

const getDirection = (
  next: number,
  prev: number,
): false | 'backward' | 'forward' =>
  prev < next ? 'forward' : prev > next ? 'backward' : false

interface HTMLElement {
  readonly scrollLeft: number
  readonly scrollTop: number
  readonly clientWidth: number
  readonly clientHeight: number
}

type Unsubscribe = () => void
type ScrollProps = Readonly<{
  divRef: () => HTMLElement | null
  set: (f: (scroll: Scroll) => Scroll) => void
}>
export type Scroll = Readonly<{
  top: number
  left: number
  clientHeight: number
  clientWidth: number
  topDirection: boolean | 'backward' | 'forward'
  leftDirection: boolean | 'backward' | 'forward'
}>
export const withScroll = ({ divRef, set }: ScrollProps) => {
  const init: Scroll = {
    top: 0,
    left: 0,
    clientHeight: tryOr(() => window.innerHeight, 1 / 0),
    clientWidth: tryOr(() => window.innerWidth, 1 / 0),
    topDirection: false,
    leftDirection: false,
  }
  const onScroll = () => {
    const div = divRef()
    if (div)
      set(e => {
        const left = Math.max(Math.floor(div.scrollLeft), 0)
        const top = Math.max(Math.floor(div.scrollTop), 0)
        const clientWidth = Math.floor(div.clientWidth)
        const clientHeight = Math.floor(div.clientHeight)
        return top !== e.top ||
          left !== e.left ||
          clientHeight !== e.clientHeight ||
          clientWidth !== e.clientWidth
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
    onScroll()
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', onScroll)
    }
  }
  return { init, onScroll, subscribe } as const
}
