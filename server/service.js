const Service = require('node-windows').Service;
const path = require('path');

// 定义服务
const svc = new Service({
  name: 'KoaJSBackendService', // 服务名称
  description: 'Koa.js backend service started via npm start.', // 服务描述
  script: path.join(__dirname, 'start.js'), // 指向新的启动脚本
  nodeOptions: ['--harmony'], // 可选：Node.js 启动参数
});

// 监听 "install" 事件，服务安装完成后启动
svc.on('install', () => {
  console.log('Service installed successfully.');
  svc.start();
});

// 安装服务
svc.install();
