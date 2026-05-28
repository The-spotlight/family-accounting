<template>
  <div class="categories-container">
    <h2 class="page-title">分类管理</h2>

    <el-card class="categories-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="收入分类" name="income">
          <div class="tab-header">
            <el-button type="primary" @click="handleAdd('income')">
              <el-icon><Plus /></el-icon>
              添加分类
            </el-button>
          </div>
          <div class="category-list">
            <div
              v-for="(cat, index) in accountingStore.incomeCategories"
              :key="'income-' + index"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-icon" :style="{ background: cat.color }">
                  <el-icon><component :is="cat.icon" /></el-icon>
                </div>
                <span class="category-name">{{ cat.name }}</span>
                <el-tag size="small" :color="cat.color" effect="dark" style="border: none;">
                  {{ cat.icon }}
                </el-tag>
              </div>
              <div class="category-actions">
                <el-button type="primary" link @click="handleEdit('income', index)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete('income', index)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="accountingStore.incomeCategories.length === 0" description="暂无分类" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="支出分类" name="expense">
          <div class="tab-header">
            <el-button type="primary" @click="handleAdd('expense')">
              <el-icon><Plus /></el-icon>
              添加分类
            </el-button>
          </div>
          <div class="category-list">
            <div
              v-for="(cat, index) in accountingStore.expenseCategories"
              :key="'expense-' + index"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-icon" :style="{ background: cat.color }">
                  <el-icon><component :is="cat.icon" /></el-icon>
                </div>
                <span class="category-name">{{ cat.name }}</span>
                <el-tag size="small" :color="cat.color" effect="dark" style="border: none;">
                  {{ cat.icon }}
                </el-tag>
              </div>
              <div class="category-actions">
                <el-button type="primary" link @click="handleEdit('expense', index)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete('expense', index)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="accountingStore.expenseCategories.length === 0" description="暂无分类" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="editingIndex !== null ? '编辑分类' : '添加分类'"
      width="460px"
      @close="handleDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="10" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="categoryForm.icon" placeholder="请选择图标" style="width: 100%">
            <el-option
              v-for="opt in iconOptions"
              :key="opt"
              :label="opt"
              :value="opt"
            >
              <div class="icon-option">
                <el-icon><component :is="opt" /></el-icon>
                <span>{{ opt }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="categoryForm.color" />
          <span class="color-preview" :style="{ color: categoryForm.color }">{{ categoryForm.color }}</span>
        </el-form-item>
        <el-form-item label="预览">
          <div class="preview-box">
            <div class="preview-icon" :style="{ background: categoryForm.color }">
              <el-icon v-if="categoryForm.icon"><component :is="categoryForm.icon" /></el-icon>
            </div>
            <span class="preview-name">{{ categoryForm.name || '分类名称' }}</span>
          </div>
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
import { useAccountingStore } from '@/stores/accounting'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const accountingStore = useAccountingStore()

const activeTab = ref('income')
const showDialog = ref(false)
const editingIndex = ref(null)
const editingOriginalName = ref('')
const editingType = ref('expense')
const categoryFormRef = ref(null)

// 可选图标列表（不少于20个）
const iconOptions = [
  'Wallet', 'TrophyBase', 'Briefcase', 'TrendCharts', 'MoreFilled',
  'Food', 'Bicycle', 'ShoppingCart', 'House', 'Headset',
  'FirstAidKit', 'Reading', 'Coffee', 'Goods', 'Ticket',
  'Monitor', 'Iphone', 'Camera', 'Microphone', 'Basketball',
  'Football', 'Ship', 'Location', 'Clock', 'Star',
  'Sunrise', 'Flag', 'Phone', 'Message', 'ChatDotRound'
]

const categoryForm = reactive({
  name: '',
  icon: 'Wallet',
  color: '#409eff'
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

const handleAdd = (type) => {
  editingType.value = type
  editingIndex.value = null
  categoryForm.name = ''
  categoryForm.icon = 'Wallet'
  categoryForm.color = '#409eff'
  showDialog.value = true
}

const handleEdit = (type, index) => {
  editingType.value = type
  editingIndex.value = index
  const list = type === 'income' ? accountingStore.incomeCategories : accountingStore.expenseCategories
  const cat = list[index]
  editingOriginalName.value = cat.name
  categoryForm.name = cat.name
  categoryForm.icon = cat.icon
  categoryForm.color = cat.color
  showDialog.value = true
}

const handleDelete = async (type, index) => {
  const list = type === 'income' ? accountingStore.incomeCategories : accountingStore.expenseCategories
  const cat = list[index]

  // 检查是否被引用
  if (accountingStore.isCategoryUsed(type, cat.name)) {
    ElMessageBox.alert(
      `分类"${cat.name}"已被收支记录引用，无法删除。请先修改或删除相关记录后再试。`,
      '删除失败',
      { type: 'warning', confirmButtonText: '知道了' }
    )
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除分类"${cat.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (type === 'income') {
      accountingStore.incomeCategories.splice(index, 1)
      accountingStore.saveIncomeCategories()
    } else {
      accountingStore.expenseCategories.splice(index, 1)
      accountingStore.saveExpenseCategories()
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!categoryFormRef.value) return
  const valid = await categoryFormRef.value.validate().catch(() => false)
  if (!valid) return

  const list = editingType.value === 'income'
    ? accountingStore.incomeCategories
    : accountingStore.expenseCategories

  if (editingIndex.value !== null) {
    // 并发防护：提交前校验目标位置是否仍存在（防止弹窗期间被其他人删除）
    const currentCat = list[editingIndex.value]
    if (!currentCat || currentCat.name !== editingOriginalName.value) {
      ElMessage.error('该分类已被删除或修改，请关闭弹窗后刷新重试')
      showDialog.value = false
      return
    }

    const oldName = editingOriginalName.value
    const data = { ...categoryForm }
    list[editingIndex.value] = data

    if (editingType.value === 'income') {
      accountingStore.saveIncomeCategories()
    } else {
      accountingStore.saveExpenseCategories()
    }

    // 重命名时同步更新所有引用旧分类名的收支记录
    if (oldName !== data.name) {
      await accountingStore.renameCategoryInRecords(editingType.value, oldName, data.name)
    }
  } else {
    const data = { ...categoryForm }
    if (editingType.value === 'income') {
      accountingStore.incomeCategories.push(data)
      accountingStore.saveIncomeCategories()
    } else {
      accountingStore.expenseCategories.push(data)
      accountingStore.saveExpenseCategories()
    }
  }

  ElMessage.success(editingIndex.value !== null ? '编辑成功' : '添加成功')
  showDialog.value = false
}

const handleDialogClose = () => {
  editingIndex.value = null
  editingOriginalName.value = ''
  categoryForm.name = ''
  categoryForm.icon = 'Wallet'
  categoryForm.color = '#409eff'
}
</script>

<style lang="scss" scoped>
.categories-container {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

.categories-card {
  border-radius: 12px;
}

.tab-header {
  margin-bottom: 16px;
}

.category-list {
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
  }

  .category-name {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
  }

  .category-actions {
    display: flex;
    gap: 8px;
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  margin-left: 12px;
  font-weight: 600;
  font-size: 14px;
}

.preview-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.preview-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
