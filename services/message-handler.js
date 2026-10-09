import feishuService from './feishu.js';
import claudeService from './claude.js';

class MessageHandler {
  // 处理接收到的消息
  async handleIncomingMessage(messageEvent) {
    try {
      const message = messageEvent.message;
      const sender = message.sender;
      const content = message.content;

      console.log('收到消息:', {
        senderId: sender.sender_id.user_id,
        messageType: message.message_type,
        content,
      });

      // 解析消息内容
      let userMessage = '';

      if (message.message_type === 'text') {
        const contentObj = JSON.parse(content);
        userMessage = contentObj.text;
      } else {
        userMessage = `[${message.message_type}类型消息]`;
      }

      // 使用Claude处理用户消息
      const reply = await claudeService.processMessage(
        sender.sender_id.user_id,
        userMessage
      );

      // 回复消息
      await feishuService.sendMessage(sender.sender_id.user_id, reply);

      console.log('消息已回复');
      return {
        success: true,
        reply,
      };
    } catch (error) {
      console.error('处理消息失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 处理群组消息
  async handleGroupMessage(messageEvent) {
    try {
      const message = messageEvent.message;
      const sender = message.sender;
      const content = message.content;
      const chatId = message.chat_id;

      console.log('收到群组消息:', {
        chatId,
        senderId: sender.sender_id.user_id,
      });

      let userMessage = '';

      if (message.message_type === 'text') {
        const contentObj = JSON.parse(content);
        userMessage = contentObj.text;
      } else {
        return {
          success: true,
          message: '跳过非文本消息',
        };
      }

      // 检查是否@了机器人
      if (!userMessage.includes('@')) {
        return {
          success: true,
          message: '跳过未提及机器人的消息',
        };
      }

      // 清理@符号
      const cleanMessage = userMessage.replace(/@\S+\s*/g, '').trim();

      if (!cleanMessage) {
        return {
          success: true,
          message: '消息为空',
        };
      }

      // 使用Claude处理消息
      const reply = await claudeService.analyzeMessage(cleanMessage);

      // 回复群组消息
      await feishuService.sendGroupMessage(chatId, reply);

      console.log('群组消息已回复');
      return {
        success: true,
        reply,
      };
    } catch (error) {
      console.error('处理群组消息失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 发送定时通知
  async sendScheduledNotification(message, channelId) {
    try {
      if (!channelId) {
        throw new Error('没有配置通知频道ID');
      }

      await feishuService.sendGroupMessage(channelId, message);

      console.log('定时通知已发送');
      return {
        success: true,
      };
    } catch (error) {
      console.error('发送定时通知失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new MessageHandler();
