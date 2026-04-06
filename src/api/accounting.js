import {
  mockGetStatistics,
  mockGetRecords,
  mockAddRecord,
  mockUpdateRecord,
  mockDeleteRecord
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
