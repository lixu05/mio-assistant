import dotenv from 'dotenv';

dotenv.config();

export const config = {
  feishu: {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    verificationToken: process.env.FEISHU_VERIFICATION_TOKEN,
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  notifyChannelId: process.env.NOTIFY_CHANNEL_ID,
};

export default config;
