/** @internal */
export const getNextOffset = (
  clientSize: number,
  virtualTotalSize: number,
  realOffset: number,
  gap = clientSize,
  realTotalSize = Math.min(virtualTotalSize, clientSize + gap * 4),
) => {
  if (virtualTotalSize <= realTotalSize || gap <= 0) return realOffset
  let nextRealOffset = realOffset
  // 0 <- gap -> 1 <- gap -> 2 <- gap -> 3 <- gap -> 4
  const idx1 = gap
  const idx3 = gap + gap + gap
  while (nextRealOffset < idx1) nextRealOffset += gap
  while (idx3 < nextRealOffset) nextRealOffset -= gap
  return nextRealOffset
}
