<template>
  <div class="category-container">
    <div class="page-header">
      <h2 class="page-title">分类管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <el-card class="category-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="收入分类" name="income">
          <div class="category-list">
            <div
              v-for="item in categoryStore.incomeCategories"
              :key="item.id"
              class="category-item"
            >
              <div class="category-info">
                <span class="category-icon" :style="{ backgroundColor: item.color }">
                  <el-icon><component :is="item.icon" /></el-icon>
                </span>
                <span class="category-name">{{ item.name }}</span>
                <span class="category-color-dot" :style="{ backgroundColor: item.color }"></span>
              </div>
              <div class="category-actions">
                <el-button type="primary" link size="small" @click="handleEdit(item)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="categoryStore.incomeCategories.length === 0" description="暂无收入分类" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="支出分类" name="expense">
          <div class="category-list">
            <div
              v-for="item in categoryStore.expenseCategories"
              :key="item.id"
              class="category-item"
            >
              <div class="category-info">
                <span class="category-icon" :style="{ backgroundColor: item.color }">
                  <el-icon><component :is="item.icon" /></el-icon>
                </span>
                <span class="category-name">{{ item.name }}</span>
                <span class="category-color-dot" :style="{ backgroundColor: item.color }"></span>
              </div>
              <div class="category-actions">
                <el-button type="primary" link size="small" @click="handleEdit(item)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="categoryStore.expenseCategories.length === 0" description="暂无支出分类" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="480px"
      @close="handleDialogClose"
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="categoryForm.type">
            <el-radio label="income">收入</el-radio>
            <el-radio label="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="categoryForm.icon" placeholder="请选择图标" style="width: 100%">
            <el-option
              v-for="icon in iconList"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon><component :is="icon" /></el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="categoryForm.color" />
          <span class="color-value">{{ categoryForm.color }}</span>
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

// 可供用户选择的图标列表（覆盖钱币、购物、食物、交通、住房、医疗、教育、娱乐等场景）
const iconList = [
  'Money', 'Wallet', 'Coin', 'CreditCard', 'PriceTag',
  'ShoppingCart', 'Goods', 'ShoppingBag', 'Present', 'SoldOut',
  'Bowl', 'Coffee', 'Apple', 'Grape', 'Orange',
  'Van', 'Bicycle', 'Ship', 'Location', 'Place',
  'House', 'OfficeBuilding', 'School', 'HomeFilled',
  'FirstAidKit', 'Help',
  'Reading', 'Notebook', 'Document',
  'Film', 'Headset', 'Ticket', 'Camera',
  'Trophy', 'TrendCharts', 'Briefcase',
  'Phone', 'Monitor', 'MoreFilled'
]

const categoryStore = useCategoryStore()
const accountingStore = useAccountingStore()

const activeTab = ref('income')
const showDialog = ref(false)
const editingCategory = ref(null)
const categoryFormRef = ref(null)

const categoryForm = reactive({
  type: 'income',
  name: '',
  icon: '',
  color: '#409eff'
})

const categoryRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

const handleAdd = () => {
  editingCategory.value = null
  Object.assign(categoryForm, {
    type: activeTab.value,
    name: '',
    icon: '',
    color: '#409eff'
  })
  showDialog.value = true
}

const handleEdit = (item) => {
  editingCategory.value = item
  Object.assign(categoryForm, {
    type: item.type,
    name: item.name,
    icon: item.icon,
    color: item.color
  })
  showDialog.value = true
}

const handleDelete = async (item) => {
  // 检查是否有记录引用该分类
  const hasRecords = accountingStore.records.some(
    r => r.category === item.name && r.type === item.type
  )
  if (hasRecords) {
    ElMessageBox.alert(
      `分类"${item.name}"已被收支记录引用，无法删除。请先修改相关记录的分类后再删除。`,
      '无法删除',
      { type: 'warning' }
    )
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除分类"${item.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    categoryStore.deleteCategory(item.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!categoryFormRef.value) return
  await categoryFormRef.value.validate((valid) => {
    if (valid) {
      if (editingCategory.value) {
        categoryStore.updateCategory(editingCategory.value.id, { ...categoryForm })
        ElMessage.success('更新成功')
      } else {
        categoryStore.addCategory({ ...categoryForm })
        ElMessage.success('添加成功')
      }
      showDialog.value = false
    }
  })
}

const handleDialogClose = () => {
  editingCategory.value = null
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.category-container {
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

.category-card {
  border-radius: 12px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: background 0.3s;

  &:hover {
    background: #ecf5ff;
  }
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.category-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.category-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.category-actions {
  display: flex;
  gap: 4px;
}

.color-value {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
