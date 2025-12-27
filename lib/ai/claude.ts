import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929"

export const claude = new Anthropic({
    baseURL: 'https://api.anthropic.com',
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Claude AI 聊天完成方法
 *
 * @param systemPrompt - 系统提示（可选）
 * @param userPrompt - 用户提示
 * @param temperature - 温度参数，默认 0.7
 * @param maxTokens - 最大 token 数，默认 2000
 * @param defaultValue - 返回为空时的默认值，默认为 '分析生成失败，请稍后重试'
 */
export async function createClaudeChatCompletion(
    systemPrompt: string | undefined,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000,
    defaultValue: string = '分析生成失败，请稍后重试'
): Promise<string> {
    const message = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,  // Claude SDK 的 system 是单独参数
        messages: [
            {
                role: 'user',
                content: userPrompt
            }
        ]
    })

    // 获取第一个文本内容块
    const textContent = message.content.find(block => block.type === 'text')

    return textContent?.type === 'text' ? textContent.text : defaultValue
}
