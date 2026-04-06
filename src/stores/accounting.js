import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStatistics, getRecords, addRecord, updateRecord, deleteRecord } from '@/api/accounting'

export const useAccountingStore = defineStore('accounting', () => {
  const statistics = ref({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  })
  
  const records = ref([])
  const loading = ref(false)

  const calculateStatistics = (recordList) => {
    const totalIncome = recordList
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
    const totalExpense = recordList
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
    const incomeCount = recordList.filter(r => r.type === 'income').length
    const expenseCount = recordList.filter(r => r.type === 'expense').length
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount,
      expenseCount
    }
  }

  const fetchStatistics = async () => {
    try {
      const res = await getStatistics()
      if (res.code === 200) {
        statistics.value = res.data
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  const fetchRecords = async (params = {}) => {
    loading.value = true
    try {
      const res = await getRecords(params)
      if (res.code === 200) {
        records.value = res.data.list
        statistics.value = calculateStatistics(records.value)
      }
    } catch (error) {
      console.error('获取记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addNewRecord = async (record) => {
    try {
      const res = await addRecord(record)
      if (res.code === 200) {
        await fetchRecords()
        return res
      }
    } catch (error) {
      throw error
    }
  }

  const updateExistingRecord = async (id, record) => {
    try {
      const res = await updateRecord(id, record)
      if (res.code === 200) {
        await fetchRecords()
        return res
      }
    } catch (error) {
      throw error
    }
  }

  const deleteExistingRecord = async (id) => {
    try {
      const res = await deleteRecord(id)
      if (res.code === 200) {
        await fetchRecords()
        return res
      }
    } catch (error) {
      throw error
    }
  }

  return {
    statistics,
    records,
    loading,
    fetchStatistics,
    fetchRecords,
    addNewRecord,
    updateExistingRecord,
    deleteExistingRecord
  }
})
