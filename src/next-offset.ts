const { min, max, floor, ceil } = Math

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
  const pageCount = ceil(virtualTotalSize / pageSize)
  if (pageCount <= 5) return [nextVirtualOffset, nextVirtualOffset] as const
  const nextRealOffset =
    page + 2 < pageCount
      ? pageSize * 2 + (nextVirtualOffset % pageSize)
      : nextVirtualOffset - pageSize * (pageCount - 5)
  return [nextRealOffset, nextVirtualOffset] as const
}
