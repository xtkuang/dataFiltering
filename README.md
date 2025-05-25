# 项目概述

本项目是一个基于 TypeScript 和 React 的企业资源管理（ERM）数据同步平台。该平台允许用户管理和同步项目、设备、工位和物料的数据(大量数据)，并支持数据的导出和报表生成。

## 主要功能

- **数据管理**：用户可以查看和管理项目、设备、工位和物料的详细信息。
- **数据同步**：支持与外部系统的数据同步，确保数据的一致性和更新。
- **数据导出**：用户可以将选定的数据导出为 Excel 文件，便于进行离线分析和报告生成。
- **用户管理**：支持用户的添加、删除和角色分配，以及权限控制。

## 技术栈

- **前端**：使用 React 框架和 Ant Design 组件库构建用户界面。
- **后端**：使用 Koa 框架处理 HTTP 请求，Prisma 作为 ORM 工具与数据库交互。
- **数据库**：使用 PostgreSQL 存储数据。

## 项目结构

### 前端 (`front-end`)

- `app/` - 包含所有的 React 组件和页面。
  - `home/` - 主页相关组件。
    - `layout.tsx` - 主布局组件。
    - `erm/` - ERM 数据相关页面和组件。
    - `user/` - 用户管理相关页面和组件。
  - `login/` - 登录页面。
  - `loading.tsx` - 加载组件。
- `stores/` - 状态管理使用 MobX。
  - `ermData.ts` - 管理 ERM 数据的状态。
  - `user.ts` - 管理用户数据的状态。
- `utils/` - 工具函数。
  - `request.ts` - 封装网络请求。
  - `cookie.ts` - 管理 cookie 的工具函数。
- `api/` - API 接口函数。
  - `dataFilter.api.ts` - 数据过滤相关 API。
  - `user.api.ts` - 用户相关 API。

### 后端 (`server`)

- `src/` - 源代码目录。
  - `controller/` - 控制器，处理请求逻辑。
  - `service/` - 服务层，处理业务逻辑。
  - `middleware/` - 中间件，如身份验证和错误处理。
  - `prisma/` - Prisma ORM 配置和模型。
  - `routes.ts` - 路由配置。
- `index.ts` - 服务器入口文件。

## 快速开始

1. **克隆仓库**

   ```bash
   git clone *********
   ```

2. **安装依赖**

   ```bash
   cd front-end && npm install
   cd ../server && npm install
   ```

3. **启动数据库**（确保 MySQL 正在运行）

4. **运行后端服务器**

   ```bash
   cd server
   npm run start
   ```

5. **运行前端应用**

   ```bash
   cd front-end
   npm run start
   ```

6. **访问应用**
   打开浏览器访问 `http://localhost:3000`。

## 开发者指南

- **环境配置**：确保你的开发环境中安装了 Node.js、npm 和 PostgreSQL。
- **代码风格**：遵循项目中配置的 ESLint 规则来保持代码风格一致性。
- **提交规范**：使用清晰的提交信息来描述所做的更改。
