import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetUsage
} from '@/api/accounting'

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref([])
  const budgetUsage = ref([])
  const loading = ref(false)

  const currentMonth = computed(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const fetchBudgets = async (params = {}) => {
    loading.value = true
    try {
      const res = await getBudgets(params)
      if (res.code === 200) {
        budgets.value = res.data.list
      }
    } catch (error) {
      console.error('获取预算列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchBudgetUsage = async (month) => {
    loading.value = true
    try {
      const res = await getBudgetUsage(month || currentMonth.value)
      if (res.code === 200) {
        budgetUsage.value = res.data.list
      }
    } catch (error) {
      console.error('获取预算使用情况失败:', error)
    } finally {
      loading.value = false
    }
  }

  const createBudget = async (budget) => {
    try {
      const res = await addBudget(budget)
      if (res.code === 200) {
        await fetchBudgets()
        return { success: true, data: res.data }
      }
      return { success: false, message: res.message }
    } catch (error) {
      return { success: false, message: error.message || '添加失败' }
    }
  }

  const modifyBudget = async (id, budget) => {
    try {
      const res = await updateBudget(id, budget)
      if (res.code === 200) {
        await fetchBudgets()
        return { success: true, data: res.data }
      }
      return { success: false, message: res.message }
    } catch (error) {
      return { success: false, message: error.message || '更新失败' }
    }
  }

  const removeBudget = async (id) => {
    try {
      const res = await deleteBudget(id)
      if (res.code === 200) {
        await fetchBudgets()
        return { success: true }
      }
      return { success: false, message: res.message }
    } catch (error) {
      return { success: false, message: error.message || '删除失败' }
    }
  }

  const getCategoryBudgetStatus = (category, month) => {
    const targetMonth = month || currentMonth.value
    const usage = budgetUsage.value.find(
      u => u.category === category && u.month === targetMonth
    )
    return usage || null
  }

  return {
    budgets,
    budgetUsage,
    loading,
    currentMonth,
    fetchBudgets,
    fetchBudgetUsage,
    createBudget,
    modifyBudget,
    removeBudget,
    getCategoryBudgetStatus
  }
})
