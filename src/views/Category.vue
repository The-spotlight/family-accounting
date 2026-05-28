<template>
  <div class="category-container">
    <h2 class="page-title">分类管理</h2>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="收入分类" name="income">
        <div class="category-header">
          <el-button type="primary" @click="handleAdd('income')">
            <el-icon><Plus /></el-icon>
            添加收入分类
          </el-button>
        </div>
        <el-table :data="categoryStore.incomeCategories" stripe style="width: 100%">
          <el-table-column label="图标" width="80">
            <template #default="{ row }">
              <div class="icon-preview" :style="{ backgroundColor: row.color }">
                <el-icon><component :is="row.icon" /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="icon" label="图标名" width="140" />
          <el-table-column label="颜色" width="100">
            <template #default="{ row }">
              <div class="color-preview">
                <span class="color-dot" :style="{ backgroundColor: row.color }"></span>
                {{ row.color }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="支出分类" name="expense">
        <div class="category-header">
          <el-button type="primary" @click="handleAdd('expense')">
            <el-icon><Plus /></el-icon>
            添加支出分类
          </el-button>
        </div>
        <el-table :data="categoryStore.expenseCategories" stripe style="width: 100%">
          <el-table-column label="图标" width="80">
            <template #default="{ row }">
              <div class="icon-preview" :style="{ backgroundColor: row.color }">
                <el-icon><component :is="row.icon" /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="icon" label="图标名" width="140" />
          <el-table-column label="颜色" width="100">
            <template #default="{ row }">
              <div class="color-preview">
                <span class="color-dot" :style="{ backgroundColor: row.color }"></span>
                {{ row.color }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="showDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="480px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标" filterable style="width: 100%">
            <el-option
              v-for="icon in iconOptions"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <div class="icon-option">
                <el-icon><component :is="icon" /></el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="formData.color" show-alpha :predefine="predefineColors" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useAccountingStore } from '@/stores/accounting'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const categoryStore = useCategoryStore()
const accountingStore = useAccountingStore()

const activeTab = ref('income')
const showDialog = ref(false)
const editingCategory = ref(null)
const formRef = ref(null)

const iconOptions = [
  'Money', 'Wallet', 'CreditCard', 'Coin', 'Trophy',
  'Briefcase', 'TrendCharts', 'ShoppingCart', 'Goods', 'Box',
  'House', 'Van', 'Car', 'Bicycle', 'Bus',
  'Bowl', 'Food', 'Coffee', 'Goblet', 'IceCream',
  'Film', 'Headset', 'Music', 'Mic', 'Camera',
  'FirstAidKit', 'Reading', 'School', 'Notebook', 'Document',
  'Phone', 'Monitor', 'Cellphone', 'Lightning', 'Sunny',
  'More', 'Star', 'Flag', 'Present', 'Key'
]

const predefineColors = [
  '#67c23a', '#e6a23c', '#f56c6c', '#409eff',
  '#9b59b6', '#e74c3c', '#3498db', '#1abc9c',
  '#f39c12', '#2ecc71', '#909399', '#c0392b'
]

const formData = reactive({
  type: 'income',
  name: '',
  icon: '',
  color: '#409eff'
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

const handleAdd = (type) => {
  editingCategory.value = null
  formData.type = type
  formData.name = ''
  formData.icon = ''
  formData.color = '#409eff'
  showDialog.value = true
}

const handleEdit = (row) => {
  editingCategory.value = row
  Object.assign(formData, {
    type: row.type,
    name: row.name,
    icon: row.icon,
    color: row.color
  })
  showDialog.value = true
}

const handleDelete = async (row) => {
  const records = accountingStore.records
  const hasRecords = records.some(r => r.category === row.name && r.type === row.type)
  if (hasRecords) {
    ElMessage.warning(`分类"${row.name}"已被收支记录引用，无法删除`)
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    categoryStore.deleteCategory(row.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (editingCategory.value) {
        categoryStore.updateCategory(editingCategory.value.id, {
          name: formData.name,
          icon: formData.icon,
          color: formData.color
        })
        ElMessage.success('更新成功')
      } else {
        categoryStore.addCategory({
          type: formData.type,
          name: formData.name,
          icon: formData.icon,
          color: formData.color
        })
        ElMessage.success('添加成功')
      }
      showDialog.value = false
    }
  })
}

const handleDialogClose = () => {
  editingCategory.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.category-container {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

.category-header {
  margin-bottom: 16px;
}

.icon-preview {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 6px;

  .color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #dcdfe6;
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
