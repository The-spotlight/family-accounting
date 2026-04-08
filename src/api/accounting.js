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
  mockGetBudgetUsage
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
