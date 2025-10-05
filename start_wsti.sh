#!/bin/bash

# WSTI热力图启动脚本

echo "🚀 启动NASA WSTI热力图系统..."

# 检查后端是否运行
echo "📡 检查后端服务..."
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "⚠️  后端服务未运行，正在启动..."
    cd backend-fastapi
    python run.py &
    BACKEND_PID=$!
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
    sleep 5
else
    echo "✅ 后端服务已运行"
fi

# 启动前端
echo "🌐 启动前端服务..."
cd tempo-air-quality
npm run dev &
FRONTEND_PID=$!

echo "🎉 系统启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo ""
echo "🛑 停止服务:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📊 WSTI热力图功能:"
echo "   - 实时野火烟雾威胁指数"
echo "   - 覆盖美国全境"
echo "   - 智能数据搜索 (6h→12h→24h)"
echo "   - 数据采样优化性能"
