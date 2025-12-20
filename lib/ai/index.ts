/**
 * AI 提供商统一接口
 *
 * 通过环境变量 AI_PROVIDER 来选择使用哪个 AI 提供商
 * - 'deepseek': 使用 DeepSeek AI（默认）
 * - 'claude': 使用 Anthropic Claude AI
 */

import { createChatCompletion as deepseekChat, ai, AI_MODEL } from './deepseek'
import { createClaudeChatCompletion as claudeChat, claude, CLAUDE_MODEL } from './claude'

// Re-export 客户端实例和模型常量，供直接使用
export { ai, AI_MODEL, claude, CLAUDE_MODEL }

// 通过环境变量选择 AI 提供商，默认使用 deepseek
const AI_PROVIDER = process.env.AI_PROVIDER || 'claude'

/**
 * 统一的 AI 聊天完成方法
 * 根据环境变量自动选择使用 DeepSeek 或 Claude
 */
export const createChatCompletion = AI_PROVIDER === 'claude'
  ? claudeChat
  : deepseekChat

/**
 * 获取当前使用的 AI 提供商
 */
export function getCurrentProvider(): string {
  return AI_PROVIDER
}

/**
 * 检查是否使用 Claude
 */
export function isUsingClaude(): boolean {
  return AI_PROVIDER === 'claude'
}

/**
 * 检查是否使用 DeepSeek
 */
export function isUsingDeepSeek(): boolean {
  return AI_PROVIDER === 'deepseek'
}
