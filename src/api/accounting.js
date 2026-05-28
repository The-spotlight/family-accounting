import {
  mockGetStatistics,
  mockGetRecords,
  mockAddRecord,
  mockUpdateRecord,
  mockDeleteRecord,
  mockUpdateCategoryInRecords
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

export const updateCategoryInRecords = (type, oldName, newName) => {
  return mockUpdateCategoryInRecords(type, oldName, newName)
}
