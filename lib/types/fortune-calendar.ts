export interface DailyFortune {
  date: string // YYYY-MM-DD格式
  level: 'excellent' | 'good' | 'average' | 'poor' // 运势等级
  score: number // 1-100分数
  summary: string // 简短总结
  advice: string // 当日建议
  avoid: string // 当日避免
  luckyColor: string // 幸运颜色
  luckyNumber: number // 幸运数字
  suitableActivities: string[] // 适宜活动
  avoidActivities: string[] // 避免活动
  categories: {
    wealth: number // 财运分数
    love: number // 感情分数
    career: number // 事业分数
    health: number // 健康分数
  }
}

export interface MonthlyFortune {
  year: number
  month: number
  days: DailyFortune[]
}

export interface UserBirthInfo {
  name: string
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:mm
  birthCity: string
  gender: 'male' | 'female'
}

// 运势等级对应的颜色和标记（宋代五行美学配色）
export const FORTUNE_LEVELS = {
  excellent: {
    color: 'bg-red-600',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    label: '大吉',
    emoji: '🔴'
  },
  good: {
    color: 'bg-emerald-700',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-400',
    label: '吉',
    emoji: '🟢'
  },
  average: {
    color: 'bg-amber-700',
    textColor: 'text-amber-700',
    bgColor: '',
    borderColor: 'border-amber-400',
    label: '平',
    emoji: '🟤'
  },
  poor: {
    color: 'bg-gray-800',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
    label: '谨慎',
    emoji: '⚫'
  }
} as const