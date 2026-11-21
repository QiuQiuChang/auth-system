#!/bin/bash

# 测试硅基流动 API 的请求格式

API_KEY="sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi"
API_URL="https://api.siliconflow.cn/v1/chat/completions"

echo "=== 测试普通对话请求 ==="
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }' 2>&1 | head -50

echo ""
echo ""
echo "=== 测试流式对话请求 ==="
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 100,
    "stream": true
  }' 2>&1 | head -50
