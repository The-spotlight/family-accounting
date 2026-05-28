import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBudgetStore = defineStore('budget', () => {
  const incomeBudget = ref(parseFloat(localStorage.getItem('income-budget') || '0'))
  const expenseBudget = ref(parseFloat(localStorage.getItem('expense-budget') || '0'))

  const setIncomeBudget = (amount) => {
    incomeBudget.value = amount
    localStorage.setItem('income-budget', String(amount))
  }

  const setExpenseBudget = (amount) => {
    expenseBudget.value = amount
    localStorage.setItem('expense-budget', String(amount))
  }

  const reset = () => {
    incomeBudget.value = 0
    expenseBudget.value = 0
    localStorage.removeItem('income-budget')
    localStorage.removeItem('expense-budget')
  }

  return {
    incomeBudget,
    expenseBudget,
    setIncomeBudget,
    setExpenseBudget,
    reset
  }
})
