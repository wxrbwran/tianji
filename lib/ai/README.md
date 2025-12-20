# AI 模块说明

本目录包含所有 AI 提供商的实现和统一接口。

## 目录结构

```
lib/ai/
├── index.ts              # 统一接口（主入口）
├── deepseek.ts          # DeepSeek AI 实现
├── claude.ts            # Claude AI 实现
├── deepseek-usage.md    # DeepSeek 使用文档（如果存在）
└── claude-usage.md      # Claude 使用文档
```

## 快速开始

### 1. 环境变量配置

```env
# .env.local

# DeepSeek 配置
DEEPSEEK_API_KEY=sk-xxxxx

# Claude 配置
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 选择 AI 提供商（可选，默认 'claude'）
AI_PROVIDER=claude  # 或 'deepseek'
```

### 2. 使用统一接口（推荐）

```typescript
import { createChatCompletion } from '@/lib/ai'

// 自动根据 AI_PROVIDER 环境变量选择提供商
const result = await createChatCompletion(
  "你是一位专业的分析师",  // systemPrompt (可选)
  prompt,                    // userPrompt
  0.7,                       // temperature (可选，默认 0.7)
  2000,                      // maxTokens (可选，默认 2000)
  '分析失败'                 // defaultValue (可选)
)
```

### 3. 直接使用特定提供商

#### DeepSeek

```typescript
import { createChatCompletion } from '@/lib/ai/deepseek'

const result = await createChatCompletion(
  "系统提示",
  "用户提示",
  0.7,
  2000
)
```

#### Claude

```typescript
import { createClaudeChatCompletion } from '@/lib/ai/claude'

const result = await createClaudeChatCompletion(
  "系统提示",
  "用户提示",
  0.7,
  2000
)
```

### 4. 直接访问客户端实例（用于高级用法）

```typescript
import { ai, AI_MODEL, claude, CLAUDE_MODEL } from '@/lib/ai'

// DeepSeek 客户端
const deepseekResponse = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [{ role: 'user', content: 'Hello' }]
})

// Claude 客户端
const claudeResponse = await claude.messages.create({
  model: CLAUDE_MODEL,
  max_tokens: 1000,
  messages: [{ role: 'user', content: 'Hello' }]
})
```

## 导出内容

### 从 `@/lib/ai` (index.ts) 导出

#### 方法
- `createChatCompletion()` - 统一的聊天完成方法，根据环境变量自动选择提供商
- `getCurrentProvider()` - 获取当前使用的提供商名称
- `isUsingClaude()` - 检查是否使用 Claude
- `isUsingDeepSeek()` - 检查是否使用 DeepSeek

#### 客户端实例和常量
- `ai` - DeepSeek OpenAI 客户端实例
- `AI_MODEL` - DeepSeek 模型名称 ('deepseek-chat')
- `claude` - Claude Anthropic 客户端实例
- `CLAUDE_MODEL` - Claude 模型名称 ('claude-sonnet-4-5-20250929')

### 从 `@/lib/ai/deepseek` 导出

- `ai` - OpenAI 客户端实例
- `AI_MODEL` - 模型名称常量
- `createChatCompletion()` - DeepSeek 聊天完成方法

### 从 `@/lib/ai/claude` 导出

- `claude` - Anthropic 客户端实例
- `CLAUDE_MODEL` - 模型名称常量
- `createClaudeChatCompletion()` - Claude 聊天完成方法

## 方法签名

```typescript
// DeepSeek
createChatCompletion(
  systemPrompt: string | undefined,
  userPrompt: string,
  temperature?: number,        // 默认 0.7
  maxTokens?: number,          // 默认 2000
  defaultValue?: string        // 默认 '分析生成失败，请稍后重试'
): Promise<string>

// Claude
createClaudeChatCompletion(
  systemPrompt: string | undefined,
  userPrompt: string,
  temperature?: number,        // 默认 0.7
  maxTokens?: number,          // 默认 2000
  defaultValue?: string        // 默认 '分析生成失败，请稍后重试'
): Promise<string>
```

## 使用示例

### API 路由中使用

```typescript
// app/api/dream/interpret/route.ts
import { createChatCompletion } from '@/lib/ai'

async function generateAIInterpretation(request: any, analysis: any): Promise<string> {
  try {
    const prompt = `分析内容...`

    return await createChatCompletion(
      "你是一位专业的分析师",
      prompt,
      0.7,
      1800,
      '分析失败'
    )
  } catch (error) {
    console.error('AI error:', error)
    return '系统分析：...'
  }
}
```

### 检查当前提供商

```typescript
import { getCurrentProvider, isUsingClaude } from '@/lib/ai'

console.log('当前 AI:', getCurrentProvider())  // 'claude' 或 'deepseek'

if (isUsingClaude()) {
  console.log('使用 Claude，质量更高')
} else {
  console.log('使用 DeepSeek，成本更低')
}
```

## 切换提供商

只需修改环境变量 `AI_PROVIDER`：

```bash
# 使用 Claude
AI_PROVIDER=claude

# 使用 DeepSeek
AI_PROVIDER=deepseek
```

代码无需任何改动！

## 特性对比

| 特性 | DeepSeek | Claude Sonnet 4.5 |
|------|----------|-------------------|
| **模型** | deepseek-chat | claude-sonnet-4-5-20250929 |
| **成本** | 低 | 中-高 |
| **速度** | 快 | 中 |
| **理解能力** | 良好 | 优秀 |
| **中文支持** | 优秀 | 优秀 |
| **上下文窗口** | 大 | 超大 (200K) |
| **推荐场景** | 大批量、成本敏感 | 高质量、复杂推理 |

## 注意事项

1. **API Key 安全**: 不要将 API Key 提交到代码仓库
2. **环境变量**: 确保在 `.env.local` 中配置了相应的 API Key
3. **错误处理**: 始终使用 try-catch 包裹 AI 调用
4. **默认值**: 为每个调用提供合理的默认返回值
5. **成本控制**: 注意监控 API 使用量和成本
