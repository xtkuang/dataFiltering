'use client'
import React from 'react'
import { Form, Input, Button } from 'antd'

const LoginPage: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values)
  }

  return (
    <div style={{ maxWidth: 300, margin: 'auto' }}>
      <h2>登录</h2>
      <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名!' }]}>
          <Input placeholder="用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}>
          <Input.Password placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginPage
