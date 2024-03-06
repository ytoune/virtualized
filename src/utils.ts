/** @internal */
export const isArray: (arr: unknown) => arr is readonly unknown[] =
  Array.isArray

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
export const sum = (arr: readonly number[], len = arr.length) => {
  const len2 = Math.min(arr.length, len)
  let sum = 0
  for (let i = 0; i < len2; ++i) sum += arr[i]!
  return sum
}

/** @internal */
export const tryOr = <T>(f: () => T, v: T) => {
  try {
    return f()
  } catch {
    return v
  }
}

/** @internal */
export const getDirection = (
  next: number,
  prev: number,
): false | 'backward' | 'forward' =>
  prev < next ? 'forward' : prev > next ? 'backward' : false
