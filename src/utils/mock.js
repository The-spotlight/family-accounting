// Mock 数据服务
import { ElMessage } from 'element-plus'

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' }
]

// Mock 收支记录数据
let mockRecords = [
  {
    id: 1,
    type: 'income',
    category: '工资',
    amount: 8000,
    date: '2026-02-01',
    remark: '2月工资'
  },
  {
    id: 2,
    type: 'expense',
    category: '餐饮',
    amount: 150,
    date: '2026-02-02',
    remark: '午餐'
  },
  {
    id: 3,
    type: 'expense',
    category: '交通',
    amount: 50,
    date: '2026-02-03',
    remark: '地铁费'
  },
  {
    id: 4,
    type: 'income',
    category: '兼职',
    amount: 500,
    date: '2026-02-05',
    remark: '兼职收入'
  },
  {
    id: 5,
    type: 'expense',
    category: '购物',
    amount: 300,
    date: '2026-02-06',
    remark: '日用品'
  }
]

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
  { id: 3, category: '购物', amount: 1500, month: '2026-02' }
]

// 获取预算列表 Mock
export const mockGetBudgets = async (params = {}) => {
  await delay(500)
  let budgets = [...mockBudgets]
  
  // 月份筛选
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
  
  // 获取指定月份的预算
  const budgets = mockBudgets.filter(b => b.month === month)
  
  // 获取指定月份的支出记录
  const startDate = `${month}-01`
  const endDate = `${month}-31`
  const expenses = mockRecords.filter(r => 
    r.type === 'expense' && 
    r.date >= startDate && 
    r.date <= endDate
  )
  
  // 计算每个分类的支出总额
  const categoryExpenses = {}
  expenses.forEach(expense => {
    if (!categoryExpenses[expense.category]) {
      categoryExpenses[expense.category] = 0
    }
    categoryExpenses[expense.category] += expense.amount
  })
  
  // 构建预算使用情况
  const budgetUsage = budgets.map(budget => {
    const used = categoryExpenses[budget.category] || 0
    const percentage = budget.amount > 0 ? (used / budget.amount) * 100 : 0
    
    return {
      ...budget,
      used,
      percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'normal'
    }
  })
  
  return {
    code: 200,
    message: '获取成功',
    data: budgetUsage
  }
}
