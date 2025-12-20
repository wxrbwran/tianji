import OpenAI from 'openai'

export const AI_MODEL = "deepseek-chat"

export const ai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

/**
 * AI 聊天完成方法
 *
 * @param systemPrompt - 系统提示（可选）
 * @param userPrompt - 用户提示
 * @param temperature - 温度参数，默认 0.7
 * @param maxTokens - 最大 token 数，默认 2000
 * @param defaultValue - 返回为空时的默认值，默认为 '分析生成失败，请稍后重试'
 */
export async function createChatCompletion(
    systemPrompt: string | undefined,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000,
    defaultValue: string = '分析生成失败，请稍后重试'
): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (systemPrompt) {
        messages.push({
            role: 'system',
            content: systemPrompt
        })
    }

    messages.push({
        role: 'user',
        content: userPrompt
    })

    const completion = await ai.chat.completions.create({
        model: AI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens
    })

    return completion.choices[0]?.message?.content || defaultValue
}
