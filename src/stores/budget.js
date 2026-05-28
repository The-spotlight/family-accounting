import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'budget-config'

export const useBudgetStore = defineStore('budget', () => {
  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return { incomeBudget: 0, expenseBudget: 0 }
      }
    }
    return { incomeBudget: 0, expenseBudget: 0 }
  }

  const savedData = loadFromStorage()
  const incomeBudget = ref(savedData.incomeBudget)
  const expenseBudget = ref(savedData.expenseBudget)

  const saveBudget = (income, expense) => {
    incomeBudget.value = income
    expenseBudget.value = expense
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      incomeBudget: income,
      expenseBudget: expense
    }))
  }

  return {
    incomeBudget,
    expenseBudget,
    saveBudget
  }
})
