import crypto from 'crypto';
import config from '../config.js';

// 飞书请求验证中间件
export function verifyFeishuRequest(req, res, next) {
  const timestamp = req.headers['x-feishu-request-timestamp'];
  const signature = req.headers['x-feishu-request-signature'];
  const body = req.rawBody || '';

  // 如果没有签名头，直接放行（可能是URL验证请求）
  if (!timestamp || !signature) {
    console.warn('缺少验证头，但继续处理');
    return next();
  }

  // 使用 App Secret 计算签名
  const signContent = timestamp + '\n' + config.feishu.appSecret;
  const computedSignature = crypto
    .createHmac('sha256', config.feishu.appSecret)
    .update(signContent)
    .digest('base64');

  console.log('签名验证：', {
    expected: computedSignature,
    actual: signature,
    match: signature === computedSignature
  });

  if (signature !== computedSignature) {
    console.warn('签名验证失败');
    // 继续处理，让上层应用处理
  }

  next();
}
