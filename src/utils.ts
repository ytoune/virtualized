/** @internal */
export const {
  isArray,
}: { readonly isArray: (arr: unknown) => arr is readonly unknown[] } = Array

/**
 * めぐる式二分探索
 *
 * @internal
 */
export const binarySearch = (
  N: number,
  ask: (i: number) => boolean,
): number => {
  let ng = -1
  let ok = N
  while (ok - ng > 1) {
    const m = (ng + ok) >> 1 // = floor((ng + ok) / 2)
    if (ask(m)) ok = m
    else ng = m
  }
  return ok
}

/** @internal */
export const getDirection = (
  next: number,
  prev: number,
): false | 'backward' | 'forward' =>
  prev < next ? 'forward' : prev > next ? 'backward' : false

/** @internal */
export const screenHeight = (): number => {
  try {
    return window.screen.height
  } catch {
    return 1 / 0
  }
}

/** @internal */
export const screenWidth = (): number => {
  try {
    return window.screen.width
  } catch {
    return 1 / 0
  }
}
