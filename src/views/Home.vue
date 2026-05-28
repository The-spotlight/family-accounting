<template>
  <div class="home-container">
    <h2 class="page-title">收支统计</h2>

    <div v-loading="loading" class="statistics-grid">
      <el-card class="stat-card income-card" :class="{ 'over-budget': incomeOverBudget }" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon income-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总收入</div>
            <div class="stat-value income-value">¥{{ formatMoney(statistics.totalIncome) }}</div>
          </div>
        </div>
        <div v-if="budgetStore.budgetConfig.incomeBudget > 0" class="budget-bar">
          <div class="budget-bar-header">
            <span class="budget-label">收入预算完成率</span>
            <span class="budget-percent" :class="getBudgetClass(incomeBudgetRate)">{{ incomeBudgetRate }}%</span>
          </div>
          <div class="budget-progress">
            <div class="budget-progress-fill" :style="{ width: Math.min(incomeBudgetRate, 100) + '%', backgroundColor: getBudgetColor(incomeBudgetRate) }"></div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card expense-card" :class="{ 'over-budget': expenseOverBudget }" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon expense-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense-value">¥{{ formatMoney(statistics.totalExpense) }}</div>
          </div>
        </div>
        <div v-if="budgetStore.budgetConfig.expenseBudget > 0" class="budget-bar">
          <div class="budget-bar-header">
            <span class="budget-label">支出预算使用率</span>
            <span class="budget-percent" :class="getBudgetClass(expenseBudgetRate)">{{ expenseBudgetRate }}%</span>
          </div>
          <div class="budget-progress">
            <div class="budget-progress-fill" :style="{ width: Math.min(expenseBudgetRate, 100) + '%', backgroundColor: getBudgetColor(expenseBudgetRate) }"></div>
          </div>
        </div>
      </el-card>

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

    <el-card class="monthly-comparison" shadow="hover">
      <template #header>
        <span class="card-title">月度对比</span>
      </template>
      <div class="comparison-content">
        <div class="comparison-rates">
          <div class="rate-item">
            <span class="rate-label">收入环比</span>
            <span class="rate-value" :class="incomeChange >= 0 ? 'rate-up' : 'rate-down'">{{ formatChangeRate(incomeChange) }}</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">支出环比</span>
            <span class="rate-value" :class="expenseChange <= 0 ? 'rate-up' : 'rate-down'">{{ formatChangeRate(expenseChange) }}</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">余额环比</span>
            <span class="rate-value" :class="balanceChange >= 0 ? 'rate-up' : 'rate-down'">{{ formatChangeRate(balanceChange) }}</span>
          </div>
        </div>
        <div class="category-ranking">
          <div class="ranking-column">
            <h4 class="ranking-title">本月支出排行</h4>
            <div v-for="(item, index) in currentMonthTopCategories" :key="'c-' + index" class="ranking-item">
              <span class="ranking-index">{{ index + 1 }}</span>
              <span class="ranking-name">{{ item.name }}</span>
              <span class="ranking-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <div v-if="currentMonthTopCategories.length === 0" class="ranking-empty">暂无数据</div>
          </div>
          <div class="ranking-divider"></div>
          <div class="ranking-column">
            <h4 class="ranking-title">上月支出排行</h4>
            <div v-for="(item, index) in lastMonthTopCategories" :key="'l-' + index" class="ranking-item">
              <span class="ranking-index">{{ index + 1 }}</span>
              <span class="ranking-name">{{ item.name }}</span>
              <span class="ranking-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <div v-if="lastMonthTopCategories.length === 0" class="ranking-empty">暂无数据</div>
          </div>
        </div>
      </div>
    </el-card>

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
import { onMounted, computed } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { useBudgetStore } from '@/stores/budget'
import { Money, Wallet, Document, ArrowRight } from '@element-plus/icons-vue'

const accountingStore = useAccountingStore()
const budgetStore = useBudgetStore()

const loading = computed(() => accountingStore.loading)
const statistics = computed(() => accountingStore.statistics)
const recentRecords = computed(() => accountingStore.records.slice(0, 5))

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const incomeBudgetRate = computed(() => {
  const budget = budgetStore.budgetConfig.incomeBudget
  if (!budget) return 0
  return Math.round((statistics.value.totalIncome / budget) * 100)
})

