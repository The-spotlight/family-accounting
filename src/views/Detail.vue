<template>
  <div class="detail-container">
    <div class="page-header">
      <h2 class="page-title">收支明细</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <!-- 筛选条件 -->
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

    <!-- 记录列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="paginatedRecordList"
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
        <el-table-column label="金额" width="180">
          <template #default="{ row }">
            <div class="amount-wrapper">
              <span :class="getAmountClass(row)">
                {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
              </span>
              <span v-if="getBudgetWarning(row)" class="budget-warning">
                <el-icon v-if="getBudgetWarning(row) === 'exceeded'" class="warning-icon exceeded">
                  <WarningFilled />
                </el-icon>
                <el-icon v-else-if="getBudgetWarning(row) === 'warning'" class="warning-icon warning">
                  <Warning />
                </el-icon>
              </span>
            </div>
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
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="recordList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
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
          <el-input v-model="recordForm.category" placeholder="请输入分类" />
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
import { getRecords, addRecord, updateRecord, deleteRecord } from '@/api/accounting'
import { useBudgetStore } from '@/stores/budget'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Warning, WarningFilled } from '@element-plus/icons-vue'

const budgetStore = useBudgetStore()
const budgetUsage = computed(() => budgetStore.budgetUsage)

const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const editingRecord = ref(null)
const recordFormRef = ref(null)
const recordList = ref([])

const currentPage = ref(1)
const pageSize = ref(20)
const pageSizes = [10, 20, 50]

const paginatedRecordList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return recordList.value.slice(start, end)
})

const filterForm = reactive({
  type: '',
  startDate: '',
  endDate: ''
})

const recordForm = reactive({
  type: 'expense',
  category: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  remark: ''
})

const recordRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getRecordMonth = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const getCategoryBudgetStatus = (category, month) => {
  return budgetUsage.value.find(
    u => u.category === category && u.month === month
  )
}

const getAmountClass = (row) => {
  if (row.type === 'income') {
    return 'income-text'
  }
  
  const month = getRecordMonth(row.date)
  const budgetStatus = getCategoryBudgetStatus(row.category, month)
  
  if (budgetStatus) {
    if (budgetStatus.status === 'exceeded') {
      return 'expense-exceeded'
    }
    if (budgetStatus.status === 'warning') {
      return 'expense-warning'
    }
  }
  
  return 'expense-text'
}

const getBudgetWarning = (row) => {
  if (row.type === 'income') {
    return null
  }
  
  const month = getRecordMonth(row.date)
  const budgetStatus = getCategoryBudgetStatus(row.category, month)
  
  if (budgetStatus) {
    return budgetStatus.status
  }
  
  return null
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await getRecords(filterForm)
    if (res.code === 200) {
      recordList.value = res.data.list
      currentPage.value = 1
    }
  } catch (error) {
    ElMessage.error('获取记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchRecords()
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.startDate = ''
  filterForm.endDate = ''
  fetchRecords()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
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
    const res = await deleteRecord(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchRecords()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!recordFormRef.value) return

  await recordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        if (editingRecord.value) {
          res = await updateRecord(editingRecord.value.id, recordForm)
        } else {
          res = await addRecord(recordForm)
        }
        if (res.code === 200) {
          ElMessage.success(editingRecord.value ? '更新成功' : '添加成功')
          showAddDialog.value = false
          fetchRecords()
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
  editingRecord.value = null
  Object.assign(recordForm, {
    type: 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    remark: ''
  })
  recordFormRef.value?.clearValidate()
}

onMounted(() => {
  fetchRecords()
  budgetStore.fetchBudgetUsage()
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.income-text {
  color: #67c23a;
  font-weight: 600;
}

.expense-text {
  color: #f56c6c;
  font-weight: 600;
}

.expense-warning {
  color: #e6a23c;
  font-weight: 600;
}

.expense-exceeded {
  color: #f56c6c;
  font-weight: 600;
}

.amount-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.budget-warning {
  display: inline-flex;
  align-items: center;
}

.warning-icon {
  font-size: 16px;
  
  &.warning {
    color: #e6a23c;
  }
  
  &.exceeded {
    color: #f56c6c;
  }
}
</style>
