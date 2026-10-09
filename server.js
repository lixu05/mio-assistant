import express from 'express';
import bodyParser from 'body-parser';
import config from './config.js';
import { verifyFeishuRequest } from './middleware/feishu-verify.js';
import webhookRouter from './routes/webhook.js';

const app = express();

// 中间件：保存原始body用于验证
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk.toString('utf8');
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

// JSON解析中间件
app.use(bodyParser.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 验证飞书请求签名（对webhook端点）
app.use('/webhook', verifyFeishuRequest);

// 路由
app.use('/webhook', webhookRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 首页
app.get('/', (req, res) => {
  res.json({
    name: 'MIO的助理',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      webhook: '/webhook/message',
      notify: '/webhook/notify',
    },
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '端点不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    error: '内部服务器错误',
    message: config.server.nodeEnv === 'development' ? err.message : undefined,
  });
});

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 MIO的助理 已启动`);
  console.log(`📍 服务器运行在 http://localhost:${PORT}`);
  console.log(`🔗 Webhook地址: http://localhost:${PORT}/webhook/message`);
  console.log(`💬 环境: ${config.server.nodeEnv}`);
  console.log('\n等待飞书消息...\n');
});

export default app;
