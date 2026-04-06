import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
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
  
  const filterState = ref({
    type: '',
    startDate: '',
    endDate: ''
  })

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
        records.value = res.data.list.sort((a, b) => new Date(b.date) - new Date(a.date))
        statistics.value = calculateStatistics(records.value)
        filterState.value = {
          type: params.type || '',
          startDate: params.startDate || '',
          endDate: params.endDate || ''
        }
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
        await fetchRecords(filterState.value)
        return res
      }
    } catch (error) {
      ElMessage.error(error.message || '添加失败')
    }
  }

  const updateExistingRecord = async (id, record) => {
    try {
      const res = await updateRecord(id, record)
      if (res.code === 200) {
        await fetchRecords(filterState.value)
        return res
      }
    } catch (error) {
      ElMessage.error(error.message || '更新失败')
    }
  }

  const deleteExistingRecord = async (id) => {
    try {
      const res = await deleteRecord(id)
      if (res.code === 200) {
        await fetchRecords(filterState.value)
        return res
      }
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }

  return {
    statistics,
    records,
    loading,
    filterState,
    fetchStatistics,
    fetchRecords,
    addNewRecord,
    updateExistingRecord,
    deleteExistingRecord
  }
})
