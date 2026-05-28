import {
  mockGetStatistics,
  mockGetRecords,
  mockAddRecord,
  mockUpdateRecord,
  mockDeleteRecord,
  mockRenameCategory,
  mockClearRecords
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

export const renameCategory = (type, oldName, newName) => {
  return Promise.resolve(mockRenameCategory(type, oldName, newName))
}

export const clearRecords = () => {
  mockClearRecords()
}
