<template>
  <div class="home-container">
    <h2 class="page-title">收支统计</h2>

    <div v-loading="loading" class="statistics-grid">
      <!-- 总收入 -->
      <el-card class="stat-card income-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon income-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总收入</div>
            <div class="stat-value income-value">¥{{ formatMoney(statistics.totalIncome) }}</div>
          </div>
        </div>
      </el-card>

      <!-- 总支出 -->
      <el-card class="stat-card expense-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon expense-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense-value">¥{{ formatMoney(statistics.totalExpense) }}</div>
          </div>
        </div>
      </el-card>

      <!-- 余额 -->
      <el-card class="stat-card balance-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon balance-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">余额</div>
            <div class="stat-value" :class="statistics.balance >= 0 ? 'income-value' : 'expense-value'">
              ¥{{ formatMoney(statistics.balance) }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 收支笔数 -->
      <el-card class="stat-card count-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon count-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">收支笔数</div>
            <div class="stat-value count-value">
              {{ statistics.incomeCount + statistics.expenseCount }} 笔
            </div>
            <div class="stat-detail">
              收入 {{ statistics.incomeCount }} 笔 / 支出 {{ statistics.expenseCount }} 笔
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近记录 -->
    <el-card class="recent-records" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近记录</span>
          <el-button type="primary" link @click="$router.push('/detail')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <el-table :data="recentRecords" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'income-text' : 'expense-text'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatistics, getRecords } from '@/api/accounting'
import { Money, Wallet, Document, ArrowRight } from '@element-plus/icons-vue'

const loading = ref(false)
const statistics = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  incomeCount: 0,
  expenseCount: 0
})
const recentRecords = ref([])

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchStatistics = async () => {
  loading.value = true
  try {
    const res = await getStatistics()
    if (res.code === 200) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchRecentRecords = async () => {
  try {
    const res = await getRecords({ limit: 5 })
    if (res.code === 200) {
      recentRecords.value = res.data.list.slice(0, 5)
    }
  } catch (error) {
    console.error('获取最近记录失败:', error)
  }
}

onMounted(() => {
  fetchStatistics()
  fetchRecentRecords()
})
</script>

<style lang="scss" scoped>
.home-container {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;

    &.income-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.expense-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.balance-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.count-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 4px;

      &.income-value {
        color: #67c23a;
      }

      &.expense-value {
        color: #f56c6c;
      }

      &.count-value {
        color: #409eff;
      }
    }

    .stat-detail {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.recent-records {
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
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
