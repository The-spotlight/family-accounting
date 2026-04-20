import {
  mockGetStatistics,
  mockGetRecords,
  mockAddRecord,
  mockUpdateRecord,
  mockDeleteRecord,
  mockGetBudgets,
  mockAddBudget,
  mockUpdateBudget,
  mockDeleteBudget,
  mockGetBudgetUsage,
  mockGetCategoryStatistics,
  mockGetTrendData,
  mockGetTopCategories,
  mockGetGrowthRate,
  mockGetFinancialReportData
} from '@/utils/mock'

export const getStatistics = () => {
  return mockGetStatistics()
}

export const getRecords = (params) => {
  return mockGetRecords(params)
}

export const addRecord = (record) => {
  return mockAddRecord(record)
}

export const updateRecord = (id, record) => {
  return mockUpdateRecord(id, record)
}

export const deleteRecord = (id) => {
  return mockDeleteRecord(id)
}

export const getBudgets = (params) => {
  return mockGetBudgets(params)
}

export const addBudget = (budget) => {
  return mockAddBudget(budget)
}

export const updateBudget = (id, budget) => {
  return mockUpdateBudget(id, budget)
}

export const deleteBudget = (id) => {
  return mockDeleteBudget(id)
}

export const getBudgetUsage = (month) => {
  return mockGetBudgetUsage(month)
}

export const getCategoryStatistics = (timeDimension, period, type) => {
  return mockGetCategoryStatistics(timeDimension, period, type)
}

export const getTrendData = (timeDimension, period) => {
  return mockGetTrendData(timeDimension, period)
}

export const getTopCategories = (timeDimension, period, type, limit) => {
  return mockGetTopCategories(timeDimension, period, type, limit)
}

export const getGrowthRate = (timeDimension, period) => {
  return mockGetGrowthRate(timeDimension, period)
}

export const getFinancialReportData = (timeDimension, period) => {
  return mockGetFinancialReportData(timeDimension, period)
}
