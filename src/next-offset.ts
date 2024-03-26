const { min, max, floor } = Math

/** @internal */
export const getNextOffset = (
  virtualTotalSize: number,
  pageSize: number,
  prevPageSize: number,
  realOffset: number,
  prevRealOffset: number,
  prevVirtualOffset: number,
): readonly [real: number, virtual: number] => {
  const move = prevPageSize === pageSize ? realOffset - prevRealOffset : 0
  const nextVirtualOffset = max(
    0,
    min(prevVirtualOffset + move, virtualTotalSize - pageSize),
  )
  const page = floor(nextVirtualOffset / pageSize)
  if (page < 3) return [nextVirtualOffset, nextVirtualOffset] as const
  const filledPageMax = floor(virtualTotalSize / pageSize)
  if (page + 2 < filledPageMax) {
    const nextRealOffset = pageSize * 2 + (nextVirtualOffset % pageSize)
    return [nextRealOffset, nextVirtualOffset] as const
  } else {
    const diff = max(0, virtualTotalSize - 5 * pageSize)
    const nextRealOffset = nextVirtualOffset - diff
    return [nextRealOffset, nextVirtualOffset] as const
  }
}
