// import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk';

export const AI_MODEL = "claude-sonnet-4-5-20250929"

export const ai = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});
export const createCompletion = ai.completions.create.bind(ai.completions)

// 公共 completion 方法
// export const createCompletion = ai.chat.completions.create.bind(ai.chat.completions)


// export const AI_MODEL = "deepseek-chat"

// export const ai = new OpenAI({
//     baseURL: 'https://api.deepseek.com',
//     apiKey: process.env.DEEPSEEK_API_KEY
// });
