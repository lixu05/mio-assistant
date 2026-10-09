# MIO的助理 - 飞书机器人

完整的飞书机器人，集成Claude AI，支持多种功能。

## 功能特性

- 🤖 **Claude AI集成**: 使用Claude处理用户问询
- 📨 **消息处理**: 接收和回复飞书消息
- ⏰ **定时任务**: 支持定时任务结果投递
- 🔄 **跨平台转发**: 支持消息跨平台转发
- 🎯 **Webhook接入**: 飞书Webhook集成

## 快速开始

### 1. 飞书应用配置

#### 步骤 1: 创建飞书应用
1. 访问 [飞书开发者后台](https://open.feishu.cn/app)
2. 点击"创建企业应用"
3. 填写应用信息：
   - 应用名称: `MIO的助理`
   - 应用描述: `综合助手机器人`
4. 点击创建

#### 步骤 2: 获取应用凭证
1. 在应用详情页，找到"凭证与基础信息"
2. 复制 **App ID** 和 **App Secret**
3. 保存到 `.env` 文件

#### 步骤 3: 配置事件订阅
1. 进入"应用功能" → "消息与群组"
2. 启用"接收消息"
3. 在"事件订阅"中配置：
   - **Request URL**: `https://your-domain.com/webhook/message`
   - **Request Token**: 任意字符串，保存到 `.env` 中的 `FEISHU_VERIFICATION_TOKEN`
4. 选择订阅事件：
   - `im.message.receive_v1` (接收消息事件)
5. 保存配置

#### 步骤 4: 获取机器人Token
1. 在"凭证与基础信息"中，获取 **Tenant Access Token**
2. 这用于向飞书发送消息

### 2. 本地配置

```bash
# 安装依赖
npm install

# 创建 .env 文件
cp .env.example .env
```

编辑 `.env` 文件，填入：
```
FEISHU_APP_ID=你的App_ID
FEISHU_APP_SECRET=你的App_Secret
FEISHU_VERIFICATION_TOKEN=你设置的Token
CLAUDE_API_KEY=你的Claude_API_Key
PORT=3000
```

### 3. 本地测试

```bash
npm run dev
```

### 4. 部署

#### 选项 A: Railway 部署（推荐）

1. 访问 [Railway](https://railway.app)
2. 登录/注册账户
3. 点击 "New Project" → "Deploy from GitHub"
4. 选择你的 GitHub 仓库
5. 配置环境变量（同 `.env` 文件）
6. 部署完成后，获取部署URL

#### 选项 B: Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. Import 你的 GitHub 项目
3. 配置环境变量
4. 部署

### 5. 更新飞书Webhook URL

部署完成后，更新飞书应用的 Webhook URL：
- 进入飞书开发者后台
- 更新 **Request URL** 为: `https://你的部署URL/webhook/message`
- 保存

## 项目结构

```
mio-assistant/
├── server.js                 # 主文件
├── config.js                 # 配置管理
├── middleware/
│   └── feishu-verify.js      # 飞书请求验证
├── routes/
│   └── webhook.js            # Webhook路由
├── services/
│   ├── feishu.js             # 飞书API服务
│   ├── claude.js             # Claude AI服务
│   └── message-handler.js    # 消息处理
├── .env.example              # 环境变量模板
├── package.json              # 项目配置
└── README.md                 # 本文件
```

## API 文档

### POST /webhook/message
接收飞书消息事件

**请求体示例:**
```json
{
  "token": "verification_token",
  "challenge": "challenge_string"
}
```

## 故障排除

- **Webhook连接失败**: 检查 `FEISHU_VERIFICATION_TOKEN` 是否正确
- **Claude API错误**: 检查 `CLAUDE_API_KEY` 是否有效
- **消息发送失败**: 检查机器人是否有群组消息权限

## 许可证

MIT
