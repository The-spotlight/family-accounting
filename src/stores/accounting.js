import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getStatistics, getRecords, addRecord, updateRecord, deleteRecord, updateCategoryInRecords } from '@/api/accounting'
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, RECORDS_STORAGE_KEY } from '@/utils/constants'

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

  // 预算状态 - 从 localStorage 读取
  const budget = ref(JSON.parse(localStorage.getItem('monthly-budget') || '{"income":0,"expense":0}'))

  // 分类状态 - 从 localStorage 读取
  const incomeCategories = ref(JSON.parse(localStorage.getItem('income-categories') || JSON.stringify(DEFAULT_INCOME_CATEGORIES)))
  const expenseCategories = ref(JSON.parse(localStorage.getItem('expense-categories') || JSON.stringify(DEFAULT_EXPENSE_CATEGORIES)))

  // 保存预算到 localStorage
  const saveBudget = () => {
    localStorage.setItem('monthly-budget', JSON.stringify(budget.value))
  }

  // 保存分类到 localStorage
  const saveIncomeCategories = () => {
    localStorage.setItem('income-categories', JSON.stringify(incomeCategories.value))
  }

  const saveExpenseCategories = () => {
    localStorage.setItem('expense-categories', JSON.stringify(expenseCategories.value))
  }

  // 预算使用率
  const incomeBudgetRate = computed(() => {
    if (!budget.value.income) return 0
    return (statistics.value.totalIncome / budget.value.income) * 100
  })

  const expenseBudgetRate = computed(() => {
    if (!budget.value.expense) return 0
    return (statistics.value.totalExpense / budget.value.expense) * 100
  })

  // 月度对比计算
  const monthlyComparison = computed(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // 上月
    const lastDate = new Date(currentYear, currentMonth - 1, 1)
    const lastYear = lastDate.getFullYear()
    const lastMonth = lastDate.getMonth()
    const lastMonthStr = `${lastYear}-${String(lastMonth + 1).padStart(2, '0')}`

    // 本月
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

    // 本月数据
    const currentRecords = records.value.filter(r => r.date.startsWith(currentMonthStr))
    const currentIncome = currentRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    const currentExpense = currentRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    const currentBalance = currentIncome - currentExpense

    // 上月数据
    const lastRecords = records.value.filter(r => r.date.startsWith(lastMonthStr))
    const lastIncome = lastRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    const lastExpense = lastRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    const lastBalance = lastIncome - lastExpense

    // 环比变化率
    const calcRate = (curr, prev) => {
      if (prev === 0) return curr === 0 ? 0 : 100
      return ((curr - prev) / prev) * 100
    }

    // 本月支出分类排行前5
    const currentExpenseByCategory = {}
    currentRecords.filter(r => r.type === 'expense').forEach(r => {
      currentExpenseByCategory[r.category] = (currentExpenseByCategory[r.category] || 0) + r.amount
    })
    const currentExpenseTop5 = Object.entries(currentExpenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))

    // 上月支出分类排行前5
    const lastExpenseByCategory = {}
    lastRecords.filter(r => r.type === 'expense').forEach(r => {
      lastExpenseByCategory[r.category] = (lastExpenseByCategory[r.category] || 0) + r.amount
    })
    const lastExpenseTop5 = Object.entries(lastExpenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))

    return {
      currentIncome,
      currentExpense,
      currentBalance,
      lastIncome,
      lastExpense,
      lastBalance,
      incomeRate: calcRate(currentIncome, lastIncome),
      expenseRate: calcRate(currentExpense, lastExpense),
      balanceRate: calcRate(currentBalance, lastBalance),
      currentExpenseTop5,
      lastExpenseTop5,
      currentMonthLabel: `${currentYear}年${currentMonth + 1}月`,
      lastMonthLabel: `${lastYear}年${lastMonth + 1}月`
    }
  })

  // 根据类型获取分类列表
  const getCategoriesByType = (type) => {
    return type === 'income' ? incomeCategories.value : expenseCategories.value
  }

  // 根据类型和名称获取分类信息
  const getCategoryInfo = (type, name) => {
    const list = getCategoriesByType(type)
    return list.find(c => c.name === name) || null
  }

  // 检查分类是否被记录引用
  const isCategoryUsed = (type, categoryName) => {
    return records.value.some(r => r.type === type && r.category === categoryName)
  }

  // 批量更新记录中引用旧分类名的字段（编辑分类重命名时调用）
  const updateRecordCategoryName = async (type, oldName, newName) => {
    try {
      const res = await updateCategoryInRecords(type, oldName, newName)
      if (res.code === 200) {
        // 刷新记录列表以反映更新
        await fetchRecords(filterState.value)
      }
      return res
    } catch (error) {
      console.error('更新记录分类名失败:', error)
      return { code: 500, message: '更新失败' }
    }
  }

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
      const mergedParams = {
        type: params.type !== undefined ? params.type : filterState.value.type,
        startDate: params.startDate !== undefined ? params.startDate : filterState.value.startDate,
        endDate: params.endDate !== undefined ? params.endDate : filterState.value.endDate
      }
      const res = await getRecords(mergedParams)
      if (res.code === 200) {
        records.value = res.data.list.sort((a, b) => new Date(b.date) - new Date(a.date))
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
    localStorage.removeItem(RECORDS_STORAGE_KEY)
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

  return {
    statistics,
    records,
    loading,
    filterState,
    budget,
    incomeCategories,
    expenseCategories,
    incomeBudgetRate,
    expenseBudgetRate,
    monthlyComparison,
    saveBudget,
    saveIncomeCategories,
    saveExpenseCategories,
    getCategoriesByType,
    getCategoryInfo,
    isCategoryUsed,
    updateRecordCategoryName,
    fetchStatistics,
    fetchRecords,
    addNewRecord,
    updateExistingRecord,
    deleteExistingRecord,
    reset
  }
})
