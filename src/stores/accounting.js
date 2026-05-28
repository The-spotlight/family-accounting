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

  const calculateStatistics = (recordList, targetMonth) => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const list = targetMonth
      ? recordList.filter(r => r.date.substring(0, 7) === targetMonth)
      : recordList.filter(r => r.date.substring(0, 7) === currentMonth)

    const totalIncome = list
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
    const totalExpense = list
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
    const incomeCount = list.filter(r => r.type === 'income').length
    const expenseCount = list.filter(r => r.type === 'expense').length

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
      const mergedParams = {
        type: params.type !== undefined ? params.type : filterState.value.type,
        startDate: params.startDate !== undefined ? params.startDate : filterState.value.startDate,
        endDate: params.endDate !== undefined ? params.endDate : filterState.value.endDate
      }
      const res = await getRecords(mergedParams)
      if (res.code === 200) {
        records.value = res.data.list.sort((a, b) => new Date(b.date) - new Date(a.date))
        // 统计当月数据
        statistics.value = calculateStatistics(records.value)
        filterState.value = {
          type: mergedParams.type,
          startDate: mergedParams.startDate,
          endDate: mergedParams.endDate
        }
      }
    } catch (error) {
      console.error('获取记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    statistics.value = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    }
    records.value = []
    loading.value = false
    filterState.value = {
      type: '',
      startDate: '',
      endDate: ''
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

  const getMonthlyStats = (recordList, month) => {
    return calculateStatistics(recordList, month)
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
    deleteExistingRecord,
    reset,
    getMonthlyStats,
    calculateStatistics
  }
})
