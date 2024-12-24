import type { Sizes, StickyPosition } from '../interfaces'

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

// /** @internal */
// export const getDirection = (
//   next: number,
//   prev: number,
// ): false | 'backward' | 'forward' =>
//   prev < next ? 'forward' : prev > next ? 'backward' : false

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

/** @internal */
export const getTotal = (sizes: Sizes) => {
  if (isArray(sizes)) {
    let sum = 0
    for (let i = 0; i < sizes.length; ++i) sum += sizes[i]!
    return sum
  }
  const { length: count, size } = sizes
  return count * size
}

/** @internal */
export const createStickyManager = (
  sticky: StickyPosition | null,
): Readonly<{
  /** 固定されている要素の index の配列 */
  arr: readonly number[]
  /** 固定されている要素の index の Set */
  set: ReadonlySet<number>
}> => {
  let set: Set<number>
  if (sticky instanceof Set) set = sticky
  else {
    set = new Set()
    if ('number' === typeof sticky) for (let s = 0; s <= sticky; ++s) set.add(s)
    else if (sticky) for (const s of sticky) set.add(s)
  }
  const arr: readonly number[] = Array.from(set).sort((q, w) => q - w)
  return { arr, set }
}
