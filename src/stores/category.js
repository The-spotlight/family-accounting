import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMockRecords } from '@/utils/mock'

const defaultIncomeCategories = [
  { id: 1, name: '工资', icon: 'Money', color: '#67c23a' },
  { id: 2, name: '奖金', icon: 'Present', color: '#e6a23c' },
  { id: 3, name: '兼职', icon: 'Briefcase', color: '#409eff' },
  { id: 4, name: '理财', icon: 'TrendCharts', color: '#909399' },
  { id: 5, name: '其他', icon: 'MoreFilled', color: '#c0c4cc' }
]

const defaultExpenseCategories = [
  { id: 6, name: '餐饮', icon: 'Food', color: '#f56c6c' },
  { id: 7, name: '交通', icon: 'Location', color: '#409eff' },
  { id: 8, name: '购物', icon: 'ShoppingBag', color: '#e6a23c' },
  { id: 9, name: '住房', icon: 'House', color: '#67c23a' },
  { id: 10, name: '娱乐', icon: 'Headset', color: '#9b59b6' },
  { id: 11, name: '医疗', icon: 'FirstAidKit', color: '#f56c6c' },
  { id: 12, name: '教育', icon: 'Collection', color: '#409eff' },
  { id: 13, name: '其他', icon: 'MoreFilled', color: '#c0c4cc' }
]

export const useCategoryStore = defineStore('category', () => {
  const incomeCategories = ref([])
  const expenseCategories = ref([])

  const _load = () => {
    const raw = localStorage.getItem('category-list')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.incomeCategories && parsed.expenseCategories) {
          incomeCategories.value = parsed.incomeCategories
          expenseCategories.value = parsed.expenseCategories
          return
        }
      } catch (e) { /* ignore */ }
    }
    incomeCategories.value = JSON.parse(JSON.stringify(defaultIncomeCategories))
    expenseCategories.value = JSON.parse(JSON.stringify(defaultExpenseCategories))
    _save()
  }

  const _save = () => {
    localStorage.setItem('category-list', JSON.stringify({
      incomeCategories: incomeCategories.value,
      expenseCategories: expenseCategories.value
    }))
  }

  const getNextId = () => {
    const all = [...incomeCategories.value, ...expenseCategories.value]
    return all.length ? Math.max(...all.map(c => c.id)) + 1 : 1
  }

  const addCategory = (type, category) => {
    const newCat = {
      id: getNextId(),
      name: category.name,
      icon: category.icon,
      color: category.color
    }
    if (type === 'income') {
      incomeCategories.value.push(newCat)
    } else {
      expenseCategories.value.push(newCat)
    }
    _save()
    ElMessage.success('添加成功')
  }

  const updateCategory = (type, id, data) => {
    const list = type === 'income' ? incomeCategories.value : expenseCategories.value
    const index = list.findIndex(c => c.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...data }
      _save()
      ElMessage.success('更新成功')
    }
  }

  const deleteCategory = (type, id) => {
    const list = type === 'income' ? incomeCategories.value : expenseCategories.value
    const cat = list.find(c => c.id === id)
    if (!cat) return

    const allRecords = getMockRecords()
    const hasRecords = allRecords.some(r => r.category === cat.name && r.type === type)
    if (hasRecords) {
      ElMessage.warning(`分类"${cat.name}"已被收支记录引用，无法删除`)
      return false
    }

    if (type === 'income') {
      incomeCategories.value = incomeCategories.value.filter(c => c.id !== id)
    } else {
      expenseCategories.value = expenseCategories.value.filter(c => c.id !== id)
    }
    _save()
    ElMessage.success('删除成功')
    return true
  }

  const getCategoryByName = (name) => {
    return [...incomeCategories.value, ...expenseCategories.value].find(c => c.name === name) || null
  }

  _load()

  return {
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName
  }
})
