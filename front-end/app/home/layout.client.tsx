'use client'
import React from 'react'
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Avatar, Layout, Menu, theme } from 'antd'
import { ConfigProvider } from 'antd'
const { Header, Content, Footer, Sider } = Layout
import { LogoutOutlined, FileSearchOutlined } from '@ant-design/icons'
import useStores from '@/stores'
import { useRouter } from 'next/navigation'

// const items = [

//   UserOutlined,
// ].map((icon, index) => ({
//   key: String(index + 1),
//   icon: React.createElement(icon),
//   label: `nav ${index + 1}`,
// }))
const items = [
  {
    label: 'ERM数据同步',
    key: 'erm',
    icon: <FileSearchOutlined />,
    path: '/erm',
  },
  {
    label: '用户管理',
    key: 'user',
    icon: <UserOutlined />,
    path: '/user',
  },
]
const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const router = useRouter()
  const { user } = useStores()
  return (
    <ConfigProvider
      theme={
        {
          // token: { colorBgLayout: '#fff', colorBgContainer: '#fff' },
        }
      }>
      <Layout className="h-screen">
        <Sider
          theme="light"
          collapsible
          breakpoint="lg"
          // collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken)
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type)
          }}>
          <div className="demo-logo-vertical" />
          <Menu
            // theme="light"
            mode="inline"
            items={items}
            onClick={(e) => {
              router.push(e.key)
            }}
          />
        </Sider>
        <Layout style={{ padding: '' }}>
          {/* <Header
            style={{
              margin: '24px 16px 0',
              padding: 0,
              background: colorBgContainer,
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: '24px',
            }}>
            <LogoutOutlined
              onClick={() => {
                user.logout()
              }}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'red',
                cursor: 'pointer',
              }}
            />
          </Header> */}
          <Content style={{ margin: '24px 24px 0' }}>
            <div
              style={{
                height: '100%',
                // background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}>
              {children}
            </div>
          </Content>
          {/* <Footer style={{ textAlign: 'center' }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer> */}
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
