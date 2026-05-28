// Mock 数据服务
import { ElMessage } from 'element-plus'
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  RECORDS_STORAGE_KEY
} from '@/utils/constants'

// 向后兼容：其他文件若从 mock.js 导入默认分类常量，仍然可用
export { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES }

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' }
]

// seed 记录：分类名从共享常量动态读取
const SEED_RECORDS = [
  {
    id: 1,
    type: 'income',
    category: DEFAULT_INCOME_CATEGORIES[0].name,
    amount: 8000,
    date: '2026-02-01',
    remark: '2月工资'
  },
  {
    id: 2,
    type: 'expense',
    category: DEFAULT_EXPENSE_CATEGORIES[0].name,
    amount: 150,
    date: '2026-02-02',
    remark: '午餐'
  },
  {
    id: 3,
    type: 'expense',
    category: DEFAULT_EXPENSE_CATEGORIES[1].name,
    amount: 50,
    date: '2026-02-03',
    remark: '地铁费'
  },
  {
    id: 4,
    type: 'income',
    category: DEFAULT_INCOME_CATEGORIES[2].name,
    amount: 500,
    date: '2026-02-05',
    remark: '兼职收入'
  },
  {
    id: 5,
    type: 'expense',
    category: DEFAULT_EXPENSE_CATEGORIES[2].name,
    amount: 300,
    date: '2026-02-06',
    remark: '日用品'
  }
]

// 从 localStorage 读取记录；首次使用（无缓存）时用 seed 初始化并写入
function loadRecordsFromStorage() {
  const stored = localStorage.getItem(RECORDS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // 解析失败则降级为 seed
    }
  }
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(SEED_RECORDS))
  return JSON.parse(JSON.stringify(SEED_RECORDS))
}

// 将当前记录写回 localStorage
function saveRecordsToStorage(records) {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
}

// Mock 收支记录数据（从 localStorage 恢复，首次使用时用 seed 初始化）
let mockRecords = loadRecordsFromStorage()

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
  const maxId = mockRecords.reduce((max, r) => Math.max(max, r.id), 0)
  const newRecord = {
    id: maxId + 1,
    ...record,
    date: record.date || new Date().toISOString().split('T')[0]
  }
  mockRecords.push(newRecord)
  saveRecordsToStorage(mockRecords)
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
    saveRecordsToStorage(mockRecords)
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
    saveRecordsToStorage(mockRecords)
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

// 批量更新记录中的分类名称（分类重命名时同步所有引用该分类的记录）
export const mockUpdateCategoryInRecords = async (type, oldName, newName) => {
  await delay(300)
  let updatedCount = 0
  mockRecords.forEach(record => {
    if (record.type === type && record.category === oldName) {
      record.category = newName
      updatedCount++
    }
  })
  saveRecordsToStorage(mockRecords)
  return {
    code: 200,
    message: '更新成功',
    data: { updatedCount }
  }
}
