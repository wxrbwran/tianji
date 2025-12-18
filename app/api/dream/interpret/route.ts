import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DreamAnalysisCalculator, DreamAnalysisInput, DreamCategory, DreamMood } from '@/lib/dream/calculator'
import { TianjiPointsService, AnalysisRecordsService } from '@/lib/database/services'
import { createChatCompletion } from '@/lib/ai'



interface DreamInterpreteRequest extends DreamAnalysisInput {
  // 继承所有DreamAnalysisInput字段
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户认证
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const body = await request.json() as DreamInterpreteRequest

    // 验证必填字段
    if (!body.dream_content) {
      return NextResponse.json(
        { error: '请输入梦境内容描述' },
        { status: 400 }
      )
    }

    if (!body.dream_category) {
      return NextResponse.json(
        { error: '请选择梦境分类' },
        { status: 400 }
      )
    }

    if (!body.dream_mood) {
      return NextResponse.json(
        { error: '请选择梦境情绪' },
        { status: 400 }
      )
    }

    // 检查用户天机点余额
    const serviceCost = 80 // 解梦分析消耗80天机点
    const hasEnoughPoints = await TianjiPointsService.hasEnoughPoints(user.id, serviceCost)

    if (!hasEnoughPoints) {
      return NextResponse.json(
        {
          error: '天机点余额不足',
          required_points: serviceCost,
          service_type: 'dream'
        },
        { status: 402 }
      )
    }

    // 验证梦境内容长度
    if (body.dream_content.length < 10) {
      return NextResponse.json(
        { error: '梦境描述过于简短，请详细描述您的梦境' },
        { status: 400 }
      )
    }

    if (body.dream_content.length > 2000) {
      return NextResponse.json(
        { error: '梦境描述过长，请控制在2000字以内' },
        { status: 400 }
      )
    }

    // 验证分类和情绪枚举值
    if (!Object.values(DreamCategory).includes(body.dream_category)) {
      return NextResponse.json(
        { error: '无效的梦境分类' },
        { status: 400 }
      )
    }

    if (!Object.values(DreamMood).includes(body.dream_mood)) {
      return NextResponse.json(
        { error: '无效的梦境情绪' },
        { status: 400 }
      )
    }

    // 执行梦境分析
    const dreamAnalysis = DreamAnalysisCalculator.analyzeDream(body)

    // 生成AI深度解读
    const aiInterpretation = await generateAIInterpretation(body, dreamAnalysis)

    // 临时调试日志
    console.log('🔍 API Debug - aiInterpretation type:', typeof aiInterpretation)
    console.log('🔍 API Debug - aiInterpretation preview:', typeof aiInterpretation === 'string' ? aiInterpretation.substring(0, 200) : 'NOT STRING')

    // 计算服务费用（80天机点）
    const cost = 80

    // 保存到数据库
    try {
      const { data: dreamRecord, error: saveError } = await supabase
        .from('dream_interpretations')
        .insert({
          user_id: user.id,
          dream_content: body.dream_content,
          dream_category: body.dream_category,
          dream_mood: body.dream_mood,
          dream_frequency: body.dream_frequency || 'occasional',
          lucid_dream: body.lucid_dream || false,
          dreamer_age_range: body.dreamer_info?.age_range || null,
          dreamer_gender: body.dreamer_info?.gender || null,
          dreamer_life_stage: body.dreamer_info?.life_stage || null,
          recent_stress: body.dreamer_info?.recent_stress || false,
          interpretation_result: dreamAnalysis,
          ai_analysis: typeof aiInterpretation === 'string' ? aiInterpretation : JSON.stringify(aiInterpretation),
          points_cost: cost
        })
        .select()
        .single()

      if (saveError) {
        console.error('Error saving dream interpretation:', saveError)
        // 继续处理，不要因为保存失败就返回错误
      }

      // 扣除天机点
      if (!saveError) {
        await TianjiPointsService.spendPoints(
          user.id,
          cost,
          'dream_interpretation',
          `梦境解析 - ${body.dream_content.substring(0, 30)}${body.dream_content.length > 30 ? '...' : ''}`
        )
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      // 记录错误但不影响返回结果
    }

    const response = {
      success: true,
      dream_input: {
        content: body.dream_content,
        category: body.dream_category,
        mood: body.dream_mood,
        dreamer_info: body.dreamer_info
      },
      analysis: {
        dream_summary: dreamAnalysis.dream_summary,
        category_analysis: dreamAnalysis.category_analysis,
        psychological_analysis: dreamAnalysis.psychological_analysis,
        symbolic_interpretation: dreamAnalysis.symbolic_interpretation,
        life_guidance: dreamAnalysis.life_guidance,
        dream_quality: dreamAnalysis.dream_quality,
        warnings_and_suggestions: dreamAnalysis.warnings_and_suggestions
      },
      ai_interpretation: aiInterpretation,
      cost,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dream interpretation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '梦境解析失败，请稍后重试'
      },
      { status: 500 }
    )
  }
}

