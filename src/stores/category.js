import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'categories'

const defaultCategories = [
  { id: 1, type: 'income', name: '工资', icon: 'Money', color: '#67c23a' },
  { id: 2, type: 'income', name: '奖金', icon: 'Trophy', color: '#e6a23c' },
  { id: 3, type: 'income', name: '兼职', icon: 'Briefcase', color: '#409eff' },
  { id: 4, type: 'income', name: '理财', icon: 'TrendCharts', color: '#f56c6c' },
  { id: 5, type: 'income', name: '其他', icon: 'More', color: '#909399' },
  { id: 6, type: 'expense', name: '餐饮', icon: 'Bowl', color: '#f56c6c' },
  { id: 7, type: 'expense', name: '交通', icon: 'Van', color: '#e6a23c' },
  { id: 8, type: 'expense', name: '购物', icon: 'ShoppingCart', color: '#409eff' },
  { id: 9, type: 'expense', name: '住房', icon: 'House', color: '#67c23a' },
  { id: 10, type: 'expense', name: '娱乐', icon: 'Film', color: '#9b59b6' },
  { id: 11, type: 'expense', name: '医疗', icon: 'FirstAidKit', color: '#e74c3c' },
  { id: 12, type: 'expense', name: '教育', icon: 'Reading', color: '#3498db' },
  { id: 13, type: 'expense', name: '其他', icon: 'More', color: '#909399' }
]

const loadFromStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return [...defaultCategories]
    }
  }
  return [...defaultCategories]
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref(loadFromStorage())

  const incomeCategories = computed(() =>
    categories.value.filter(c => c.type === 'income')
  )

  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense')
  )

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.value))
  }

  const getNextId = () => {
    if (categories.value.length === 0) return 1
    return Math.max(...categories.value.map(c => c.id)) + 1
  }

  const addCategory = (category) => {
    const newCategory = { ...category, id: getNextId() }
    categories.value.push(newCategory)
    saveToStorage()
  }

  const updateCategory = (id, data) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...data }
      saveToStorage()
    }
  }

  const deleteCategory = (id) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value.splice(index, 1)
      saveToStorage()
    }
  }

  const getCategoryByName = (name, type) => {
    return categories.value.find(c => c.name === name && c.type === type)
  }

  const getCategoriesByType = (type) => {
    return categories.value.filter(c => c.type === type)
  }

  return {
    categories,
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName,
    getCategoriesByType
  }
})
