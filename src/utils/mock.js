// Mock 数据服务
import { ElMessage } from 'element-plus'

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' }
]

// Mock 收支记录数据（扩展到支持月/季/年分析）
let mockRecords = generateMockRecords()

function generateMockRecords() {
  const records = []
  let id = 1
  
  // 收入分类
  const incomeCategories = ['工资', '奖金', '兼职', '投资', '其他收入']
  // 支出分类
  const expenseCategories = ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他支出']
  
  // 生成2025年和2026年的模拟数据
  const years = [2025, 2026]
  
  years.forEach(year => {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate()
      
      // 每月固定收入
      records.push({
        id: id++,
        type: 'income',
        category: '工资',
        amount: 8000 + Math.floor(Math.random() * 2000),
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        remark: `${month}月工资`
      })
      
      // 偶尔有奖金
      if (month === 6 || month === 12) {
        records.push({
          id: id++,
          type: 'income',
          category: '奖金',
          amount: 5000 + Math.floor(Math.random() * 3000),
          date: `${year}-${String(month).padStart(2, '0')}-15`,
          remark: `${month === 6 ? '半年' : '年终'}奖`
        })
      }
      
      // 每月随机收入（兼职、投资等）
      if (Math.random() > 0.5) {
        records.push({
          id: id++,
          type: 'income',
          category: incomeCategories[Math.floor(Math.random() * (incomeCategories.length - 2)) + 2],
          amount: Math.floor(Math.random() * 2000) + 100,
          date: `${year}-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
          remark: '额外收入'
        })
      }
      
      // 每月日常支出
      for (let i = 0; i < Math.floor(Math.random() * 15) + 10; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
        
        let amount
        switch (category) {
          case '餐饮':
            amount = Math.floor(Math.random() * 200) + 30
            break
          case '交通':
            amount = Math.floor(Math.random() * 100) + 20
            break
          case '购物':
            amount = Math.floor(Math.random() * 500) + 100
            break
          case '娱乐':
            amount = Math.floor(Math.random() * 300) + 50
            break
          case '居住':
            amount = Math.floor(Math.random() * 1000) + 200
            break
          case '医疗':
            amount = Math.floor(Math.random() * 300) + 100
            break
          case '教育':
            amount = Math.floor(Math.random() * 500) + 100
            break
          default:
            amount = Math.floor(Math.random() * 200) + 50
        }
        
        records.push({
          id: id++,
          type: 'expense',
          category,
          amount,
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          remark: `${category}支出`
        })
      }
    }
  })
  
  return records
}

// 登录 Mock
export const mockLogin = async (username, password) => {
  await delay(800)
  const user = mockUsers.find(u => u.username === username && u.password === password)
  if (user) {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: `mock_token_${user.id}_${Date.now()}`,
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
}

// 获取统计信息 Mock
export const mockGetStatistics = async () => {
  await delay(600)
  const income = mockRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  const expense = mockRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      incomeCount: mockRecords.filter(r => r.type === 'income').length,
      expenseCount: mockRecords.filter(r => r.type === 'expense').length
    }
  }
}

// 获取收支记录列表 Mock
export const mockGetRecords = async (params = {}) => {
  await delay(500)
  let records = [...mockRecords]
  
  // 类型筛选
  if (params.type) {
    records = records.filter(r => r.type === params.type)
  }
  
  // 日期筛选
  if (params.startDate) {
    records = records.filter(r => r.date >= params.startDate)
  }
  if (params.endDate) {
    records = records.filter(r => r.date <= params.endDate)
  }
  
  // 排序
  records.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: records,
      total: records.length
    }
  }
}

// 添加收支记录 Mock
export const mockAddRecord = async (record) => {
  await delay(500)
  const newRecord = {
    id: mockRecords.length + 1,
    ...record,
    date: record.date || new Date().toISOString().split('T')[0]
  }
  mockRecords.push(newRecord)
  return {
    code: 200,
    message: '添加成功',
    data: newRecord
  }
}

// 更新收支记录 Mock
export const mockUpdateRecord = async (id, record) => {
  await delay(500)
  const index = mockRecords.findIndex(r => r.id === id)
  if (index !== -1) {
    mockRecords[index] = { ...mockRecords[index], ...record }
    return {
      code: 200,
      message: '更新成功',
      data: mockRecords[index]
    }
  } else {
    return {
      code: 404,
      message: '记录不存在'
    }
  }
}

// 删除收支记录 Mock
export const mockDeleteRecord = async (id) => {
  await delay(500)
  const index = mockRecords.findIndex(r => r.id === id)
  if (index !== -1) {
    mockRecords.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '记录不存在'
    }
  }
}

// Mock 预算数据
let mockBudgets = [
  { id: 1, category: '餐饮', amount: 2000, month: '2026-02' },
  { id: 2, category: '交通', amount: 500, month: '2026-02' },
  { id: 3, category: '购物', amount: 1500, month: '2026-02' },
  { id: 4, category: '娱乐', amount: 800, month: '2026-02' }
]

// 获取预算列表 Mock
export const mockGetBudgets = async (params = {}) => {
  await delay(500)
  let budgets = [...mockBudgets]
  
  if (params.month) {
    budgets = budgets.filter(b => b.month === params.month)
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: budgets,
      total: budgets.length
    }
  }
}

// 添加预算 Mock
export const mockAddBudget = async (budget) => {
  await delay(500)
  
  const existingIndex = mockBudgets.findIndex(
    b => b.category === budget.category && b.month === budget.month
  )
  
  if (existingIndex !== -1) {
    return {
      code: 400,
      message: '该分类本月已设置预算'
    }
  }
  
  const newBudget = {
    id: mockBudgets.length + 1,
    ...budget
  }
  mockBudgets.push(newBudget)
  return {
    code: 200,
    message: '添加成功',
    data: newBudget
  }
}

// 更新预算 Mock
export const mockUpdateBudget = async (id, budget) => {
  await delay(500)
  const index = mockBudgets.findIndex(b => b.id === id)
  if (index !== -1) {
    mockBudgets[index] = { ...mockBudgets[index], ...budget }
    return {
      code: 200,
      message: '更新成功',
      data: mockBudgets[index]
    }
  } else {
    return {
      code: 404,
      message: '预算不存在'
    }
  }
}

// 删除预算 Mock
export const mockDeleteBudget = async (id) => {
  await delay(500)
  const index = mockBudgets.findIndex(b => b.id === id)
  if (index !== -1) {
    mockBudgets.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '预算不存在'
    }
  }
}

// 获取预算使用情况 Mock
export const mockGetBudgetUsage = async (month) => {
  await delay(500)
  
  const [year, monthNum] = month.split('-').map(Number)
  const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`
  const endDate = monthNum === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`
  
  const monthRecords = mockRecords.filter(
    r => r.type === 'expense' && r.date >= startDate && r.date < endDate
  )
  
  const categoryTotals = {}
  monthRecords.forEach(r => {
    if (!categoryTotals[r.category]) {
      categoryTotals[r.category] = 0
    }
    categoryTotals[r.category] += r.amount
  })
  
  const monthBudgets = mockBudgets.filter(b => b.month === month)
  
  const usageList = monthBudgets.map(budget => {
    const used = categoryTotals[budget.category] || 0
    const percentage = budget.amount > 0 ? (used / budget.amount) * 100 : 0
    
    let status = 'normal'
    if (percentage >= 100) {
      status = 'exceeded'
    } else if (percentage >= 80) {
      status = 'warning'
    }
    
    return {
      ...budget,
      used,
      remaining: Math.max(0, budget.amount - used),
      percentage: Math.min(100, percentage),
      status
    }
  })
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: usageList,
      total: usageList.length
    }
  }
}

// ==================== 财务报表相关 Mock 函数 ====================

// 辅助函数：获取指定时间范围的记录
function getRecordsByTimeRange(timeDimension, period) {
  let startDate, endDate
  
  if (timeDimension === 'month') {
    // period 格式: '2026-02'
    const [year, month] = period.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    startDate = `${year}-${String(month).padStart(2, '0')}-01`
    endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`
  } else if (timeDimension === 'quarter') {
    // period 格式: '2026-Q1'
    const [year, q] = period.split('-Q').map(Number)
    const startMonth = (q - 1) * 3 + 1
    const endMonth = q * 3
    const endDay = new Date(year, endMonth, 0).getDate()
    startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`
    endDate = `${year}-${String(endMonth).padStart(2, '0')}-${endDay}`
  } else if (timeDimension === 'year') {
    // period 格式: '2026'
    const year = Number(period)
    startDate = `${year}-01-01`
    endDate = `${year}-12-31`
  }
  
  return mockRecords.filter(r => r.date >= startDate && r.date <= endDate)
}

// 获取上一期时间范围（用于环比）
function getPreviousPeriod(timeDimension, period) {
  if (timeDimension === 'month') {
    const [year, month] = period.split('-').map(Number)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
  } else if (timeDimension === 'quarter') {
    const [year, q] = period.split('-Q').map(Number)
    const prevQ = q === 1 ? 4 : q - 1
    const prevYear = q === 1 ? year - 1 : year
    return `${prevYear}-Q${prevQ}`
  } else if (timeDimension === 'year') {
    return String(Number(period) - 1)
  }
  return period
}

// 获取同比上一年同周期（用于同比）
function getYearAgoPeriod(timeDimension, period) {
  if (timeDimension === 'month') {
    const [year, month] = period.split('-').map(Number)
    return `${year - 1}-${String(month).padStart(2, '0')}`
  } else if (timeDimension === 'quarter') {
    const [year, q] = period.split('-Q').map(Number)
    return `${year - 1}-Q${q}`
  } else if (timeDimension === 'year') {
    return String(Number(period) - 1)
  }
  return period
}

// 计算增长率
function calculateGrowthRate(current, previous) {
  if (previous === 0) return current > 0 ? Infinity : 0
  return ((current - previous) / previous) * 100
}

// 获取分类统计数据（饼图）
export const mockGetCategoryStatistics = async (timeDimension, period, type = 'expense') => {
  await delay(400)
  
  const records = getRecordsByTimeRange(timeDimension, period)
  const filteredRecords = records.filter(r => r.type === type)
  
  const categoryTotals = {}
  filteredRecords.forEach(r => {
    if (!categoryTotals[r.category]) {
      categoryTotals[r.category] = 0
    }
    categoryTotals[r.category] += r.amount
  })
  
  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)
  
  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    percent: total > 0 ? ((value / total) * 100).toFixed(2) : 0
  })).sort((a, b) => b.value - a.value)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      total,
      categories: data
    }
  }
}

// 获取趋势数据（折线图）
export const mockGetTrendData = async (timeDimension, period) => {
  await delay(400)
  
  let trendData = []
  
  if (timeDimension === 'month') {
    // 按月查看，显示当月每天的趋势
    const [year, month] = period.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayRecords = mockRecords.filter(r => r.date === dateStr)
      
      const income = dayRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const expense = dayRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      
      trendData.push({
        period: `${month}月${day}日`,
        income,
        expense,
        balance: income - expense
      })
    }
  } else if (timeDimension === 'quarter') {
    // 按季度查看，显示该季度每月的趋势
    const [year, q] = period.split('-Q').map(Number)
    const startMonth = (q - 1) * 3 + 1
    
    for (let m = 0; m < 3; m++) {
      const month = startMonth + m
      const monthRecords = getRecordsByTimeRange('month', `${year}-${String(month).padStart(2, '0')}`)
      
      const income = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const expense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      
      trendData.push({
        period: `${year}年${month}月`,
        income,
        expense,
        balance: income - expense
      })
    }
  } else if (timeDimension === 'year') {
    // 按年查看，显示该年每月的趋势
    const year = Number(period)
    
    for (let month = 1; month <= 12; month++) {
      const monthRecords = getRecordsByTimeRange('month', `${year}-${String(month).padStart(2, '0')}`)
      
      const income = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const expense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      
      trendData.push({
        period: `${month}月`,
        income,
        expense,
        balance: income - expense
      })
    }
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: trendData
  }
}

// 获取 Top5 消费分类
export const mockGetTopCategories = async (timeDimension, period, type = 'expense', limit = 5) => {
  await delay(300)
  
  const records = getRecordsByTimeRange(timeDimension, period)
  const filteredRecords = records.filter(r => r.type === type)
  
  const categoryTotals = {}
  filteredRecords.forEach(r => {
    if (!categoryTotals[r.category]) {
      categoryTotals[r.category] = { amount: 0, count: 0 }
    }
    categoryTotals[r.category].amount += r.amount
    categoryTotals[r.category].count += 1
  })
  
  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val.amount, 0)
  
  const data = Object.entries(categoryTotals).map(([name, stats]) => ({
    name,
    amount: stats.amount,
    count: stats.count,
    percent: total > 0 ? ((stats.amount / total) * 100).toFixed(2) : 0
  })).sort((a, b) => b.amount - a.amount).slice(0, limit)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      total,
      categories: data
    }
  }
}

// 获取增长率数据（同比、环比）
export const mockGetGrowthRate = async (timeDimension, period) => {
  await delay(300)
  
  // 当前周期
  const currentRecords = getRecordsByTimeRange(timeDimension, period)
  const currentIncome = currentRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  const currentExpense = currentRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  
  // 环比（上一期）
  const prevPeriod = getPreviousPeriod(timeDimension, period)
  const prevRecords = getRecordsByTimeRange(timeDimension, prevPeriod)
  const prevIncome = prevRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  const prevExpense = prevRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  
  // 同比（去年同期）
  const yearAgoPeriod = getYearAgoPeriod(timeDimension, period)
  const yearAgoRecords = getRecordsByTimeRange(timeDimension, yearAgoPeriod)
  const yearAgoIncome = yearAgoRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  const yearAgoExpense = yearAgoRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      current: {
        period,
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense
      },
      previous: {
        period: prevPeriod,
        income: prevIncome,
        expense: prevExpense,
        balance: prevIncome - prevExpense,
        incomeGrowth: calculateGrowthRate(currentIncome, prevIncome),
        expenseGrowth: calculateGrowthRate(currentExpense, prevExpense),
        balanceGrowth: calculateGrowthRate(currentIncome - currentExpense, prevIncome - prevExpense)
      },
      yearAgo: {
        period: yearAgoPeriod,
        income: yearAgoIncome,
        expense: yearAgoExpense,
        balance: yearAgoIncome - yearAgoExpense,
        incomeGrowth: calculateGrowthRate(currentIncome, yearAgoIncome),
        expenseGrowth: calculateGrowthRate(currentExpense, yearAgoExpense),
        balanceGrowth: calculateGrowthRate(currentIncome - currentExpense, yearAgoIncome - yearAgoExpense)
      }
    }
  }
}

// 获取完整财务报表数据（用于导出 Excel）
export const mockGetFinancialReportData = async (timeDimension, period) => {
  await delay(600)
  
  // 汇总数据
  const growthRateRes = await mockGetGrowthRate(timeDimension, period)
  const summary = growthRateRes.data
  
  // 分类明细（收入和支出）
  const expenseCategoryRes = await mockGetCategoryStatistics(timeDimension, period, 'expense')
  const incomeCategoryRes = await mockGetCategoryStatistics(timeDimension, period, 'income')
  
  const categoryDetails = {
    expense: expenseCategoryRes.data,
    income: incomeCategoryRes.data
  }
  
  // 趋势数据
  const trendRes = await mockGetTrendData(timeDimension, period)
  const trendData = trendRes.data
  
  // Top5 分类
  const topExpenseRes = await mockGetTopCategories(timeDimension, period, 'expense', 5)
  const topIncomeRes = await mockGetTopCategories(timeDimension, period, 'income', 5)
  
  const topCategories = {
    expense: topExpenseRes.data,
    income: topIncomeRes.data
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      summary,
      categoryDetails,
      trendData,
      topCategories
    }
  }
}
