# AI 模块快速开始指南

## 🚀 5 分钟上手

### 1️⃣ 配置环境变量

```bash
# .env.local

# Claude（当前默认）
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 或使用 DeepSeek
DEEPSEEK_API_KEY=sk-xxxxx
AI_PROVIDER=deepseek
```

### 2️⃣ 基本用法

```typescript
import { createChatCompletion } from '@/lib/ai'

// 简单调用
const result = await createChatCompletion(
  undefined,                      // 无系统提示
  "用户的问题或内容",
  0.7,                           // temperature（可选）
  2000,                          // maxTokens（可选）
  '分析失败，请重试'              // 默认值（可选）
)

// 带系统提示
const result = await createChatCompletion(
  "你是一位专业的分析师",        // 系统提示
  prompt,                        // 用户提示
  0.7,
  2000
)
```

### 3️⃣ 实战示例

```typescript
// app/api/your-service/route.ts
import { createChatCompletion } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    const answer = await createChatCompletion(
      "你是一位智能助手",
      question,
      0.7,
      2000,
      '抱歉，我无法回答这个问题'
    )

    return Response.json({ answer })
  } catch (error) {
    return Response.json(
      { error: '服务暂时不可用' },
      { status: 500 }
    )
  }
}
```

## 📋 常用场景

### 场景 1: 文本分析

```typescript
const analysis = await createChatCompletion(
  "你是一位资深的文本分析师",
  `请分析以下文本：${text}`,
  0.7,
  3000
)
```

### 场景 2: 内容生成

```typescript
const content = await createChatCompletion(
  "你是一位专业的内容创作者",
  `请根据主题"${topic}"生成一篇文章`,
  0.8,  // 提高 temperature 增加创造性
  4000
)
```

### 场景 3: 问答系统

```typescript
const answer = await createChatCompletion(
  "你是一位知识渊博的助手，请简洁准确地回答问题",
  userQuestion,
  0.5,  // 降低 temperature 提高准确性
  1000
)
```

## 🔧 高级用法

### 直接访问客户端

```typescript
import { ai, AI_MODEL, claude, CLAUDE_MODEL } from '@/lib/ai'

// DeepSeek 原生 API
const response = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [
    { role: 'system', content: '系统提示' },
    { role: 'user', content: '用户消息' }
  ],
  temperature: 0.7,
  max_tokens: 2000
})

// Claude 原生 API
const message = await claude.messages.create({
  model: CLAUDE_MODEL,
  max_tokens: 2000,
  temperature: 0.7,
  system: '系统提示',
  messages: [
    { role: 'user', content: '用户消息' }
  ]
})
```

### 检测当前提供商

```typescript
import { getCurrentProvider, isUsingClaude } from '@/lib/ai'

const provider = getCurrentProvider()  // 'claude' 或 'deepseek'

if (isUsingClaude()) {
  console.log('使用 Claude，质量更高，成本较高')
} else {
  console.log('使用 DeepSeek，速度更快，成本更低')
}
```

### 同时使用两个提供商

```typescript
import { createChatCompletion as deepseek } from '@/lib/ai/deepseek'
import { createClaudeChatCompletion as claude } from '@/lib/ai/claude'

// 简单任务用 DeepSeek（省钱）
const simpleResult = await deepseek(
  undefined,
  "简单问题",
  0.7,
  1000
)

// 复杂任务用 Claude（高质量）
const complexResult = await claude(
  "你需要深度思考和推理",
  "复杂问题",
  0.7,
  4000
)
```

## ⚙️ 参数说明

### temperature（温度）

控制输出的随机性和创造性：

```typescript
// 事实性任务 - 低温度
const factual = await createChatCompletion(
  "请准确回答",
  question,
  0.3  // 更确定、更一致
)

// 平衡任务 - 中等温度（推荐）
const balanced = await createChatCompletion(
  "请回答",
  question,
  0.7  // 默认值，平衡性和创造性
)

// 创造性任务 - 高温度
const creative = await createChatCompletion(
  "请发挥创意",
  question,
  1.2  // 更有创造性，但可能不稳定
)
```

### maxTokens（最大 tokens）

控制输出长度和成本：

```typescript
// 简短回答
const short = await createChatCompletion(
  "请简短回答",
  question,
  0.7,
  500   // 约 ~375 中文字
)

// 中等长度
const medium = await createChatCompletion(
  "请详细回答",
  question,
  0.7,
  2000  // 约 ~1500 中文字（默认）
)

// 长篇内容
const long = await createChatCompletion(
  "请全面分析",
  question,
  0.7,
  6000  // 约 ~4500 中文字
)
```

## 🎯 错误处理

### 完整的错误处理

```typescript
async function safeAICall(prompt: string): Promise<string> {
  try {
    return await createChatCompletion(
      "系统提示",
      prompt,
      0.7,
      2000,
      '默认回复'  // API 返回为空时使用
    )
  } catch (error) {
    // API 调用失败
    console.error('AI 调用失败:', error)

    // 返回友好的错误信息
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return '请求过于频繁，请稍后再试'
      }
      if (error.message.includes('insufficient_quota')) {
        return 'API 配额已用尽，请联系管理员'
      }
    }

    return '抱歉，服务暂时不可用，请稍后重试'
  }
}
```

## 📊 成本估算

### DeepSeek 成本（参考）

- 输入：¥0.001 / 1K tokens
- 输出：¥0.002 / 1K tokens

**示例**：1000 次调用，每次 2000 tokens
- 成本：约 ¥4-6

### Claude Sonnet 4 成本（参考）

- 输入：$0.003 / 1K tokens
- 输出：$0.015 / 1K tokens

**示例**：1000 次调用，每次 2000 tokens
- 成本：约 $36-45（¥250-300）

## ✅ 检查清单

开始使用前确认：

- [ ] 已配置 API Key（`ANTHROPIC_API_KEY` 或 `DEEPSEEK_API_KEY`）
- [ ] 已设置 `AI_PROVIDER` 环境变量（或接受默认的 `claude`）
- [ ] 理解 temperature 和 maxTokens 参数的作用
- [ ] 已实现错误处理
- [ ] 已测试基本调用

## 🔗 更多资源

- `README.md` - 完整文档
- `MIGRATION.md` - 迁移指南
- `claude-usage.md` - Claude 详细说明

## 💡 小贴士

1. **开发时使用 DeepSeek**，生产环境根据需求选择
2. **先用低 maxTokens 测试**，避免不必要的成本
3. **缓存常见问题的答案**，减少 API 调用
4. **监控 API 使用量**，避免超额
5. **提供默认值**，确保用户体验不受影响

---

就这么简单！开始使用 AI 功能吧 🚀
