import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'budget-config'

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

export const useBudgetStore = defineStore('budget', () => {
  const budgetConfig = ref(loadFromStorage())

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetConfig.value))
  }

  const setIncomeBudget = (amount) => {
    budgetConfig.value.incomeBudget = amount
    saveToStorage()
  }

  const setExpenseBudget = (amount) => {
    budgetConfig.value.expenseBudget = amount
    saveToStorage()
  }

  const setBudget = (incomeBudget, expenseBudget) => {
    budgetConfig.value = { incomeBudget, expenseBudget }
    saveToStorage()
  }

  return {
    budgetConfig,
    setIncomeBudget,
    setExpenseBudget,
    setBudget
  }
})
