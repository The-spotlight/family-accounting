<template>
  <div class="budget-container">
    <div class="page-header">
      <h2 class="page-title">预算管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加预算
      </el-button>
    </div>

    <!-- 月份选择 -->
    <el-card class="filter-card" shadow="hover">
      <el-form inline>
        <el-form-item label="选择月份">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 200px"
            @change="fetchBudgets"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预算列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="budgetList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="category" label="分类" width="150" />
        <el-table-column label="预算金额" width="150">
          <template #default="{ row }">
            <span class="budget-amount">¥{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已使用" width="150">
          <template #default="{ row }">
            <span :class="getAmountClass(row)">
              ¥{{ formatMoney(row.used || 0) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="使用进度" width="300">
          <template #default="{ row }">
            <div class="progress-container">
              <el-progress
                :percentage="Math.min(row.percentage || 0, 100)"
                :status="getProgressStatus(row)"
                :stroke-width="12"
              />
              <span class="percentage-text">{{ (row.percentage || 0).toFixed(1) }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingBudget ? '编辑预算' : '添加预算'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="budgetFormRef"
        :model="budgetForm"
        :rules="budgetRules"
        label-width="80px"
      >
        <el-form-item label="分类" prop="category">
          <el-input v-model="budgetForm.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="预算金额" prop="amount">
          <el-input-number
            v-model="budgetForm.amount"
            :precision="2"
            :min="0.01"
            :step="100"
            style="width: 100%"
            placeholder="请输入预算金额"
          />
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <el-date-picker
            v-model="budgetForm.month"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getBudgets, addBudget, updateBudget, deleteBudget, getBudgetUsage } from '@/api/accounting'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const editingBudget = ref(null)
const budgetFormRef = ref(null)
const budgetList = ref([])
const selectedMonth = ref(new Date().toISOString().slice(0, 7))

const budgetForm = reactive({
  category: '',
  amount: 0,
  month: new Date().toISOString().slice(0, 7)
})

const budgetRules = {
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }]
}

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getAmountClass = (row) => {
  if (row.status === 'over') return 'amount-over'
  if (row.status === 'warning') return 'amount-warning'
  return 'amount-normal'
}

const getProgressStatus = (row) => {
  if (row.status === 'over') return 'exception'
  if (row.status === 'warning') return 'warning'
  return ''
}

const getTagType = (row) => {
  if (row.status === 'over') return 'danger'
  if (row.status === 'warning') return 'warning'
  return 'success'
}

const getStatusText = (row) => {
  if (row.status === 'over') return '超支'
  if (row.status === 'warning') return '警告'
  return '正常'
}

const fetchBudgets = async () => {
  loading.value = true
  try {
    // 获取预算使用情况
    const res = await getBudgetUsage(selectedMonth.value)
    if (res.code === 200) {
      budgetList.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取预算列表失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editingBudget.value = row
  Object.assign(budgetForm, {
    category: row.category,
    amount: row.amount,
    month: row.month
  })
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条预算吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteBudget(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchBudgets()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!budgetFormRef.value) return

  await budgetFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        if (editingBudget.value) {
          res = await updateBudget(editingBudget.value.id, budgetForm)
        } else {
          res = await addBudget(budgetForm)
        }
        if (res.code === 200) {
          ElMessage.success(editingBudget.value ? '更新成功' : '添加成功')
          showAddDialog.value = false
          fetchBudgets()
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  editingBudget.value = null
  Object.assign(budgetForm, {
    category: '',
    amount: 0,
    month: new Date().toISOString().slice(0, 7)
  })
  budgetFormRef.value?.clearValidate()
}

onMounted(() => {
  fetchBudgets()
})
</script>

<style lang="scss" scoped>
.budget-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.table-card {
  border-radius: 12px;
}

.budget-amount {
  font-weight: 600;
  color: #409eff;
}

.amount-normal {
  color: #67c23a;
  font-weight: 600;
}

.amount-warning {
  color: #e6a23c;
  font-weight: 600;
}

.amount-over {
  color: #f56c6c;
  font-weight: 600;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .percentage-text {
    font-size: 14px;
    font-weight: 600;
    min-width: 50px;
  }
}
</style>
