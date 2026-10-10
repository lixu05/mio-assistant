import Anthropic from '@anthropic-ai/sdk';
import config from '../config.js';

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey,
      baseURL: config.claude.baseURL,
      timeout: 60000,
      maxRetries: 1,
    });
    this.conversationHistory = new Map(); // 存储用户的对话历史
  }

  // 调用Claude处理消息
  async processMessage(userId, userMessage) {
    try {
      // 获取或初始化用户的对话历史
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }

      const history = this.conversationHistory.get(userId);

      // 添加用户消息到历史
      history.push({
        role: 'user',
        content: userMessage,
      });

      // 调用Claude API
      const response = await this.client.messages.create({
        model: config.claude.model,
        max_tokens: 1024,
        system: '你是MIO的助理，一个友好、有帮助的AI助手。你可以帮助用户回答问题、提供建议和进行对话。使用简洁、清晰的语言进行回复。',
        messages: history,
      });

      const assistantMessage = response.content[0].text;

      // 添加助手回复到历史
      history.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // 保持对话历史在合理大小（最多保留最后10条消息）
      if (history.length > 20) {
        this.conversationHistory.set(userId, history.slice(-20));
      }

      return assistantMessage;
    } catch (error) {
      console.error('Claude API调用失败:', error.message);
      throw error;
    }
  }

  // 清除用户的对话历史
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  // 分析消息内容（不保存历史）
  async analyzeMessage(message) {
    try {
      const response = await this.client.messages.create({
        model: config.claude.model,
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `请简要分析以下消息：\n\n${message}`,
          },
        ],
      });

      return response.content[0].text;
    } catch (error) {
      console.error('消息分析失败:', error.message);
      throw error;
    }
  }
}

export default new ClaudeService();
