// Mock 数据服务
import { ElMessage } from 'element-plus'

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' }
]

// 获取当前所有记录（供其他模块检查引用）
export const getMockRecords = () => mockRecords

// Mock 收支记录数据（包含当月和上月数据用于对比）
const now = new Date()
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

let mockRecords = [
  {
    id: 1,
    type: 'income',
    category: '工资',
    amount: 8000,
    date: `${lastMonthStr}-01`,
    remark: '上月工资'
  },
  {
    id: 2,
    type: 'expense',
    category: '餐饮',
    amount: 800,
    date: `${lastMonthStr}-05`,
    remark: '上月餐饮'
  },
  {
    id: 3,
    type: 'expense',
    category: '交通',
    amount: 200,
    date: `${lastMonthStr}-10`,
    remark: '上月交通'
  },
  {
    id: 4,
    type: 'expense',
    category: '购物',
    amount: 500,
    date: `${lastMonthStr}-15`,
    remark: '上月购物'
  },
  {
    id: 5,
    type: 'income',
    category: '工资',
    amount: 8500,
    date: `${thisMonth}-01`,
    remark: '本月工资'
  },
  {
    id: 6,
    type: 'expense',
    category: '餐饮',
    amount: 600,
    date: `${thisMonth}-05`,
    remark: '本月餐饮'
  },
  {
    id: 7,
    type: 'expense',
    category: '交通',
    amount: 150,
    date: `${thisMonth}-08`,
    remark: '本月交通'
  },
  {
    id: 8,
    type: 'income',
    category: '兼职',
    amount: 800,
    date: `${thisMonth}-10`,
    remark: '本月兼职'
  },
  {
    id: 9,
    type: 'expense',
    category: '娱乐',
    amount: 300,
    date: `${thisMonth}-12`,
    remark: '本月娱乐'
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
