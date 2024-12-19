'use client'
import {
  Table,
  Row,
  Col,
  Button,
  Tag,
  Modal,
  message,
  Input,
  Form,
  Select,
  Radio,
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { observer } from 'mobx-react'
import useStores from '@/stores'
import { useState, useEffect } from 'react'
import {
  DeleteOutlined,
  LogoutOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { removeToken } from '@/utils/cookie'
export default observer(function Home() {
  const { user } = useStores()
  const userList = user.userList
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [addUserModal, setAddUserModal] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [updatePasswordModal, setUpdatePasswordModal] = useState<any>(null)
  useEffect(() => {
    let handle_fetch = user.user === null || user.userList.length === 0
    if (handle_fetch) {
      user.getUserInfo()
      user.getUserList().then(() => {
        setLoading(false)
      })
    }
    !handle_fetch && setLoading(false)
  }, [])
  const columns: ColumnsType<any> = [
    {
      title: '用户名',
      dataIndex: 'username',
      render: (text, record) => {
        let style: any = {
          fontSize: 16,
          fontWeight: 'bold',
          // backgroundColor: '#fff',
          color: '#000',
          padding: '5px',
        }
        if (text === user.user.username)
          style = {
            ...style,

            fontStyle: 'italic',
            textDecoration: 'underline',
          }
        return <span style={style}>{text}</span>
      },
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (value, record, index) => (
        <span>
          {
            <Tag color={value === 'admin' ? 'geekblue' : 'green'}>
              {value.toUpperCase()}
            </Tag>
          }
        </span>
      ),
    },
    {
      title: '修改密码',
      render: (record) => (
        <Button
          onClick={() => {
            setUpdatePasswordModal(record)
            // setEdit(record)
          }}
          type="primary"
          disabled={
            !(record.username === user.user?.username) &&
            user.user?.role === 'user'
          }
          icon={<EditOutlined />}>
          修改密码
        </Button>
      ),
    },
    {
      title: '编辑',
      render: (record) => (
        <Button
          onClick={() => {
            setEdit(record)
          }}
          type="primary"
          icon={<EditOutlined />}
          disabled={user.user?.role === 'user'}>
          编辑
        </Button>
      ),
    },
    {
      title: '删除',
      render: (record) => (
        <Button
          disabled={user.user?.role === 'user'}
          onClick={() =>
            Modal.confirm({
              title: `确定要删除 ${record.username} 用户吗？`,
              okText: '确定',
              cancelText: '取消',
              onOk() {
                setLoading(true)
                user.deleteUser(record.id).then(() => {
                  setLoading(false)
                  message.success(`${record.username}删除成功`)
                })
              },
              onCancel() {
                message.warning('取消删除用户')
              },
            })
          }
          danger
          icon={<DeleteOutlined />}
          type="primary">
          删除
        </Button>
      ),
    },
    {
      title: '登出',
      key: 'logout',

      render: (record) => (
        <Button
          icon={<LogoutOutlined />}
          disabled={
            !(record.username === user.user?.username) &&
            user.user?.role === 'user'
          }
          onClick={() =>
            Modal.confirm({
              title: `确定要登出 ${record.username} 用户吗？`,
              okText: '确定',
              cancelText: '取消',

              onOk() {
                setLoading(true)
                user.logout(record.id).then(() => {
                  setLoading(false)
                  if (record.username === user.user?.username) {
                    removeToken()
                    localStorage.removeItem('token')
                    router.push('/login')
                  }
                  message.success(`${record.username}登出成功`)
                })
              },
              onCancel() {
                message.warning('取消登出用户')
              },
            })
          }
          type="primary">
          登出
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* 修改密码 */}
      <Modal
        open={updatePasswordModal}
        title="修改密码"
        okText="提交"
        cancelText="取消"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => {
          message.warning('取消修改密码')
          setLoading(false)
          setUpdatePasswordModal(false)
        }}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            clearOnDestroy
            onFinish={async (values) => {
              setLoading(true)
              await user
                .updatePassword({
                  userId: updatePasswordModal.id,
                  oldPassword: values.oldPassword,
                  newPassword: values.newPassword,
                })
                .then((res) => {
                  if ((res as any).code === 200) {
                    setLoading(false)
                    message.success('修改密码成功')
                    setUpdatePasswordModal(false)
                  } else {
                    message.error((res as any).message)
                  }
                })
                .catch((err) => {
                  message.error(err.message)
                })
            }}>
            {dom}
          </Form>
        )}>
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[{ required: true, message: '请输入原密码' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[{ required: true, message: '请输入新密码' }]}>
          <Input.Password />
        </Form.Item>
      </Modal>

      <Modal
        open={edit !== null}
        title="编辑"
        okText="提交"
        cancelText="取消"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => {
          message.warning('取消编辑用户')
          setEdit(null)
          setLoading(false)
        }}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            clearOnDestroy
            onFinish={(values) => {
              setLoading(true)
              user
                .updateUser({
                  userId: edit.id,
                  username: values.username,
                  role: values.role,
                })
                .then(async (res) => {
                  if ((res as any).code === 200) {
                    setEdit(null)
                    await user.getUserList()
                    setLoading(false)
                    message.success('编辑用户成功')
                  } else {
                    message.error((res as any).message)
                  }
                })
            }}>
            {dom}
          </Form>
        )}>
        <Form.Item
          name="username"
          label="用户名"
          initialValue={edit?.username}
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="角色"
          initialValue={edit?.role}
          rules={[
            {
              required: true,
              message: '请选择角色',
            },
          ]}>
          <Radio.Group>
            <Radio value="admin">管理员</Radio>
            <Radio value="user">用户</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button
            danger
            onClick={() =>
              user.resetPassword({ userId: edit.id }).then(() => {
                message.success('重置密码成功')
                setEdit(null)
              })
            }>
            重置密码
          </Button>
        </Form.Item>
      </Modal>
      <Modal
        open={addUserModal}
        title="添加用户"
        okText="提交"
        cancelText="取消"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => {
          message.warning('取消添加用户')
          setAddUserModal(false)
        }}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            clearOnDestroy
            onFinish={(values) => {
              setLoading(true)
              user.register(values).then(async () => {
                setAddUserModal(false)
                await user.getUserList()
                setLoading(false)
                message.success('添加用户成功')
              })
            }}>
            {dom}
          </Form>
        )}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="role"
          label="角色"
          rules={[
            {
              required: true,
              message: '请选择角色',
            },
          ]}>
          <Radio.Group>
            <Radio value="admin">管理员</Radio>
            <Radio value="user">用户</Radio>
          </Radio.Group>
        </Form.Item>
      </Modal>
      <Table
        //单元格居中
        bordered
        loading={loading}
        pagination={false}
        dataSource={user.userList}
        columns={columns.map((column) => ({
          ...column,
          align: 'center',
        }))}
        footer={() => {
          return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                disabled={user.user?.role === 'user'}
                onClick={() => setAddUserModal(true)}
                icon={<PlusOutlined />}
                style={{ background: '#000', color: '#fff' }}
                type="primary">
                添加用户
              </Button>
            </div>
          )
        }}
      />
    </>
  )
})
