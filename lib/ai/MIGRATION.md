# AI 模块重构迁移指南

## 📁 目录结构变更

### 重构前
```
lib/
├── ai.ts
├── claudeAi.ts
├── ai-provider.ts
├── ai-usage.md
├── claude-ai-usage.md
└── AI_PROVIDER_README.md
```

### 重构后
```
lib/ai/
├── index.ts              # 统一接口（主入口）
├── deepseek.ts          # DeepSeek 实现（原 ai.ts）
├── claude.ts            # Claude 实现（原 claudeAi.ts）
├── README.md            # 使用指南
├── claude-usage.md      # Claude 详细文档
└── MIGRATION.md         # 本文档
```

## 🔄 导入路径变更

### 情况 1: 使用 `createChatCompletion` 方法

**✅ 无需修改！**

```typescript
// 原来的导入（仍然有效）
import { createChatCompletion } from '@/lib/ai'

// 现在指向 lib/ai/index.ts，自动根据环境变量选择提供商
const result = await createChatCompletion(...)
```

由于 TypeScript 会自动将 `@/lib/ai` 解析为 `@/lib/ai/index.ts`，所以所有现有代码都无需修改！

### 情况 2: 使用 `ai` 或 `AI_MODEL` 直接访问

**✅ 无需修改！**

```typescript
// 原来的导入（仍然有效）
import { ai, AI_MODEL } from '@/lib/ai'

// 现在从 lib/ai/index.ts re-export
const response = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [...]
})
```

### 情况 3: 新增 - 直接使用特定提供商

```typescript
// 如果只想使用 DeepSeek
import { createChatCompletion } from '@/lib/ai/deepseek'

// 如果只想使用 Claude
import { createClaudeChatCompletion } from '@/lib/ai/claude'
```

## 📊 影响的文件

以下文件的导入路径**无需修改**，因为它们都使用 `@/lib/ai`：

- ✅ `app/api/bazi/analyze/route.ts`
- ✅ `app/api/hepan/analyze/route.ts`
- ✅ `app/api/name/analyze/route.ts`
- ✅ `app/api/bugua/analyze/route.ts`
- ✅ `app/api/dream/interpret/route.ts`
- ✅ `app/api/health/ai/route.ts`

## 🎯 行为变更

### 默认 AI 提供商

**重要变更**: 默认 AI 提供商已从 `deepseek` 改为 `claude`

```typescript
// lib/ai/index.ts
const AI_PROVIDER = process.env.AI_PROVIDER || 'claude'  // 默认使用 Claude
```

**如何恢复旧行为**:
```env
# .env.local
AI_PROVIDER=deepseek
```

### 环境变量

两个提供商现在都需要配置：

```env
# .env.local

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxx

# Claude (新增)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 选择提供商
AI_PROVIDER=claude  # 或 'deepseek'
```

## 🚀 新功能

### 1. 统一接口自动选择

```typescript
import { createChatCompletion } from '@/lib/ai'

// 根据 AI_PROVIDER 环境变量自动选择
const result = await createChatCompletion(...)
```

### 2. 提供商检测工具

```typescript
import {
  getCurrentProvider,
  isUsingClaude,
  isUsingDeepSeek
} from '@/lib/ai'

console.log('当前 AI:', getCurrentProvider())

if (isUsingClaude()) {
  // Claude 特定逻辑
}
```

### 3. 同时访问两个提供商

```typescript
import { ai, claude } from '@/lib/ai'

// 可以同时使用两个提供商
const deepseekResult = await ai.chat.completions.create(...)
const claudeResult = await claude.messages.create(...)
```

## ✅ 测试清单

在部署前，请确认：

- [ ] 设置了 `ANTHROPIC_API_KEY` 环境变量（如果使用 Claude）
- [ ] 设置了 `DEEPSEEK_API_KEY` 环境变量（如果使用 DeepSeek）
- [ ] 设置了 `AI_PROVIDER` 环境变量（或接受默认的 `claude`）
- [ ] 所有 API 端点正常工作
- [ ] 健康检查端点 `/api/health/ai` 正常
- [ ] AI 响应质量符合预期

## 🔧 故障排除

### 问题 1: 找不到模块 '@/lib/ai'

**原因**: TypeScript 配置问题

**解决**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"]
    }
  }
}
```

### 问题 2: AI 调用失败

**检查**:
1. 环境变量是否正确设置
2. `AI_PROVIDER` 值是否为 'claude' 或 'deepseek'
3. 对应的 API Key 是否有效

**调试**:
```typescript
import { getCurrentProvider } from '@/lib/ai'
console.log('使用的 AI:', getCurrentProvider())
```

### 问题 3: 默认提供商不是预期的

**原因**: `AI_PROVIDER` 环境变量未设置

**解决**:
```env
# 明确设置提供商
AI_PROVIDER=deepseek  # 或 claude
```

## 📝 代码示例

### 迁移示例 1: API 路由

**重构前**:
```typescript
import { ai, AI_MODEL } from '@/lib/ai'

const completion = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [...]
})
```

**重构后（方式 1 - 保持不变）**:
```typescript
import { ai, AI_MODEL } from '@/lib/ai'  // 从 index.ts re-export

const completion = await ai.chat.completions.create({
  model: AI_MODEL,
  messages: [...]
})
```

**重构后（方式 2 - 使用统一接口）**:
```typescript
import { createChatCompletion } from '@/lib/ai'

const result = await createChatCompletion(
  "系统提示",
  "用户提示",
  0.7,
  2000
)
```

## 🎓 最佳实践

### 1. 使用统一接口

**推荐**:
```typescript
import { createChatCompletion } from '@/lib/ai'
```

**优势**:
- 通过环境变量轻松切换提供商
- 代码无需修改
- 便于 A/B 测试

### 2. 根据场景选择提供商

```typescript
// 简单分析 - 使用 DeepSeek（成本低）
import { createChatCompletion as deepseekChat } from '@/lib/ai/deepseek'

// 复杂推理 - 使用 Claude（质量高）
import { createClaudeChatCompletion as claudeChat } from '@/lib/ai/claude'
```

### 3. 统一错误处理

```typescript
import { createChatCompletion } from '@/lib/ai'

try {
  return await createChatCompletion(
    systemPrompt,
    userPrompt,
    0.7,
    2000,
    '默认值'  // API 返回为空时使用
  )
} catch (error) {
  console.error('AI error:', error)
  return '友好的错误信息'  // API 调用失败时使用
}
```

## 📞 获取帮助

如有问题，请查看：
- `lib/ai/README.md` - 完整使用指南
- `lib/ai/claude-usage.md` - Claude 详细文档

## 总结

**好消息**: 这次重构对现有代码是**零破坏性**的！

- ✅ 所有现有导入路径仍然有效
- ✅ 所有现有代码无需修改
- ✅ 只需配置环境变量即可
- ✅ 新增了更多灵活性和功能

**唯一需要注意**: 默认 AI 提供商改为 Claude，如需使用 DeepSeek 请设置环境变量。
