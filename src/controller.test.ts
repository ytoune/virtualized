import { describe, expect, it } from 'vitest'

describe(() => {
  it('hoge', () => {
    expect('').toBe('')
  })
  /**

pagesize=10 // ビューポートの大きさ
origin=0 // 現在描画している場所の起点
current=0 // 仮想画面でのスクロール量

current が変化して origin との差が pagesize より大きくなったら
origin に current を代入して再描画

   */
})
