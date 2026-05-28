<template>
  <div class="budget-container">
    <h2 class="page-title">预算管理</h2>

    <el-card class="budget-card" shadow="hover">
      <template #header>
        <span class="card-title">月度预算设置</span>
      </template>
      <el-form :model="budgetForm" label-width="120px">
        <el-form-item label="月度收入预算">
          <el-input-number
            v-model="budgetForm.incomeBudget"
            :precision="2"
            :min="0"
            :step="100"
            style="width: 300px"
            placeholder="请输入收入预算"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="月度支出预算">
          <el-input-number
            v-model="budgetForm.expenseBudget"
            :precision="2"
            :min="0"
            :step="100"
            style="width: 300px"
            placeholder="请输入支出预算"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存预算</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="budget-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <span class="card-title">当前预算配置</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="收入预算">
          ¥{{ formatMoney(budgetStore.incomeBudget) }}
        </el-descriptions-item>
        <el-descriptions-item label="支出预算">
          ¥{{ formatMoney(budgetStore.expenseBudget) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { ElMessage } from 'element-plus'

const budgetStore = useBudgetStore()

const budgetForm = reactive({
  incomeBudget: budgetStore.incomeBudget,
  expenseBudget: budgetStore.expenseBudget
})

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleSave = () => {
  budgetStore.saveBudget(budgetForm.incomeBudget, budgetForm.expenseBudget)
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

.budget-card {
  border-radius: 12px;

  .card-title {
    font-weight: 600;
  }

  .unit {
    margin-left: 8px;
    color: #909399;
  }
}
</style>
