import React from 'react'
import { Spin } from 'antd'
export default function Loading() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Spin tip="Loading" size="large">
        加载中
      </Spin>
    </div>
  )
}
