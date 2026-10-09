#!/bin/bash

# MIO的助理 快速启动脚本

echo "🚀 MIO的助理 - 快速启动向导"
echo "================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "请访问 https://nodejs.org/ 安装 Node.js 18+版本"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 正在安装依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env 文件不存在"
    echo "正在创建 .env 文件..."
    cp .env.example .env
    echo ""
    echo "📝 请编辑 .env 文件，填入以下信息："
    echo "   - FEISHU_APP_ID"
    echo "   - FEISHU_APP_SECRET"
    echo "   - FEISHU_VERIFICATION_TOKEN"
    echo "   - CLAUDE_API_KEY"
    echo ""
    echo "编辑完成后，再次运行此脚本"
    exit 1
fi

# 检查环境变量
if grep -q "your_" .env; then
    echo "❌ .env 文件中还有未填入的值"
    echo "请编辑 .env 文件，替换所有 'your_' 开头的占位符"
    exit 1
fi

echo ""
echo "✅ 配置完整"
echo ""
echo "🎯 启动模式选择:"
echo "   1) 开发模式（支持热重载）"
echo "   2) 生产模式"
echo ""
read -p "请选择 (1 或 2): " mode

if [ "$mode" = "1" ]; then
    echo ""
    echo "🔄 启动开发模式..."
    echo "💡 提示: 修改代码后会自动重启"
    echo "按 Ctrl+C 停止服务器"
    echo ""
    npm run dev
elif [ "$mode" = "2" ]; then
    echo ""
    echo "🚀 启动生产模式..."
    echo "按 Ctrl+C 停止服务器"
    echo ""
    npm start
else
    echo "❌ 无效选择"
    exit 1
fi
