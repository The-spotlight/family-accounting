<template>
  <div class="category-container">
    <h2 class="page-title">分类管理</h2>

    <el-tabs v-model="activeTab" class="category-tabs">
      <el-tab-pane label="收入分类" name="income" />
      <el-tab-pane label="支出分类" name="expense" />
    </el-tabs>

    <el-card class="category-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ activeTab === 'income' ? '收入分类列表' : '支出分类列表' }}</span>
          <el-button type="primary" size="small" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <el-table :data="categoryList" style="width: 100%" stripe>
        <el-table-column label="图标" width="80">
          <template #default="{ row }">
            <div class="icon-cell" :style="{ color: row.color }">
              <el-icon size="24"><component :is="row.icon" /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column label="颜色" width="120">
          <template #default="{ row }">
            <div class="color-cell">
              <div class="color-block" :style="{ backgroundColor: row.color }" />
              <span class="color-text">{{ row.color }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
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
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="categoryForm" label-width="100px">
        <el-form-item label="分类名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="categoryForm.icon" placeholder="选择图标" style="width: 100%">
            <el-option
              v-for="icon in iconList"
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
        <el-form-item label="颜色">
          <el-color-picker v-model="categoryForm.color" />
          <div class="color-preview" :style="{ backgroundColor: categoryForm.color }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useAccountingStore } from '@/stores/accounting'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const categoryStore = useCategoryStore()
const accountingStore = useAccountingStore()
const activeTab = ref('income')
const showAddDialog = ref(false)
const editingCategory = ref(null)

const iconList = [
  'Money', 'Present', 'Briefcase', 'TrendCharts', 'MoreFilled',
  'Food', 'Location', 'ShoppingBag', 'House', 'Headset',
  'FirstAidKit', 'Collection', 'Setting', 'Reading', 'Coffee',
  'Camera', 'Football', 'Music', 'Film', 'GoodsFilled',
  'ShoppingCart', 'Phone', 'Message', 'Document', 'Calendar'
]

const categoryForm = ref({
  name: '',
  icon: 'Document',
  color: '#409eff'
})

const categoryList = computed(() => {
  return activeTab.value === 'income'
    ? categoryStore.incomeCategories
    : categoryStore.expenseCategories
})

const handleEdit = (row) => {
  editingCategory.value = row
  categoryForm.value = { ...row }
  showAddDialog.value = true
}

const handleDelete = (row) => {
  const type = activeTab.value
  const inUse = accountingStore.records.some(
    r => r.category === row.name && r.type === type
  )
  if (inUse) {
    ElMessage.warning(`分类"${row.name}"已被收支记录引用，无法删除`)
    return
  }
  categoryStore.deleteCategory(type, row.id)
}

const handleSubmit = () => {
  if (!categoryForm.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (!categoryForm.value.icon) {
    ElMessage.warning('请选择图标')
    return
  }
  if (!categoryForm.value.color) {
    ElMessage.warning('请选择颜色')
    return
  }

  if (editingCategory.value) {
    categoryStore.updateCategory(activeTab.value, editingCategory.value.id, categoryForm.value)
  } else {
    categoryStore.addCategory(activeTab.value, categoryForm.value)
  }

  showAddDialog.value = false
  editingCategory.value = null
}

const handleDialogClose = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    icon: 'Document',
    color: '#409eff'
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

.category-tabs {
  margin-bottom: 20px;
}

.category-card {
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .color-block {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }

  .color-text {
    font-size: 12px;
    color: #606266;
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 40px;
  height: 32px;
  margin-left: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}
</style>