async function generateAIInterpretation(request: DreamInterpreteRequest, analysis: any): Promise<string> {
  try {
    const dreamInfo = request.dreamer_info
    const ageInfo = dreamInfo?.age_range ? `年龄段：${dreamInfo.age_range}` : ''
    const genderInfo = dreamInfo?.gender ? `性别：${dreamInfo.gender === 'male' ? '男' : '女'}` : ''
    const lifeStageInfo = dreamInfo?.life_stage ? `人生阶段：${dreamInfo.life_stage}` : ''
    const stressInfo = dreamInfo?.recent_stress ? '近期压力：有' : ''

    const prompt = `作为一位专业的心理分析师和解梦专家，请为以下梦境提供深度解读：

【梦境信息】
梦境内容：${request.dream_content}
梦境分类：${request.dream_category}
梦境情绪：${request.dream_mood}
做梦频率：${request.dream_frequency || '未知'}
清醒梦：${request.lucid_dream ? '是' : '否'}

【做梦者信息】
${ageInfo}
${genderInfo}
${lifeStageInfo}
${stressInfo}

【系统分析结果】
梦境摘要：${analysis.dream_summary}

心理分析：
- 潜意识主题：${analysis.psychological_analysis.subconscious_themes.join('、')}
- 情绪状态：${analysis.psychological_analysis.emotional_state}
- 压力指标：${analysis.psychological_analysis.stress_indicators.join('、') || '无明显压力指标'}

象征解析：
${analysis.symbolic_interpretation.key_symbols.map((symbol: any) =>
      `- ${symbol.symbol}：${symbol.traditional_meaning}（${symbol.psychological_meaning}）`
    ).join('\n')}

生活指导：
- 当前洞察：${analysis.life_guidance.current_situation_insights.join('、')}
- 情感需求：${analysis.life_guidance.emotional_needs.join('、')}
- 成长机会：${analysis.life_guidance.growth_opportunities.join('、')}

梦境质量：
- 清晰度：${analysis.dream_quality.clarity_score}/10
- 情感强度：${analysis.dream_quality.emotional_intensity}/10
- 象征丰富度：${analysis.dream_quality.symbolic_richness}/10
- 整体重要性：${analysis.dream_quality.overall_significance}/10

请从以下角度提供专业解读：
1. 【梦境深层含义】：结合心理学理论，解读梦境的深层象征意义
2. 【当前生活状态】：分析梦境反映的现实生活状况和心理状态
3. 【情感处理建议】：针对梦境中的情绪提供处理和调节建议
4. 【人生发展指导】：基于梦境启示提供人生方向和发展建议
5. 【实践行动方案】：给出具体可行的日常生活改善建议

解读要求：
- 结合传统解梦智慧与现代心理学理论
- 语言温和积极，给人希望和指导
- 避免过于绝对的预测，强调个人主观能动性
- 提供实用的心理调节和生活改善建议
- 字数控制在800-1200字
- 条理清晰，具有指导价值`

    return await createChatCompletion(
      "你是一位经验丰富的心理分析师和解梦专家，结合现代心理学理论与传统解梦文化，为人们提供专业的梦境解读和人生指导。你的解读既有科学依据又富有人文关怀，帮助人们更好地理解内心世界并改善生活。",
      prompt,
      0.7,
      1800,
      '解读生成失败，请稍后重试'
    )

  } catch (error) {
    console.error('AI interpretation error:', error)
    return `系统解读：这是一个关于${request.dream_category}的${request.dream_mood}梦境。${analysis.psychological_analysis.emotional_state} 梦境中的${analysis.symbolic_interpretation.key_symbols.map((s: any) => s.symbol).join('、') || '各种元素'}可能反映了您当前的心理状态。建议您${analysis.life_guidance.recommended_actions.join('，') || '保持积极心态，关注内心需求'}。记住，梦境是心灵的镜子，通过理解梦境可以更好地了解自己。`
  }
}