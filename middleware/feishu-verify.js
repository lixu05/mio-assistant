import crypto from 'crypto';
import config from '../config.js';

export function verifyFeishuRequest(req, res, next) {
  const expected = config.feishu.verificationToken;
  const token = req.body?.header?.token ?? req.body?.token;
  if (!expected) return res.status(503).json({ error: 'Verification token is not configured' });
  if (req.body?.encrypt) return res.status(400).json({ error: 'Encrypted events are not configured' });
  const actual = Buffer.from(typeof token === 'string' ? token : '');
  const target = Buffer.from(expected);
  if (actual.length !== target.length || !crypto.timingSafeEqual(actual, target)) {
    return res.status(401).json({ error: 'Invalid verification token' });
  }
  next();
}
