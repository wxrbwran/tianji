import { NameAnalysisCalculator } from './lib/name/calculator.ts'

const names = ['刘德华', '张三', '李四', '王小二', '欧阳修', '张然', '陈熙']

console.log('--- 姓名分析测试 ---')
names.forEach(name => {
    try {
        const result = NameAnalysisCalculator.analyzeChineseName(name)
        console.log(`\n姓名: ${name}`)
        console.log(`五行: 姓(${result.wuxing_analysis.surname_wuxing}) 名(${result.wuxing_analysis.given_wuxing.join(',')})`)
        console.log(`三才五格:`)
        console.log(`  天格: ${result.numerology.tiange} (${result.numerology.tiange_wuxing}) - ${result.numerology.tiange_fortune}`)
        console.log(`  人格: ${result.numerology.renge} (${result.numerology.renge_wuxing}) - ${result.numerology.renge_fortune}`)
        console.log(`  地格: ${result.numerology.dige} (${result.numerology.dige_wuxing}) - ${result.numerology.dige_fortune}`)
        console.log(`  外格: ${result.numerology.waige} (${result.numerology.waige_wuxing}) - ${result.numerology.waige_fortune}`)
        console.log(`  总格: ${result.numerology.zongge} (${result.numerology.zongge_wuxing}) - ${result.numerology.zongge_fortune}`)
        console.log(`整体五行: ${result.wuxing_analysis.overall_wuxing}`)
    } catch (e: any) {
        console.error(`分析 ${name} 失败:`, e.message)
    }
})
