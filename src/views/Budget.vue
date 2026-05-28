<template>
  <div class="budget-container">
    <h2 class="page-title">预算管理</h2>

    <el-card class="budget-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>设置月度预算</span>
        </div>
      </template>
      <el-form label-width="120px" class="budget-form">
        <el-form-item label="月度收入预算">
          <el-input-number
            v-model="incomeBudgetValue"
            :precision="2"
            :min="0"
            :step="1000"
            style="width: 240px"
            placeholder="请输入月收入预算"
            @blur="handleIncomeBlur"
          />
          <span class="budget-unit">元</span>
        </el-form-item>
        <el-form-item label="月度支出预算">
          <el-input-number
            v-model="expenseBudgetValue"
            :precision="2"
            :min="0"
            :step="1000"
            style="width: 240px"
            placeholder="请输入月支出预算"
            @blur="handleExpenseBlur"
          />
          <span class="budget-unit">元</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存预算</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="budget-info" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当前预算</span>
        </div>
      </template>
      <div class="budget-display">
        <div class="budget-item">
          <div class="budget-label">月度收入预算</div>
          <div class="budget-value">¥{{ formatMoney(budgetStore.incomeBudget) }}</div>
        </div>
        <div class="budget-item">
          <div class="budget-label">月度支出预算</div>
          <div class="budget-value">¥{{ formatMoney(budgetStore.expenseBudget) }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { ElMessage } from 'element-plus'

const budgetStore = useBudgetStore()

const incomeBudgetValue = ref(budgetStore.incomeBudget)
const expenseBudgetValue = ref(budgetStore.expenseBudget)

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleIncomeBlur = () => {
  budgetStore.setIncomeBudget(incomeBudgetValue.value)
}

const handleExpenseBlur = () => {
  budgetStore.setExpenseBudget(expenseBudgetValue.value)
}

const handleSave = () => {
  budgetStore.setIncomeBudget(incomeBudgetValue.value)
  budgetStore.setExpenseBudget(expenseBudgetValue.value)
  ElMessage.success('预算保存成功')
}
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

.budget-card,
.budget-info {
  border-radius: 12px;
  margin-bottom: 20px;

  .card-header {
    font-weight: 600;
  }
}

.budget-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .budget-unit {
    margin-left: 12px;
    color: #606266;
  }
}

.budget-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;

  .budget-item {
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    text-align: center;

    .budget-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;
    }

    .budget-value {
      font-size: 28px;
      font-weight: 600;
      color: #67c23a;
    }
  }
}
</style>
