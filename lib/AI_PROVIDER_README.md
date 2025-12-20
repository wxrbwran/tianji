# AI 提供商配置指南

本项目支持两种 AI 提供商：**DeepSeek** 和 **Claude**

## 快速开始

### 1. 使用 DeepSeek（默认）

```env
# .env.local
DEEPSEEK_API_KEY=your_deepseek_api_key
AI_PROVIDER=deepseek  # 可选，默认就是 deepseek
```

### 2. 使用 Claude

```env
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key
AI_PROVIDER=claude
```

## 代码使用

### 方式 1：使用统一接口（推荐）

```typescript
import { createChatCompletion } from '@/lib/ai-provider'

// 自动根据环境变量选择 AI 提供商
const result = await createChatCompletion(
  "你是一位专业的分析师",
  prompt,
  0.7,
  2000,
  '分析失败'
)
```

**优势**：
- 只需修改环境变量即可切换 AI 提供商
- 代码无需改动
- 便于 A/B 测试

### 方式 2：直接指定提供商

#### 使用 DeepSeek

```typescript
import { createChatCompletion } from '@/lib/ai'

const result = await createChatCompletion(
  "你是一位专业的分析师",
  prompt,
  0.7,
  2000
)
```

#### 使用 Claude

```typescript
import { createClaudeChatCompletion } from '@/lib/claudeAi'

const result = await createClaudeChatCompletion(
  "你是一位专业的分析师",
  prompt,
  0.7,
  2000
)
```

## 功能特性对比

| 特性 | DeepSeek | Claude Sonnet 4 |
|------|----------|-----------------|
| **成本** | 低 | 中-高 |
| **速度** | 快 | 中 |
| **理解能力** | 良好 | 优秀 |
| **中文支持** | 优秀 | 优秀 |
| **上下文窗口** | 大 | 超大 |
| **推荐场景** | 大批量分析、成本敏感 | 高质量分析、复杂推理 |

## 实际使用示例

### 示例 1：在 API 路由中使用统一接口

```typescript
// app/api/dream/interpret/route.ts
import { createChatCompletion } from '@/lib/ai-provider'

async function generateAIInterpretation(
  request: DreamRequest,
  analysis: any
): Promise<string> {
  try {
    const prompt = `作为一位专业的心理分析师...`

    // 会根据 AI_PROVIDER 环境变量自动选择提供商
    return await createChatCompletion(
      "你是一位经验丰富的心理分析师和解梦专家...",
      prompt,
      0.7,
      1800,
      '解读生成失败，请稍后重试'
    )
  } catch (error) {
    console.error('AI interpretation error:', error)
    return '系统解读：...'
  }
}
```

### 示例 2：根据功能选择不同的提供商

```typescript
// 对于简单分析，使用 DeepSeek
import { createChatCompletion as deepseekChat } from '@/lib/ai'

const simpleAnalysis = await deepseekChat(
  undefined,
  "简单问题...",
  0.7,
  1000
)

// 对于复杂分析，使用 Claude
import { createClaudeChatCompletion as claudeChat } from '@/lib/claudeAi'

const complexAnalysis = await claudeChat(
  "你需要进行深度推理和分析...",
  "复杂问题...",
  0.7,
  4000
)
```

## 辅助方法

```typescript
import {
  getCurrentProvider,
  isUsingClaude,
  isUsingDeepSeek
} from '@/lib/ai-provider'

// 获取当前使用的 AI 提供商
console.log('当前 AI:', getCurrentProvider())  // 'deepseek' 或 'claude'

// 检查使用的是哪个提供商
if (isUsingClaude()) {
  console.log('正在使用 Claude AI')
}

if (isUsingDeepSeek()) {
  console.log('正在使用 DeepSeek AI')
}
```

## 迁移指南

### 从直接使用改为统一接口

**修改前：**
```typescript
import { createChatCompletion } from '@/lib/ai'
```

**修改后：**
```typescript
import { createChatCompletion } from '@/lib/ai-provider'
```

就这么简单！函数签名完全相同，无需修改任何调用代码。

## 环境变量完整配置

```env
# .env.local

# DeepSeek 配置（默认）
DEEPSEEK_API_KEY=sk-xxxxx

# Claude 配置（可选）
ANTHROPIC_API_KEY=sk-ant-xxxxx

# AI 提供商选择
# 可选值: 'deepseek' | 'claude'
# 默认: 'deepseek'
AI_PROVIDER=deepseek
```

## 注意事项

1. **API Key 安全**：不要将 API Key 提交到代码仓库
2. **成本控制**：注意监控 API 使用量和成本
3. **错误处理**：始终使用 try-catch 包裹 AI 调用
4. **默认值**：为每个调用提供合理的默认返回值
5. **Token 限制**：注意不同模型的 token 限制

## 文件说明

- `lib/ai.ts` - DeepSeek AI 实现
- `lib/claudeAi.ts` - Claude AI 实现
- `lib/ai-provider.ts` - 统一接口，根据环境变量自动选择
- `lib/ai-usage.md` - DeepSeek 使用说明
- `lib/claude-ai-usage.md` - Claude 使用说明
