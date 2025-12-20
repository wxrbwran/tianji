# Claude AI 使用说明

## 环境变量配置

在 `.env.local` 中添加：

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 方法签名

```typescript
export async function createClaudeChatCompletion(
    systemPrompt: string | undefined,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000,
    defaultValue: string = '分析生成失败，请稍后重试'
): Promise<string>
```

## 使用示例

### 1. 带系统提示的调用

```typescript
import { createClaudeChatCompletion } from '@/lib/claudeAi'

const result = await createClaudeChatCompletion(
  "你是一位专业的命理分析师，擅长八字分析",
  prompt,
  0.7,
  2000,
  '分析生成失败，请稍后重试'
)
```

### 2. 不带系统提示的调用

```typescript
import { createClaudeChatCompletion } from '@/lib/claudeAi'

const result = await createClaudeChatCompletion(
  undefined,  // 无系统提示
  prompt,
  0.7,
  6000
)
```

### 3. 在 API 路由中使用

```typescript
// app/api/dream/interpret/route.ts
import { createClaudeChatCompletion } from '@/lib/claudeAi'

async function generateAIInterpretation(request: DreamRequest, analysis: any): Promise<string> {
  try {
    const prompt = `作为一位专业的心理分析师和解梦专家...`

    return await createClaudeChatCompletion(
      "你是一位经验丰富的心理分析师和解梦专家...",
      prompt,
      0.7,
      1800,
      '解读生成失败，请稍后重试'
    )

  } catch (error) {
    console.error('AI interpretation error:', error)
    return `系统解读：这是一个关于梦境的分析...`
  }
}
```

## DeepSeek vs Claude 对比

### DeepSeek AI (ai.ts)

```typescript
import { createChatCompletion } from '@/lib/ai'

const result = await createChatCompletion(
  "你是一位专业的分析师",
  prompt,
  0.7,
  2000,
  '分析失败'
)
```

- **模型**: deepseek-chat
- **优势**: 成本低，速度快
- **适用场景**: 大批量分析，成本敏感场景

### Claude AI (claudeAi.ts)

```typescript
import { createClaudeChatCompletion } from '@/lib/claudeAi'

const result = await createClaudeChatCompletion(
  "你是一位专业的分析师",
  prompt,
  0.7,
  2000,
  '分析失败'
)
```

- **模型**: claude-sonnet-4-20250514
- **优势**: 理解力强，输出质量高
- **适用场景**: 需要高质量分析，复杂推理场景

## 切换 AI 提供商

如果需要在 DeepSeek 和 Claude 之间切换，只需要修改导入语句：

### 方式 1：直接替换导入

```typescript
// 使用 DeepSeek
import { createChatCompletion } from '@/lib/ai'
const result = await createChatCompletion(...)

// 切换到 Claude
import { createClaudeChatCompletion as createChatCompletion } from '@/lib/claudeAi'
const result = await createChatCompletion(...)
```

### 方式 2：创建统一接口

在 `lib/ai-provider.ts` 中：

```typescript
// lib/ai-provider.ts
import { createChatCompletion as deepseekChat } from '@/lib/ai'
import { createClaudeChatCompletion as claudeChat } from '@/lib/claudeAi'

// 通过环境变量选择
const AI_PROVIDER = process.env.AI_PROVIDER || 'deepseek'

export const createChatCompletion = AI_PROVIDER === 'claude'
  ? claudeChat
  : deepseekChat
```

然后在 API 中：

```typescript
import { createChatCompletion } from '@/lib/ai-provider'

// 自动使用环境变量指定的 AI 提供商
const result = await createChatCompletion(...)
```

## 实现细节差异

### OpenAI/DeepSeek SDK

```typescript
const completion = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature,
  max_tokens: maxTokens
})

return completion.choices[0]?.message?.content || defaultValue
```

### Anthropic Claude SDK

```typescript
const message = await claude.messages.create({
  model: CLAUDE_MODEL,
  max_tokens: maxTokens,
  temperature: temperature,
  system: systemPrompt,  // system 是单独参数
  messages: [
    { role: 'user', content: userPrompt }
  ]
})

// content 是数组，需要查找文本块
const textContent = message.content.find(block => block.type === 'text')
return textContent?.type === 'text' ? textContent.text : defaultValue
```

## 注意事项

1. **API Key**: 确保设置 `ANTHROPIC_API_KEY` 环境变量
2. **模型版本**: 当前使用 `claude-sonnet-4-20250514`，可根据需要调整
3. **Token 限制**: Claude Sonnet 4 支持更大的上下文窗口
4. **成本**: Claude 的价格通常高于 DeepSeek，请根据场景选择
5. **响应格式**: Claude 的响应是 content 数组，需要提取文本块
