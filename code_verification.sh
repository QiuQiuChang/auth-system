#!/bin/bash
echo "=========================================="
echo "深度代码验证"
echo "=========================================="
echo ""

echo "=== 后端代码检查 ==="
echo ""
echo "1. ChatController - 检查vision端点和依赖注入:"
grep -A 3 "MultimodalChatService\|@PostMapping.*vision" backend/src/main/java/com/auth/controller/ChatController.java | head -15
echo ""

echo "2. MultimodalChatService - 检查核心方法:"
grep -A 2 "public ChatResponse chatWithVision" backend/src/main/java/com/auth/service/MultimodalChatService.java
echo ""

echo "3. FileUploadController - 检查上传接口:"
grep -A 2 "@PostMapping.*image" backend/src/main/java/com/auth/controller/FileUploadController.java
echo ""

echo "=== 前端代码检查 ==="
echo ""
echo "4. ChatPageMultimodal - 检查关键功能:"
grep -n "handleImageUpload\|sendVisionMessage\|Upload.*beforeUpload" frontend/src/pages/ChatPageMultimodal.jsx | head -5
echo ""

echo "5. chat.js - 检查API方法:"
grep -A 2 "sendVisionMessage\|sendMessage" frontend/src/api/chat.js
echo ""

echo "6. App.jsx - 检查路由配置:"
grep -B 1 -A 1 "ChatPage\|ChatPageMultimodal" frontend/src/App.jsx | head -5
echo ""

echo "=========================================="
echo "验证总结"
echo "=========================================="
