<template>
  <div class="budget-container">
    <h2 class="page-title">预算管理</h2>

    <el-card class="budget-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>月度预算设置</span>
        </div>
      </template>
      <el-form :model="budgetForm" label-width="120px" class="budget-form">
        <el-form-item label="月度收入预算">
          <el-input-number
            v-model="budgetForm.income"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 240px"
            placeholder="请输入收入预算金额"
            @change="handleIncomeChange"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="月度支出预算">
          <el-input-number
            v-model="budgetForm.expense"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 240px"
            placeholder="请输入支出预算金额"
            @change="handleExpenseChange"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存预算</el-button>
          <el-button @click="handleReset">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="budget-overview" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>预算使用情况</span>
        </div>
      </template>
      <div class="overview-grid">
        <div class="overview-item">
          <div class="overview-label">收入预算完成率</div>
          <div class="overview-value">
            ¥{{ formatMoney(statistics.totalIncome) }} / ¥{{ formatMoney(budgetForm.income) }}
          </div>
          <el-progress
            :percentage="Math.min(incomeRate, 100)"
            :color="getProgressColor(incomeRate)"
            :stroke-width="20"
            :text-inside="true"
            :format="() => incomeRate.toFixed(1) + '%'"
          />
        </div>
        <div class="overview-item">
          <div class="overview-label">支出预算使用率</div>
          <div class="overview-value">
            ¥{{ formatMoney(statistics.totalExpense) }} / ¥{{ formatMoney(budgetForm.expense) }}
          </div>
          <el-progress
            :percentage="Math.min(expenseRate, 100)"
            :color="getProgressColor(expenseRate)"
            :stroke-width="20"
            :text-inside="true"
            :format="() => expenseRate.toFixed(1) + '%'"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { ElMessage } from 'element-plus'

const accountingStore = useAccountingStore()

const statistics = computed(() => accountingStore.statistics)
const incomeRate = computed(() => accountingStore.incomeBudgetRate)
const expenseRate = computed(() => accountingStore.expenseBudgetRate)

const budgetForm = reactive({
  income: accountingStore.budget.income || 0,
  expense: accountingStore.budget.expense || 0
})

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getProgressColor = (rate) => {
  if (rate > 100) return '#f56c6c'
  if (rate >= 80) return '#e6a23c'
  return '#67c23a'
}

const handleIncomeChange = () => {
  accountingStore.budget.income = budgetForm.income
  accountingStore.saveBudget()
}

const handleExpenseChange = () => {
  accountingStore.budget.expense = budgetForm.expense
  accountingStore.saveBudget()
}

const handleSave = () => {
  accountingStore.budget.income = budgetForm.income
  accountingStore.budget.expense = budgetForm.expense
  accountingStore.saveBudget()
  ElMessage.success('预算保存成功')
}

const handleReset = () => {
  budgetForm.income = 0
  budgetForm.expense = 0
  accountingStore.budget.income = 0
  accountingStore.budget.expense = 0
  accountingStore.saveBudget()
  ElMessage.success('预算已重置')
}

onMounted(() => {
  accountingStore.fetchRecords()
})
</script>

<style lang="scss" scoped>
.budget-container {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

.budget-card, .budget-overview {
  border-radius: 12px;
  margin-bottom: 20px;

  .card-header {
    font-weight: 600;
    font-size: 16px;
  }
}

.budget-form {
  .unit {
    margin-left: 10px;
    color: #909399;
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.overview-item {
  .overview-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .overview-value {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}
</style>
