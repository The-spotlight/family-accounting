<template>
  <div class="home-container">
    <h2 class="page-title">收支统计</h2>

    <div v-loading="loading" class="statistics-grid">
      <!-- 总收入卡片 -->
      <div class="stat-card-wrapper">
        <el-card class="stat-card income-card" :class="{ 'over-budget': budget.income && incomeBudgetRate > 100 }" shadow="hover">
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
        <div v-if="budget.income" class="budget-bar">
          <el-progress
            :percentage="Math.min(incomeBudgetRate, 100)"
            :color="getProgressColor(incomeBudgetRate)"
            :stroke-width="10"
            :show-text="false"
          />
          <div class="budget-text">
            <span>预算完成率</span>
            <span :style="{ color: getProgressColor(incomeBudgetRate) }">{{ incomeBudgetRate.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- 总支出卡片 -->
      <div class="stat-card-wrapper">
        <el-card class="stat-card expense-card" :class="{ 'over-budget': budget.expense && expenseBudgetRate > 100 }" shadow="hover">
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
        <div v-if="budget.expense" class="budget-bar">
          <el-progress
            :percentage="Math.min(expenseBudgetRate, 100)"
            :color="getProgressColor(expenseBudgetRate)"
            :stroke-width="10"
            :show-text="false"
          />
          <div class="budget-text">
            <span>预算使用率</span>
            <span :style="{ color: getProgressColor(expenseBudgetRate) }">{{ expenseBudgetRate.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- 余额卡片 -->
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

      <!-- 收支笔数卡片 -->
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

    <!-- 月度对比区域 -->
    <el-card class="comparison-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>月度对比</span>
          <span class="comparison-subtitle">{{ comparison.lastMonthLabel }} vs {{ comparison.currentMonthLabel }}</span>
        </div>
      </template>

      <!-- 环比变化 -->
      <div class="comparison-rates">
        <div class="rate-item">
          <div class="rate-label">收入环比</div>
          <div class="rate-value" :class="comparison.incomeRate >= 0 ? 'rate-up' : 'rate-down'">
            {{ comparison.incomeRate >= 0 ? '+' : '' }}{{ comparison.incomeRate.toFixed(1) }}%
          </div>
          <div class="rate-detail">
            上月 ¥{{ formatMoney(comparison.lastIncome) }} → 本月 ¥{{ formatMoney(comparison.currentIncome) }}
          </div>
        </div>
        <div class="rate-item">
          <div class="rate-label">支出环比</div>
          <div class="rate-value" :class="comparison.expenseRate >= 0 ? 'rate-up' : 'rate-down'">
            {{ comparison.expenseRate >= 0 ? '+' : '' }}{{ comparison.expenseRate.toFixed(1) }}%
          </div>
          <div class="rate-detail">
            上月 ¥{{ formatMoney(comparison.lastExpense) }} → 本月 ¥{{ formatMoney(comparison.currentExpense) }}
          </div>
        </div>
        <div class="rate-item">
          <div class="rate-label">余额环比</div>
          <div class="rate-value" :class="comparison.balanceRate >= 0 ? 'rate-up' : 'rate-down'">
            {{ comparison.balanceRate >= 0 ? '+' : '' }}{{ comparison.balanceRate.toFixed(1) }}%
          </div>
          <div class="rate-detail">
            上月 ¥{{ formatMoney(comparison.lastBalance) }} → 本月 ¥{{ formatMoney(comparison.currentBalance) }}
          </div>
        </div>
      </div>

      <!-- 支出分类排行对比 -->
      <div class="comparison-ranking">
        <div class="ranking-column">
          <h4 class="ranking-title">{{ comparison.lastMonthLabel }} 支出排行</h4>
          <div v-if="comparison.lastExpenseTop5.length" class="ranking-list">
            <div
              v-for="(item, index) in comparison.lastExpenseTop5"
              :key="'last-' + index"
              class="ranking-item"
            >
              <span class="ranking-index">{{ index + 1 }}</span>
              <span class="ranking-name">{{ item.name }}</span>
              <span class="ranking-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </div>
        <div class="ranking-column">
          <h4 class="ranking-title">{{ comparison.currentMonthLabel }} 支出排行</h4>
          <div v-if="comparison.currentExpenseTop5.length" class="ranking-list">
            <div
              v-for="(item, index) in comparison.currentExpenseTop5"
              :key="'curr-' + index"
              class="ranking-item"
            >
              <span class="ranking-index">{{ index + 1 }}</span>
              <span class="ranking-name">{{ item.name }}</span>
              <span class="ranking-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </div>
      </div>
    </el-card>

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
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <div class="category-cell">
              <span
                v-if="getCatInfo(row.type, row.category)"
                class="cat-icon-small"
                :style="{ background: getCatInfo(row.type, row.category).color }"
              >
                <el-icon :size="12"><component :is="getCatInfo(row.type, row.category).icon" /></el-icon>
              </span>
              <span>{{ row.category }}</span>
            </div>
          </template>
        </el-table-column>
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
import { onMounted, computed } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { Money, Wallet, Document, ArrowRight } from '@element-plus/icons-vue'

const accountingStore = useAccountingStore()

const loading = computed(() => accountingStore.loading)
const statistics = computed(() => accountingStore.statistics)
const recentRecords = computed(() => accountingStore.records.slice(0, 5))
const budget = computed(() => accountingStore.budget)
const incomeBudgetRate = computed(() => accountingStore.incomeBudgetRate)
const expenseBudgetRate = computed(() => accountingStore.expenseBudgetRate)
const comparison = computed(() => accountingStore.monthlyComparison)

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getProgressColor = (rate) => {
  if (rate > 100) return '#f56c6c'
  if (rate >= 80) return '#e6a23c'
  return '#67c23a'
}

const getCatInfo = (type, name) => {
  return accountingStore.getCategoryInfo(type, name)
}

onMounted(() => {
  accountingStore.fetchRecords()
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

.stat-card-wrapper {
  .stat-card {
    border-radius: 12px;
    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;

    &:hover {
      transform: translateY(-4px);
    }
  }

  &.over-budget, .over-budget {
    border: 2px solid #f56c6c !important;
  }
}

.over-budget {
  border: 2px solid #f56c6c !important;
}

.budget-bar {
  margin-top: 8px;
  padding: 0 4px;

  .budget-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
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

// 月度对比
.comparison-card {
  border-radius: 12px;
  margin-bottom: 24px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;

    .comparison-subtitle {
      font-size: 13px;
      font-weight: 400;
      color: #909399;
    }
  }
}

.comparison-rates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.rate-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 10px;

  .rate-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .rate-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 6px;

    &.rate-up {
      color: #f56c6c; // 支出涨为红色
    }

    &.rate-down {
      color: #67c23a; // 支出降为绿色
    }
  }

  .rate-detail {
    font-size: 12px;
    color: #c0c4cc;
  }
}

// 对于收入，涨为绿色降为红色（覆盖通用规则）
.comparison-rates .rate-item:first-child .rate-value {
  &.rate-up {
    color: #67c23a;
  }

  &.rate-down {
    color: #f56c6c;
  }
}

.comparison-ranking {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.ranking-column {
  .ranking-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: #f5f7fa;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: #ecf5ff;
    }
  }

  .ranking-index {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .ranking-name {
    flex: 1;
    font-size: 14px;
    color: #303133;
  }

  .ranking-amount {
    font-size: 14px;
    font-weight: 600;
    color: #f56c6c;
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

.category-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-icon-small {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
</style>
