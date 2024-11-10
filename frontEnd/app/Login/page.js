"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Typography, Form, Space,Divider } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { IconPlus } from '@arco-design/web-react/icon';

export default function LoginPage() {
    const [loading,setLoading] = useState(false);
    const [success,setSuccess] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    
    const handleLogin = async (e) => {

        e.preventDefault();
        setLoading(true);
        setTimeout(()=>{
            setLoading(false);
        },3000);

        const res = await fetch('http://127.0.0.1:8000/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            setSuccess(true);
            router.push('/home'); //登录成功跳转
        } else {
            setSuccess(false);
            //alert('Login failed');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <div style={{ flex: 1, color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: 'linear-gradient(to bottom, #CCFBFF, #EF96C5)'}}>
                <div style={{ width: '100%', height: '100%', backgroundImage: 'url(/image/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <Typography.Title 
                    heading={3} 
                    style={{ 
                        textAlign: 'center', 
                        //backgroundImage: 'url(/image/background.jpg)', // 使用相对路径
                        backgroundSize: 'cover', // 使图片覆盖整个区域
                        backgroundPosition: 'center', // 图片居中
                        padding: '20px', // 添加内边距以确保文本可读
                        color: 'white', // 确保文本颜色与背景对比明显
                    }}
                >
                    Learn to code. Interactively. For free.
                </Typography.Title>
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card style={{ width: '100%', maxWidth: '400px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <Typography.Title heading={4} style={{ textAlign: 'center', marginBottom: '20px' }}>Join over 25 million learners from around the globe</Typography.Title>
                    <Form>
                        <Form.Item field="user.username" style={{ marginBottom: '20px' }}>
                            <Input
                                type="text"
                                placeholder="username"
                                onChange={(username) => setUsername(username)}
                                style={{ backgroundColor: '#f0f0f0' }}
                            />
                        </Form.Item>
                        <Form.Item field="user.password" style={{ marginBottom: '20px' }}>
                            <Space wrap>
                              <Input.Password
                                placeholder="Password"
                                //defaultValue='password'
                                onChange={(password) => setPassword(password)}
                                style={{ backgroundColor: '#f0f0f0',width: 300 }}
                              />
                            </Space>
                        </Form.Item>
                        <Button type="primary" style={ {backgroundColor : '#3b82f6' }} loading={loading}  success={success.toString()} onClick={handleLogin}>
                        {loading ? "Loading..." : "Sign in"}
                        </Button>
                    </Form> 
                </Card>
            </div>
        </div>
    )
}