# 部署指南 - MIO的助理

## Railway 部署（推荐）

Railway 是最简单的部署方案，支持自动部署和免费额度。

### 第1步：准备GitHub仓库

```bash
# 初始化git仓库
git init
git add .
git commit -m "Initial commit: MIO Assistant setup"

# 推送到GitHub
git remote add origin https://github.com/your-username/mio-assistant.git
git push -u origin main
```

### 第2步：在Railway上部署

1. 访问 [Railway](https://railway.app)
2. 使用GitHub账户登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择 `mio-assistant` 仓库
5. 确认部署配置
6. 等待部署完成

### 第3步：配置环境变量

在Railway项目中：
1. 点击 "Variables"
2. 添加以下环境变量：

```
FEISHU_APP_ID=你的App_ID
FEISHU_APP_SECRET=你的App_Secret
FEISHU_VERIFICATION_TOKEN=你的验证Token
CLAUDE_API_KEY=你的Claude_API_Key
PORT=3000
NODE_ENV=production
```

### 第4步：获取部署URL

1. 在Railway项目中找到 "Domains"
2. Railway会自动分配一个域名，例如：`https://mio-assistant-prod.up.railway.app`
3. 复制这个URL

## Vercel 部署

### 第1步：推送到GitHub

同上面的Railway第1步

### 第2步：在Vercel部署

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 选择 "Import Git Repository"
4. 选择 `mio-assistant` 仓库
5. 点击 "Import"

### 第3步：配置环境变量

在Vercel项目设置中：
1. 点击 "Settings" → "Environment Variables"
2. 添加与Railway相同的环境变量

### 第4步：部署

Vercel会自动部署，部署完成后会显示URL。

**注意**: Vercel默认是无服务器函数，需要修改项目结构来支持长连接的Webhook。对于这个项目，Railway是更好的选择。

---

## 在飞书中配置Webhook

部署完成后，你需要在飞书开发者后台配置Webhook URL。

### 步骤：

1. 访问 [飞书开发者后台](https://open.feishu.cn/app)
2. 找到你的应用 "MIO的助理"
3. 进入 "应用功能" → "消息与群组"
4. 在 "事件订阅" 中，更新 **Request URL**：
   - 旧URL: `https://your-domain.com/webhook/message`
   - 新URL: `https://your-railway-url/webhook/message` 或 `https://your-vercel-url/webhook/message`

5. 保存配置
6. 飞书会发送验证请求，如果返回 `challenge`，说明配置成功

---

## 测试部署

### 方法1：使用curl测试

```bash
# 测试健康检查
curl https://your-deployment-url/health

# 应该返回类似：
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","uptime":123.45}
```

### 方法2：在飞书中测试

1. 打开飞书
2. 搜索你的应用 "MIO的助理"
3. 给机器人发送一条消息
4. 机器人应该会回复你

---

## 常见问题

### Q: 部署后消息没有回复
A: 检查以下几点：
- 确认环境变量都正确配置
- 查看Railway/Vercel的日志，看是否有错误
- 确认飞书Webhook URL配置正确
- 确认 `FEISHU_VERIFICATION_TOKEN` 与飞书中配置的一致

### Q: 提示"Webhook连接失败"
A: 
- 检查Railway/Vercel部署是否成功
- 确认Webhook URL是否能访问
- 查看服务器日志

### Q: Claude API返回错误
A:
- 确认 `CLAUDE_API_KEY` 正确且有效
- 检查API配额是否充足
- 确认网络连接正常

---

## 本地开发和测试

如果要在本地测试，可以使用ngrok将本地端口暴露给互联网：

```bash
# 安装ngrok
# 访问 https://ngrok.com

# 启动ngrok
ngrok http 3000

# 会得到一个URL，例如 https://abc123.ngrok.io
# 在飞书Webhook配置中使用 https://abc123.ngrok.io/webhook/message
```

---

## 监控和维护

### 查看日志

**Railway**: 在项目中点击 "Logs" 查看实时日志

**Vercel**: 在项目中点击 "Logs" 查看部署和运行日志

### 更新代码

只需推送新代码到GitHub：
```bash
git add .
git commit -m "Update features"
git push
```

Railway/Vercel 会自动部署新版本。

---

## 删除部署

如果要删除部署：

**Railway**: 在项目设置中点击 "Delete Project"

**Vercel**: 在项目设置中点击 "Delete"
