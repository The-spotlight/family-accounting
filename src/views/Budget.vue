<template>
  <div class="budget-container">
    <h2 class="page-title">预算管理</h2>

    <el-card class="budget-card" shadow="hover">
      <template #header>
        <span class="card-title">月度预算设置</span>
      </template>
      <el-form :model="budgetForm" label-width="120px" style="max-width: 500px">
        <el-form-item label="收入预算">
          <el-input-number
            v-model="budgetForm.incomeBudget"
            :precision="2"
            :min="0"
            :step="100"
            style="width: 100%"
            placeholder="请输入月度收入预算"
          />
        </el-form-item>
        <el-form-item label="支出预算">
          <el-input-number
            v-model="budgetForm.expenseBudget"
            :precision="2"
            :min="0"
            :step="100"
            style="width: 100%"
            placeholder="请输入月度支出预算"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { ElMessage } from 'element-plus'

const budgetStore = useBudgetStore()

const budgetForm = reactive({
  incomeBudget: 0,
  expenseBudget: 0
})

const handleSave = () => {
  budgetStore.setBudget(budgetForm.incomeBudget, budgetForm.expenseBudget)
  ElMessage.success('预算设置已保存')
}

const handleReset = () => {
  budgetForm.incomeBudget = 0
  budgetForm.expenseBudget = 0
}

onMounted(() => {
  budgetForm.incomeBudget = budgetStore.budgetConfig.incomeBudget
  budgetForm.expenseBudget = budgetStore.budgetConfig.expenseBudget
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

.budget-card {
  border-radius: 12px;

  .card-title {
    font-weight: 600;
    font-size: 16px;
  }
}
</style>