const expenseBudgetRate = computed(() => {
  const budget = budgetStore.budgetConfig.expenseBudget
  if (!budget) return 0
  return Math.round((statistics.value.totalExpense / budget) * 100)
})

const incomeOverBudget = computed(() => incomeBudgetRate.value > 100)
const expenseOverBudget = computed(() => expenseBudgetRate.value > 100)

const getBudgetColor = (rate) => {
  if (rate < 80) return '#67c23a'
  if (rate <= 100) return '#e6a23c'
  return '#f56c6c'
}

const getBudgetClass = (rate) => {
  if (rate < 80) return 'budget-green'
  if (rate <= 100) return 'budget-orange'
  return 'budget-red'
}

const getMonthRange = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1).toISOString().split('T')[0]
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

const currentMonthStats = computed(() => {
  const now = new Date()
  const range = getMonthRange(now)
  const records = accountingStore.records.filter(r => r.date >= range.start && r.date <= range.end)
  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  return { income, expense, balance: income - expense }
})

const lastMonthStats = computed(() => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const range = getMonthRange(lastMonth)
  const records = accountingStore.records.filter(r => r.date >= range.start && r.date <= range.end)
  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  return { income, expense, balance: income - expense }
})

const calcChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

const incomeChange = computed(() => calcChange(currentMonthStats.value.income, lastMonthStats.value.income))
const expenseChange = computed(() => calcChange(currentMonthStats.value.expense, lastMonthStats.value.expense))
const balanceChange = computed(() => calcChange(currentMonthStats.value.balance, lastMonthStats.value.balance))

const formatChangeRate = (rate) => {
  if (rate === null) return 'N/A'
  const sign = rate > 0 ? '+' : ''
  return sign + rate.toFixed(1) + '%'
}

const getTopCategories = (records, limit = 5) => {
  const map = {}
  records.filter(r => r.type === 'expense').forEach(r => {
    if (!map[r.category]) map[r.category] = 0
    map[r.category] += r.amount
  })
  return Object.entries(map)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

const currentMonthTopCategories = computed(() => {
  const now = new Date()
  const range = getMonthRange(now)
  const records = accountingStore.records.filter(r => r.date >= range.start && r.date <= range.end)
  return getTopCategories(records)
})

const lastMonthTopCategories = computed(() => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const range = getMonthRange(lastMonth)
  const records = accountingStore.records.filter(r => r.date >= range.start && r.date <= range.end)
  return getTopCategories(records)
})

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

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  &.over-budget {
    border: 2px solid #f56c6c;
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

    &.income-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.expense-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    &.balance-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    &.count-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
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

      &.income-value { color: #67c23a; }
      &.expense-value { color: #f56c6c; }
      &.count-value { color: #409eff; }
    }

    .stat-detail {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.budget-bar {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .budget-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .budget-label {
      font-size: 12px;
      color: #909399;
    }

    .budget-percent {
      font-size: 12px;
      font-weight: 600;

      &.budget-green { color: #67c23a; }
      &.budget-orange { color: #e6a23c; }
      &.budget-red { color: #f56c6c; }
    }
  }

  .budget-progress {
    height: 6px;
    background-color: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;

    .budget-progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s;
    }
  }
}

.monthly-comparison {
  border-radius: 12px;
  margin-bottom: 24px;

  .card-title {
    font-weight: 600;
  }

  .comparison-content {
    .comparison-rates {
      display: flex;
      gap: 40px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;

      .rate-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .rate-label {
          font-size: 14px;
          color: #909399;
        }

        .rate-value {
          font-size: 16px;
          font-weight: 600;

          &.rate-up { color: #67c23a; }
          &.rate-down { color: #f56c6c; }
        }
      }
    }

    .category-ranking {
      display: flex;
      gap: 0;

      .ranking-column {
        flex: 1;

        .ranking-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          padding: 6px 0;

          .ranking-index {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #909399;
            margin-right: 10px;
            flex-shrink: 0;
          }

          .ranking-name {
            flex: 1;
            font-size: 14px;
            color: #606266;
          }

          .ranking-amount {
            font-size: 14px;
            font-weight: 600;
            color: #f56c6c;
          }
        }

        .ranking-empty {
          font-size: 13px;
          color: #c0c4cc;
          padding: 6px 0;
        }
      }

      .ranking-divider {
        width: 1px;
        background-color: #f0f0f0;
        margin: 0 20px;
      }
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