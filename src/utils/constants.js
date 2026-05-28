// 默认分类常量（全系统共享的唯一来源，被 store 和 mock 共同引用）

export const DEFAULT_INCOME_CATEGORIES = [
  { name: '工资', icon: 'Wallet', color: '#67c23a' },
  { name: '奖金', icon: 'TrophyBase', color: '#e6a23c' },
  { name: '兼职', icon: 'Briefcase', color: '#409eff' },
  { name: '理财', icon: 'TrendCharts', color: '#f56c6c' },
  { name: '其他', icon: 'MoreFilled', color: '#909399' }
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: 'Food', color: '#f56c6c' },
  { name: '交通', icon: 'Bicycle', color: '#409eff' },
  { name: '购物', icon: 'ShoppingCart', color: '#e6a23c' },
  { name: '住房', icon: 'House', color: '#67c23a' },
  { name: '娱乐', icon: 'Headset', color: '#9b59b6' },
  { name: '医疗', icon: 'FirstAidKit', color: '#f56c6c' },
  { name: '教育', icon: 'Reading', color: '#409eff' },
  { name: '其他', icon: 'MoreFilled', color: '#909399' }
]

// localStorage key for persisted records
export const RECORDS_STORAGE_KEY = 'accounting-records'
