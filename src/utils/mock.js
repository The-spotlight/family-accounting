// Mock 数据服务
import { ElMessage } from 'element-plus'

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' }
]

// 种子数据模板：使用占位符 key，运行时由 categoryMap 映射为真实分类名
const SEED_RECORDS = [
  { key: 'income1', type: 'income', amount: 8000, date: '2026-02-01', remark: '2月工资' },
  { key: 'expense1', type: 'expense', amount: 150, date: '2026-02-02', remark: '午餐' },
  { key: 'expense2', type: 'expense', amount: 50, date: '2026-02-03', remark: '地铁费' },
  { key: 'income2', type: 'income', amount: 500, date: '2026-02-05', remark: '兼职收入' },
  { key: 'expense3', type: 'expense', amount: 300, date: '2026-02-06', remark: '日用品' }
]

let mockRecords = []
let nextId = 1

// 初始化种子记录 —— categoryMap 由调用方传入（来自 store 当前分类列表）
// 形如 { income: { income1: '工资', income2: '兼职' }, expense: { expense1: '餐饮', ... } }
export const mockInitRecords = (categoryMap) => {
  const defaultCategory = (type) => {
    const list = type === 'income' ? categoryMap.income : categoryMap.expense
    return Object.values(list)[0] || '其他'
  }

  mockRecords = SEED_RECORDS.map((s, i) => {
    const typeMap = s.type === 'income' ? categoryMap.income : categoryMap.expense
    const category = typeMap[s.key] || defaultCategory(s.type)
    return { id: i + 1, type: s.type, category, amount: s.amount, date: s.date, remark: s.remark }
  })
  nextId = mockRecords.length + 1
}

// 批量更新分类名 —— 将所有引用 oldName 的记录改为 newName
export const mockBatchUpdateCategory = async (type, oldName, newName) => {
  await delay(300)
  let count = 0
  mockRecords.forEach(r => {
    if (r.type === type && r.category === oldName) {
      r.category = newName
      count++
    }
  })
  return { code: 200, message: '更新成功', data: { count } }
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
    id: nextId++,
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
