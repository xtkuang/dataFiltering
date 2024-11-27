'use client'
import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import useStores from '@/stores'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
const LoginPage: React.FC = () => {
  const { user } = useStores()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-200 to-blue-500">
      <div className="bg-white shadow-lg rounded-lg p-10 w-96">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ERM 数据同步系统
        </h2>

        <Form
          onFinish={async (values) => {
            setLoading(true)
            await user
              .login(values)
              .then((res) => {
                if ((res as any).code == 200) {
                  setLoading(false)
                  message.success('登录成功')

                  router.push(redirect || '/home/erm')
                }
              })
              .catch((err) => {
                message.error('用户名或密码错误')
                setLoading(false)
              })
          }}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input
              placeholder="用户名"
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}>
            <Input
              type="password"
              placeholder="密码"
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full hover:bg-blue-700 transition duration-200"
              loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <p className="text-center text-sm mt-4 text-gray-600">
          忘记密码？请联系管理员寻求帮助！
        </p>
      </div>
    </div>
  )
}

export default LoginPage
