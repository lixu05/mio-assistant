import axios from 'axios';
import config from '../config.js';

const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

class FeishuService {
  constructor() {
    this.appId = config.feishu.appId;
    this.appSecret = config.feishu.appSecret;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  // 获取 tenant access token
  async getTenantAccessToken() {
    // 检查缓存的token是否仍然有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`,
        {
          app_id: this.appId,
          app_secret: this.appSecret,
        }
      );

      if (response.data.code !== 0 || !response.data.tenant_access_token) throw new Error(`Feishu token error: ${response.data.code} ${response.data.msg}`);
      this.accessToken = response.data.tenant_access_token;
      // token有效期通常为2小时，提前5分钟刷新
      this.tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('获取飞书token失败:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBotOpenId() {
    if (config.feishu.botOpenId) return config.feishu.botOpenId;
    if (this.botOpenId) return this.botOpenId;
    const token = await this.getTenantAccessToken();
    const response = await axios.get(`${FEISHU_API_BASE}/bot/v3/info`, {
      headers: { Authorization: `Bearer ${token}` }, timeout: 20000
    });
    if (response.data.code !== 0 || !response.data.bot?.open_id) throw new Error('Cannot identify Feishu bot');
    this.botOpenId = response.data.bot.open_id;
    return this.botOpenId;
  }

  async replyMessage(messageId, content) {
    const token = await this.getTenantAccessToken();
    const response = await axios.post(
      `${FEISHU_API_BASE}/im/v1/messages/${encodeURIComponent(messageId)}/reply`,
      { msg_type: 'text', content: JSON.stringify({ text: content }) },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
    );
    if (response.data.code !== 0) throw new Error(`Feishu reply error: ${response.data.code} ${response.data.msg}`);
    console.log('Feishu reply delivered');
    return response.data;
  }

  // 发送消息
  async sendMessage(receiveId, content, msgType = 'text') {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.post(
        `${FEISHU_API_BASE}/im/v1/messages?receive_id_type=open_id`,
        {
          receive_id: receiveId,
          msg_type: msgType,
          content: JSON.stringify({
            text: content,
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('消息发送成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 发送群组消息
  async sendGroupMessage(chatId, content, msgType = 'text') {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.post(
        `${FEISHU_API_BASE}/im/v1/messages?receive_id_type=chat_id`,
        {
          receive_id: chatId,
          msg_type: msgType,
          content: JSON.stringify({
            text: content,
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('发送群组消息失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 获取用户信息
  async getUserInfo(userId) {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.get(
        `${FEISHU_API_BASE}/contact/v3/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('获取用户信息失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new FeishuService();
