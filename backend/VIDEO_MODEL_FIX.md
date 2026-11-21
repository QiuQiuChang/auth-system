# 视频生成模型修复说明

## 问题原因

Replicate 上的 `lucataco/cogvideox-5b` 模型版本不存在或需要特殊权限。

## 解决方案

已更换为 **Tencent Hunyuan Video** 模型，这是 Replicate 上公开可用的视频生成模型。

## 修改内容

### 更新的模型信息

```java
// 旧模型（不可用）
lucataco/cogvideox-5b:49cba96826b8e1a1c9015dd14f0595026d8b763b3329c13493435c964c2c09b8

// 新模型（可用）✅
tencent/hunyuan-video:6c9132aee14409cd6568d030453f1ba50f5f3412b844fe67f78a9eb62d55664f
```

### 参数调整

```java
// 旧参数
input.put("num_frames", 50);

// 新参数
input.put("video_length", "5s");  // Hunyuan Video 使用时长参数
```

## Hunyuan Video 特性

- ✅ 生成时长：5秒
- ✅ 分辨率：720p
- ✅ 质量：高质量
- ✅ 速度：约 60-90 秒

## 下一步

**重启服务**：
```bash
./start-backend.sh
```

重启后再次测试视频生成功能即可！
