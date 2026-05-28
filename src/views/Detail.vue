<template>
  <div class="detail-container">
    <div class="page-header">
      <h2 class="page-title">收支明细</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <el-card class="filter-card" shadow="hover">
      <el-form :model="filterForm" inline>
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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
        :data="recordList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="150">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'income-text' : 'expense-text'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
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

    <el-dialog
      v-model="showAddDialog"
      :title="editingRecord ? '编辑记录' : '添加记录'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="recordFormRef"
        :model="recordForm"
        :rules="recordRules"
        label-width="80px"
      >
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="recordForm.type">
            <el-radio label="income">收入</el-radio>
            <el-radio label="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="recordForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in currentCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            >
              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  style="width: 20px; height: 20px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;"
                  :style="{ backgroundColor: cat.color }"
                >
                  <el-icon><component :is="cat.icon" /></el-icon>
                </span>
                <span>{{ cat.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="recordForm.amount"
            :precision="2"
            :min="0.01"
            :step="0.01"
            style="width: 100%"
            placeholder="请输入金额"
          />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="recordForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { useCategoryStore } from '@/stores/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const accountingStore = useAccountingStore()
const categoryStore = useCategoryStore()

const currentCategories = computed(() => {
  return recordForm.type === 'income'
    ? categoryStore.incomeCategories
    : categoryStore.expenseCategories
})

const loading = computed(() => accountingStore.loading)
const submitting = ref(false)
const showAddDialog = ref(false)
const editingRecord = ref(null)
const recordFormRef = ref(null)
const recordList = computed(() => accountingStore.records)

const filterForm = reactive({
  type: '',
  startDate: '',
  endDate: ''
})

const loadFilterState = () => {
  filterForm.type = accountingStore.filterState.type
  filterForm.startDate = accountingStore.filterState.startDate
  filterForm.endDate = accountingStore.filterState.endDate
}

const recordForm = reactive({
  type: 'expense',
  category: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  remark: ''
})

const recordRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleSearch = () => {
  accountingStore.fetchRecords(filterForm)
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.startDate = ''
  filterForm.endDate = ''
  accountingStore.fetchRecords()
}

const handleEdit = (row) => {
  editingRecord.value = row
  Object.assign(recordForm, {
    type: row.type,
    category: row.category,
    amount: row.amount,
    date: row.date,
    remark: row.remark || ''
  })
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await accountingStore.deleteExistingRecord(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error === 'cancel') {
      return
    }
  }
}

const handleSubmit = async () => {
  if (!recordFormRef.value) return

  await recordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (editingRecord.value) {
          await accountingStore.updateExistingRecord(editingRecord.value.id, recordForm)
          ElMessage.success('更新成功')
        } else {
          await accountingStore.addNewRecord(recordForm)
          ElMessage.success('添加成功')
        }
        handleDialogClose()
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  editingRecord.value = null
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
  Object.assign(recordForm, {
    type: 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    remark: ''
  })
}

onMounted(() => {
  loadFilterState()
  accountingStore.fetchRecords(filterForm)
})
</script>

<style lang="scss" scoped>
.detail-container {
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

.income-text {
  color: #67c23a;
  font-weight: 600;
}

.expense-text {
  color: #f56c6c;
  font-weight: 600;
}
</style>
