'use client'

import { useState, useEffect } from 'react'
import { CalendarView } from './CalendarView'
import { FortuneCard } from './FortuneCard'
import { UserInfoForm } from './UserInfoForm'
import { UpgradePrompt } from './UpgradePrompt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Sparkles } from 'lucide-react'
import { DailyFortune, UserBirthInfo } from '@/lib/types/fortune-calendar'

interface FortuneCalendarMainProps {
  isLoggedIn?: boolean
  hasPersonalInfo?: boolean
}

export function FortuneCalendarMain({
  isLoggedIn = false,
  hasPersonalInfo = false
}: FortuneCalendarMainProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [dailyFortunes, setDailyFortunes] = useState<DailyFortune[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)

  // 获取通用运势数据
  const fetchGeneralFortune = async (year: number, month: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/fortune-calendar/general?year=${year}&month=${month}`)
      const result = await response.json()

      if (result.success) {
        setDailyFortunes(result.data.days)
      } else {
        console.error('Failed to fetch fortune:', result.error)
      }
    } catch (error) {
      console.error('Error fetching fortune:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化加载当月运势
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    fetchGeneralFortune(year, month)
  }, [currentDate])

  // 当日历月份变化时更新数据
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString)
  }

  // 处理用户信息提交
  const handleUserInfoSubmit = async (userInfo: UserBirthInfo) => {
    setIsSubmittingInfo(true)
    try {
      // 这里应该调用个性化运势API
      // 暂时模拟处理
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 成功后关闭表单
      setShowUserForm(false)

      // 这里应该重新获取个性化运势数据
      // 目前仍使用通用版数据

    } catch (error) {
      console.error('Error submitting user info:', error)
    } finally {
      setIsSubmittingInfo(false)
    }
  }

  // 获取当前选中日期的运势
  const selectedFortune = dailyFortunes.find(f => f.date === selectedDate)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-serif font-bold mb-6 text-teal-700">
            个人运势日历
          </h2>
          <div className="w-24 h-px bg-teal-400 mx-auto mb-6"></div>
          <p className="text-xl font-serif leading-relaxed text-gray-600 max-w-3xl mx-auto mb-8">
            {hasPersonalInfo
              ? '基于您的生辰八字，查看每日专属运势变化，把握时运流转'
              : '查看每日运势参考，填写个人信息获得更精准的专属分析'
            }
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>每日运势</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>运势分析</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 日历视图 */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
          {isLoading ? (
            <Card className="w-full border border-gray-200 bg-white/95">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-teal-700 font-serif">正在加载运势数据...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <CalendarView
                year={currentDate.getFullYear()}
                month={currentDate.getMonth() + 1}
                dailyFortunes={dailyFortunes}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />

              {/* 本月运势趋势图 */}
              <Card className="border border-gray-200 bg-white/95">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-serif font-bold text-teal-700 mb-2">
                    本月运势趋势
                  </CardTitle>
                  <div className="w-16 h-px bg-teal-400 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 运势分布条形图 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600 font-medium">大吉 🔴</span>
                        <span className="text-sm text-muted-foreground">
                          {dailyFortunes.filter(f => f.level === 'excellent').length} 天
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(dailyFortunes.filter(f => f.level === 'excellent').length / dailyFortunes.length) * 100}%`
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700 font-medium">吉 🟢</span>
                        <span className="text-sm text-muted-foreground">
                          {dailyFortunes.filter(f => f.level === 'good').length} 天
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-700 h-2 rounded-full"
                          style={{
                            width: `${(dailyFortunes.filter(f => f.level === 'good').length / dailyFortunes.length) * 100}%`
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700 font-medium">平 🟤</span>
                        <span className="text-sm text-muted-foreground">
                          {dailyFortunes.filter(f => f.level === 'average').length} 天
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-700 h-2 rounded-full"
                          style={{
                            width: `${(dailyFortunes.filter(f => f.level === 'average').length / dailyFortunes.length) * 100}%`
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">谨慎 ⚫</span>
                        <span className="text-sm text-muted-foreground">
                          {dailyFortunes.filter(f => f.level === 'poor').length} 天
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-800 h-2 rounded-full"
                          style={{
                            width: `${(dailyFortunes.filter(f => f.level === 'poor').length / dailyFortunes.length) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* 重要日期提醒 */}
                    <div className="mt-6 p-4 bg-teal-50 rounded-lg border-l-4 border-teal-400">
                      <h4 className="font-serif font-semibold text-teal-700 mb-2">
                        📅 重要日期提醒
                      </h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const excellentDays = dailyFortunes
                            .filter(f => f.level === 'excellent')
                            .slice(0, 3)
                            .map(f => new Date(f.date).getDate())

                          if (excellentDays.length > 0) {
                            return (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-800">⚫</span>
                                <span className="text-muted-foreground">
                                  最佳日期：{excellentDays.join('日、')}日，适合重要决策
                                </span>
                              </div>
                            )
                          }

                          const poorDays = dailyFortunes
                            .filter(f => f.level === 'poor')
                            .slice(0, 3)
                            .map(f => new Date(f.date).getDate())

                          if (poorDays.length > 0) {
                            return (
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600">🔴</span>
                                <span className="text-muted-foreground">
                                  谨慎日期：{poorDays.join('日、')}日，宜保守行事
                                </span>
                              </div>
                            )
                          }

                          return (
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-700">🟢</span>
                              <span className="text-muted-foreground">
                                本月运势平稳，保持积极心态
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 周运势预览 */}
              <Card className="border border-gray-200 bg-white/95">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-serif font-bold text-teal-700 mb-2">
                    本周运势预览
                  </CardTitle>
                  <div className="w-16 h-px bg-teal-400 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const today = new Date()
                      const currentWeek = []
                      const startOfWeek = new Date(today)
                      startOfWeek.setDate(today.getDate() - today.getDay())

                      for (let i = 0; i < 7; i++) {
                        const date = new Date(startOfWeek)
                        date.setDate(startOfWeek.getDate() + i)
                        currentWeek.push(date)
                      }

                      return currentWeek.map((date, index) => {
                        const dateString = date.toISOString().split('T')[0]
                        const fortune = dailyFortunes.find(f => f.date === dateString)
                        const isToday = dateString === new Date().toISOString().split('T')[0]
                        const dayNames = ['日', '一', '二', '三', '四', '五', '六']

                        return (
                          <div
                            key={index}
                            className={`
                              text-center p-3 rounded-lg transition-all cursor-pointer
                              ${isToday ? 'bg-teal-100 border-2 border-teal-400' : 'bg-white/80 hover:bg-gray-100/80 border border-gray-200'}
                            `}
                            onClick={() => setSelectedDate(dateString)}
                          >
                            <div className="text-xs text-muted-foreground mb-1">
                              {dayNames[index]}
                            </div>
                            <div className={`text-lg font-semibold ${isToday ? 'text-teal-600' : 'text-[#000]'}`}>
                              {date.getDate()}
                            </div>
                            <div className="mt-1">
                              {fortune && (
                                <span className="text-lg">
                                  {fortune.level === 'excellent' ? '⚫' :
                                    fortune.level === 'good' ? '🟢' :
                                      fortune.level === 'average' ? '🟤' : '🔴'}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      点击日期查看详细运势 • 今日已标记
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 本月吉日推荐 */}
              <Card className="bg-gradient-to-r from-teal-50 to-green-50 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-serif font-bold text-teal-700 mb-2">
                    本月吉日推荐
                  </CardTitle>
                  <div className="w-16 h-px bg-teal-400 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const excellentDays = dailyFortunes
                        .filter(f => f.level === 'excellent')
                        .slice(0, 3)

                      if (excellentDays.length === 0) {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            本月暂无特别吉利的日子
                          </div>
                        )
                      }

                      return excellentDays.map((fortune, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(fortune.date)}
                          className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors border border-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">⚫</span>
                            <div>
                              <div className="font-semibold">
                                {new Date(fortune.date).toLocaleDateString('zh-CN', {
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs font-serif text-teal-600">
                                适宜：{fortune.suitableActivities.slice(0, 2).join('、')}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{fortune.score}分</div>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 右侧信息区域 */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* 运势详情卡片 */}
          <FortuneCard
            fortune={selectedFortune || null}
            selectedDate={selectedDate}
          />

          {/* 升级提示或用户表单 */}
          {!hasPersonalInfo && (
            showUserForm ? (
              <UserInfoForm
                onSubmit={handleUserInfoSubmit}
                onCancel={() => setShowUserForm(false)}
                isLoading={isSubmittingInfo}
              />
            ) : (
              <UpgradePrompt
                onGetPersonalized={() => setShowUserForm(true)}
                isLoggedIn={isLoggedIn}
              />
            )
          )}

        </div>
      </div>

      {/* 使用说明 */}
      <Card className="mt-8 bg-white/80 border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif font-bold text-teal-700 mb-2">
            使用说明
          </CardTitle>
          <div className="w-16 h-px bg-teal-400 mx-auto"></div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-serif font-semibold mb-2 text-teal-700">🗓️ 日历查看</h4>
              <p className="font-serif text-gray-600">
                点击日历上的任意日期，查看当日详细运势分析和建议
              </p>
            </div>
            <div>
              <h4 className="font-serif font-semibold mb-2 text-teal-700">🎯 运势等级</h4>
              <p className="font-serif text-gray-600">
                ⚫大吉 🟢吉 🟤平 🔴谨慎，一目了然掌握每日运势变化
              </p>
            </div>
            <div>
              <h4 className="font-serif font-semibold mb-2 text-teal-700">✨ 个性化升级</h4>
              <p className="font-serif text-gray-600">
                填写生辰信息，获得基于个人八字的精准运势分析
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}