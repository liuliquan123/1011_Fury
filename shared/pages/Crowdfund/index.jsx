/**
 * Crowdfund 页面 - Step 1: 最小化测试版本
 * 目的：排查 React #130 错误根源
 */
import React from 'react'

console.log('[Crowdfund] file loaded')

const Crowdfund = () => {
  console.log('[Crowdfund] render')
  return (
    <div style={{ padding: '60px 72px', color: '#fff' }}>
      <h1 style={{ fontFamily: 'Jersey 10', fontSize: '88px', color: '#E9FD66' }}>
        Crowdfund Test
      </h1>
      <p>如果你能看到这段文字，说明路由和组件加载正常。</p>
    </div>
  )
}

export default Crowdfund

