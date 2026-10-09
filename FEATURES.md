# MIO的助理 - 功能详解

这份文档详细说明了 MIO的助理 机器人的所有功能和扩展方式。

## 核心功能

### 1. 私聊消息处理

当用户在飞书私聊中发送消息时，机器人会：
1. 接收消息
2. 使用Claude AI处理
3. 维护对话历史（支持多轮对话）
4. 回复用户

**示例**:
```
用户: 什么是机器学习？
机器人: 机器学习是一种...
```

### 2. 群组消息处理

机器人可以在群组中工作，但仅当被@提及时才会回复：

```
用户: @MIO的助理 帮我总结一下这个文件
机器人: 看起来你想让我...
```

**特点**:
- 不会对所有消息都回复，只对@机器人的消息回复
- 每次分析都是独立的（不保留群组对话历史）
- 避免打扰群组的正常讨论

### 3. 定时任务通知

可以从外部系统触发机器人发送通知消息。

**API调用示例**:
```bash
curl -X POST http://localhost:3000/webhook/notify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "定时任务执行完成：数据备份成功",
    "channelId": "your_channel_id",
    "token": "your_notify_token"
  }'
```

## 项目结构

```
mio-assistant/
├── server.js                 # 主应用文件
├── config.js                 # 配置管理
├── middleware/
│   └── feishu-verify.js      # 飞书请求签名验证
├── routes/
│   └── webhook.js            # Webhook路由处理
├── services/
│   ├── feishu.js             # 飞书API客户端
│   ├── claude.js             # Claude AI服务
│   └── message-handler.js    # 消息处理逻辑
├── .env.example              # 环境变量模板
├── package.json              # npm配置
├── README.md                 # 使用说明
└── DEPLOYMENT.md             # 部署指南
```

## 核心模块说明

### config.js - 配置管理

从环境变量加载所有配置，集中管理应用的所有参数。

```javascript
import config from './config.js';
config.feishu.appId        // 飞书应用ID
config.claude.apiKey       // Claude API密钥
config.server.port         // 服务器端口
```

### services/feishu.js - 飞书API客户端

负责所有与飞书的交互：

```javascript
import feishu from './services/feishu.js';

// 发送私聊消息
await feishu.sendMessage(userId, '消息内容');

// 发送群组消息
await feishu.sendGroupMessage(chatId, '消息内容');

// 获取用户信息
const user = await feishu.getUserInfo(userId);

// 自动管理Token刷新
```

**特点**:
- 自动获取和刷新Access Token
- Token缓存，避免频繁API调用
- 错误处理和日志记录

### services/claude.js - Claude AI服务

处理与Claude API的交互：

```javascript
import claude from './services/claude.js';

// 处理用户消息（保留对话历史）
const reply = await claude.processMessage(userId, userMessage);

// 分析消息（不保留历史）
const analysis = await claude.analyzeMessage(text);

// 清除用户对话历史
claude.clearHistory(userId);
```

**特点**:
- 维护每个用户的对话历史
- 支持多轮对话
- 自动管理历史大小（最多20条消息）

### services/message-handler.js - 消息处理

根据消息类型调用相应的处理逻辑：

```javascript
import handler from './services/message-handler.js';

// 处理私聊
await handler.handleIncomingMessage(messageEvent);

// 处理群组消息
await handler.handleGroupMessage(messageEvent);

// 发送定时通知
await handler.sendScheduledNotification(message, channelId);
```

## 扩展功能指南

### 添加新的消息处理类型

在 `routes/webhook.js` 中的事件处理部分添加：

```javascript
if (eventType === 'your_event_type') {
  // 处理你的自定义事件
}
```

### 自定义Claude系统提示

编辑 `services/claude.js` 中的 `system` 参数：

```javascript
system: '你是MIO的助理，一个...',  // 修改这里
```

### 添加数据库支持

例如添加MongoDB：

```bash
npm install mongoose
```

在 `services/database.js` 中创建数据库模块，保存用户对话历史、使用统计等。

### 添加命令支持

修改 `services/message-handler.js`，识别命令：

```javascript
const cleanMessage = userMessage.replace(/@\S+\s*/g, '').trim();

if (cleanMessage.startsWith('/')) {
  const command = cleanMessage.split(' ')[0];
  if (command === '/help') {
    // 处理帮助命令
  }
}
```

### 添加图片/文件支持

飞书消息支持多种内容类型。扩展消息处理：

```javascript
if (message.message_type === 'image') {
  // 处理图片
} else if (message.message_type === 'file') {
  // 处理文件
}
```

## API文档

### POST /webhook/message
飞书消息Webhook端点

**自动处理**:
- URL验证 (challenge)
- 事件处理
- 签名验证

### GET /health
健康检查端点

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

### POST /webhook/notify
发送定时通知

**请求体**:
```json
{
  "message": "通知内容",
  "channelId": "可选的目标群组ID",
  "token": "通知Token"
}
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `FEISHU_APP_ID` | 飞书应用ID | ✅ |
| `FEISHU_APP_SECRET` | 飞书应用密钥 | ✅ |
| `FEISHU_VERIFICATION_TOKEN` | 飞书验证Token | ✅ |
| `CLAUDE_API_KEY` | Claude API密钥 | ✅ |
| `PORT` | 服务器端口 | ❌ (默认3000) |
| `NODE_ENV` | 运行环境 | ❌ (默认development) |
| `NOTIFY_CHANNEL_ID` | 定时通知目标群组ID | ❌ |
| `NOTIFY_TOKEN` | 通知API Token | ❌ |

## 性能优化建议

1. **对话历史管理**: 当前限制每个用户20条消息，可根据需要调整
2. **Token缓存**: 飞书Token会被缓存2小时，提高API性能
3. **异步处理**: 消息处理是异步的，不阻塞Webhook返回
4. **错误处理**: 消息处理失败不会导致服务崩溃

## 安全建议

1. ✅ 所有飞书请求都验证签名
2. ✅ 敏感信息存储在环境变量中
3. ✅ 通知API需要Token验证
4. ⚠️ 建议在生产环境使用HTTPS
5. ⚠️ 定期轮换API密钥和Token

## 故障排除

### 消息没有回复
1. 检查飞书Webhook URL配置
2. 查看服务器日志
3. 验证环境变量配置正确
4. 确认Claude API密钥有效

### "无法验证签名"错误
1. 确认`FEISHU_VERIFICATION_TOKEN`与飞书配置一致
2. 检查是否正确处理了原始请求体

### Claude API返回错误
1. 验证API密钥正确
2. 检查API配额
3. 查看Claude的错误日志

## 参考资源

- [飞书开发者文档](https://open.feishu.cn/document)
- [Claude API文档](https://docs.anthropic.com)
- [Express.js文档](https://expressjs.com)

## 许可证

MIT
