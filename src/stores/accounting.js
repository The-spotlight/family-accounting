import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStatistics, getRecords, addRecord, updateRecord, deleteRecord } from '@/api/accounting'

export const useAccountingStore = defineStore('accounting', () => {
  // 状态
  const statistics = ref({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  })
  const records = ref([])
  const loading = ref(false)

  // 计算属性
  const recentRecords = computed(() => {
    return records.value.slice(0, 5)
  })

  // 方法
  const fetchStatistics = async () => {
    loading.value = true
    try {
      const res = await getStatistics()
      if (res.code === 200) {
        statistics.value = res.data
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchRecords = async (params = {}) => {
    loading.value = true
    try {
      const res = await getRecords(params)
      if (res.code === 200) {
        records.value = res.data.list
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
        // 重新获取统计数据和记录列表
        await fetchStatistics()
        await fetchRecords()
        return res
      }
    } catch (error) {
      console.error('添加记录失败:', error)
      throw error
    }
  }

  const updateExistingRecord = async (id, record) => {
    try {
      const res = await updateRecord(id, record)
      if (res.code === 200) {
        // 重新获取统计数据和记录列表
        await fetchStatistics()
        await fetchRecords()
        return res
      }
    } catch (error) {
      console.error('更新记录失败:', error)
      throw error
    }
  }

  const deleteExistingRecord = async (id) => {
    try {
      const res = await deleteRecord(id)
      if (res.code === 200) {
        // 重新获取统计数据和记录列表
        await fetchStatistics()
        await fetchRecords()
        return res
      }
    } catch (error) {
      console.error('删除记录失败:', error)
      throw error
    }
  }

  return {
    statistics,
    records,
    loading,
    recentRecords,
    fetchStatistics,
    fetchRecords,
    addNewRecord,
    updateExistingRecord,
    deleteExistingRecord
  }
})
