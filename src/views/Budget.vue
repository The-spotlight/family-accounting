<template>
  <div class="budget-container">
    <div class="page-header">
      <h2 class="page-title">预算管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加预算
      </el-button>
    </div>

    <el-card class="filter-card" shadow="hover">
      <el-form :model="filterForm" inline>
        <el-form-item label="月份">
          <el-date-picker
            v-model="filterForm.month"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="budgetList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="category" label="分类" width="150" />
        <el-table-column prop="amount" label="预算金额" width="150">
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
        <el-table-column label="剩余" width="150">
          <template #default="{ row }">
            <span :class="getRemainingClass(row)">
              ¥{{ formatMoney(row.remaining || row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="使用进度" min-width="200">
          <template #default="{ row }">
            <div class="progress-wrapper">
              <el-progress
                :percentage="row.percentage || 0"
                :status="getProgressStatus(row)"
                :stroke-width="12"
              />
              <span class="percentage-text">{{ (row.percentage || 0).toFixed(1) }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
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

      <el-empty v-if="!loading && budgetList.length === 0" description="暂无预算数据" />
    </el-card>

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
          <el-input v-model="budgetForm.category" placeholder="请输入分类名称" />
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const budgetStore = useBudgetStore()

const loading = computed(() => budgetStore.loading)
const budgetUsage = computed(() => budgetStore.budgetUsage)

const showAddDialog = ref(false)
const submitting = ref(false)
const editingBudget = ref(null)
const budgetFormRef = ref(null)

const filterForm = reactive({
  month: budgetStore.currentMonth
})

const budgetForm = reactive({
  category: '',
  amount: 0,
  month: budgetStore.currentMonth
})

const budgetRules = {
  category: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }]
}

const budgetList = computed(() => {
  return budgetUsage.value.map(usage => ({
    ...usage,
    status: usage.status || 'normal'
  }))
})

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getAmountClass = (row) => {
  if (row.status === 'exceeded') return 'amount-exceeded'
  if (row.status === 'warning') return 'amount-warning'
  return 'amount-normal'
}

const getRemainingClass = (row) => {
  if (row.remaining <= 0) return 'remaining-exceeded'
  return 'remaining-normal'
}

const getProgressStatus = (row) => {
  if (row.status === 'exceeded') return 'exception'
  if (row.status === 'warning') return 'warning'
  return ''
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'exceeded':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'success'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'exceeded':
      return '已超支'
    case 'warning':
      return '预警'
    default:
      return '正常'
  }
}

const fetchData = async () => {
  await budgetStore.fetchBudgetUsage(filterForm.month)
}

const handleSearch = () => {
  fetchData()
}

const handleReset = () => {
  filterForm.month = budgetStore.currentMonth
  fetchData()
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
    const result = await budgetStore.removeBudget(row.id)
    if (result.success) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(result.message || '删除失败')
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
        let result
        if (editingBudget.value) {
          result = await budgetStore.modifyBudget(editingBudget.value.id, budgetForm)
        } else {
          result = await budgetStore.createBudget(budgetForm)
        }
        if (result.success) {
          ElMessage.success(editingBudget.value ? '更新成功' : '添加成功')
          showAddDialog.value = false
          fetchData()
        } else {
          ElMessage.error(result.message || '操作失败')
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
    month: budgetStore.currentMonth
  })
  budgetFormRef.value?.clearValidate()
}

watch(
  () => filterForm.month,
  () => {
    fetchData()
  }
)

onMounted(() => {
  fetchData()
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
  color: #606266;
}

.amount-warning {
  color: #e6a23c;
  font-weight: 600;
}

.amount-exceeded {
  color: #f56c6c;
  font-weight: 600;
}

.remaining-normal {
  color: #67c23a;
  font-weight: 600;
}

.remaining-exceeded {
  color: #f56c6c;
  font-weight: 600;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;

  :deep(.el-progress) {
    flex: 1;
  }
}

.percentage-text {
  font-size: 12px;
  color: #909399;
  min-width: 50px;
  text-align: right;
}
</style>
