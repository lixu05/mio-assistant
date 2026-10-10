import express from 'express';
import config from '../config.js';
import messageHandler from '../services/message-handler.js';

const router = express.Router();

// Suppress Feishu retries within this process, including in-flight requests.
const handledEvents = new Map();
router.post('/message', (req, res) => {
  const { type, challenge, header, event } = req.body || {};
  if (type === 'url_verification') {
    if (typeof challenge !== 'string') return res.status(400).json({ error: 'Missing challenge' });
    console.log('Feishu URL verification succeeded');
    return res.json({ challenge });
  }
  const eventType = header?.event_type;
  console.log('Feishu event:', eventType || 'unknown', header?.event_id || '');
  if (eventType !== 'im.message.receive_v1') return res.json({ code: 0 });
  if (!event?.message?.message_id || !event?.sender?.sender_id) {
    return res.status(400).json({ error: 'Invalid message event' });
  }
  if (event.sender.sender_type === 'app') return res.json({ code: 0 });
  const id = header.event_id || event.message.message_id;
  const now = Date.now();
  for (const [key, expires] of handledEvents) if (expires < now) handledEvents.delete(key);
  if (handledEvents.has(id)) return res.json({ code: 0 });
  handledEvents.set(id, now + 10 * 60 * 1000);
  res.json({ code: 0 });
  setImmediate(async () => {
    try {
      const result = event.message.chat_type === 'group'
        ? await messageHandler.handleGroupMessage(event)
        : await messageHandler.handleIncomingMessage(event);
      if (!result.success) console.error('Message processing failed:', result.error);
    } catch (error) {
      console.error('Message processing failed:', error.message);
    }
  });
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
    if (!process.env.NOTIFY_TOKEN || token !== process.env.NOTIFY_TOKEN) {
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
