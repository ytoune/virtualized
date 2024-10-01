/** @internal */
export const getKeep = (
  pageSize: number,
  totalSize: number,
  startVPos: number,
  endVPos: number,
): readonly [start: number, end: number] => [
  0 < startVPos ? startVPos + pageSize : 0,
  endVPos < totalSize ? endVPos - pageSize : totalSize,
]
