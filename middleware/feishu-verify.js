import crypto from 'crypto';
import config from '../config.js';

// 飞书请求验证中间件
export function verifyFeishuRequest(req, res, next) {
  const timestamp = req.headers['x-feishu-request-timestamp'];
  const signature = req.headers['x-feishu-request-signature'];
  const body = req.rawBody || '';

  if (!timestamp || !signature) {
    console.warn('缺少验证头');
    return res.status(401).json({ error: '未授权' });
  }

  // 计算签名
  const signContent = timestamp + '\n' + config.feishu.verificationToken;
  const computedSignature = crypto
    .createHmac('sha256', config.feishu.verificationToken)
    .update(signContent)
    .digest('base64');

  if (signature !== computedSignature) {
    console.warn('签名验证失败');
    return res.status(401).json({ error: '签名验证失败' });
  }

  next();
}
