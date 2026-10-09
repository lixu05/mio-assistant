# MIO的助理 - 快速参考

## 🚀 1分钟启动

```bash
cd mio-assistant
npm install
cp .env.example .env
# 编辑 .env 文件填入凭证
npm run dev
```

## 📋 需要的凭证

获取位置：
| 凭证 | 获取位置 |
|------|---------|
| **FEISHU_APP_ID** | 飞书开发者后台 → 应用 → 凭证与基础信息 |
| **FEISHU_APP_SECRET** | 飞书开发者后台 → 应用 → 凭证与基础信息 |
| **FEISHU_VERIFICATION_TOKEN** | 你在飞书"事件订阅"中设置的任意Token |
| **CLAUDE_API_KEY** | Claude官网 https://console.anthropic.com |

## 🎯 部署路径

```
本地开发 → GitHub推送 → Railway导入 → 飞书Webhook配置 → 完成！
```

## 🔗 关键URL

| 功能 | URL |
|------|-----|
| 健康检查 | `GET /health` |
| 消息Webhook | `POST /webhook/message` |
| 发送通知 | `POST /webhook/notify` |
| 主页 | `GET /` |

## 📁 文件速查

| 文件 | 作用 |
|------|------|
| `server.js` | 启动服务器 |
| `config.js` | 读取环境变量 |
| `services/claude.js` | 与Claude对话 |
| `services/feishu.js` | 与飞书通信 |
| `services/message-handler.js` | 处理消息逻辑 |

## ⚡ 常用命令

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start

# 启动向导
bash start.sh
```

## 🐛 遇到问题

| 问题 | 解决方案 |
|------|---------|
| 消息没回复 | 检查飞书Webhook URL和Token是否正确 |
| Claude报错 | 确认API密钥有效且有配额 |
| 验证失败 | 检查FEISHU_VERIFICATION_TOKEN一致性 |
| 连接超时 | 检查网络和Railway部署状态 |

## 📖 详细文档

- **开始**: 看 [README.md](README.md)
- **部署**: 看 [DEPLOYMENT.md](DEPLOYMENT.md)
- **功能**: 看 [FEATURES.md](FEATURES.md)
- **总结**: 看 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---
**保存此文件以便快速查找！**
