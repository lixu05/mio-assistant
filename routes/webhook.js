import express from 'express';
import crypto from 'crypto';
import config from '../config.js';
import messageHandler from '../services/message-handler.js';

const router = express.Router();

// 处理飞书Webhook请求
router.post('/message', async (req, res) => {
  console.log('=== 收到飞书Webhook请求 ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  const { token, challenge, ts, type, event } = req.body;

  // 处理飞书的challenge请求（初始验证）- 最优先处理
  if (type === 'url_verification') {
    console.log('✅ 处理URL验证请求，返回challenge');
    return res.json({ challenge });
  }

  // 处理事件回调
  if (type === 'event_callback') {
    console.log('✅ 处理事件回调');
    // 继续处理，不中断
  }

  // 处理事件
  if (type === 'event_callback') {
    console.log('收到事件回调:', event?.header?.event_type);

    // 异步处理消息，立即返回200响应
    setImmediate(async () => {
      try {
        const eventType = event?.header?.event_type;

        if (eventType === 'im.message.receive_v1') {
          const messageEvent = event;

          // 判断是否为群组消息
          if (messageEvent.message.chat_type === 'group') {
            await messageHandler.handleGroupMessage(messageEvent);
          } else {
            // 个人消息
            await messageHandler.handleIncomingMessage(messageEvent);
          }
        }
      } catch (error) {
        console.error('处理事件失败:', error.message);
      }
    });

    // 立即返回200，告诉飞书已收到
    return res.json({ code: 0, msg: 'ok' });
  }

  res.json({ code: 0, msg: 'ok' });
});

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 发送定时通知的端点（可用于外部触发）
router.post('/notify', async (req, res) => {
  try {
    const { message, channelId, token } = req.body;

    // 简单的token验证
    if (token !== process.env.NOTIFY_TOKEN) {
      return res.status(401).json({ error: '未授权' });
    }

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const result = await messageHandler.sendScheduledNotification(
      message,
      channelId || config.notifyChannelId
    );

    res.json(result);
  } catch (error) {
    console.error('发送通知失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
