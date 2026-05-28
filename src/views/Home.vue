<template>
  <div class="home-container">
    <h2 class="page-title">收支统计</h2>

    <div v-loading="loading" class="statistics-grid">
      <el-card
        class="stat-card income-card"
        shadow="hover"
        :class="{ 'over-budget': incomeBudgetRate > 100 && budgetStore.incomeBudget > 0 }"
      >
        <div class="stat-content">
          <div class="stat-icon income-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总收入</div>
            <div class="stat-value income-value">¥{{ formatMoney(statistics.totalIncome) }}</div>
          </div>
        </div>
        <div v-if="budgetStore.incomeBudget > 0" class="budget-bar">
          <div class="budget-label">
            预算完成率：{{ incomeBudgetRate.toFixed(1) }}%
          </div>
          <el-progress
            :percentage="Math.min(incomeBudgetRate, 100)"
            :color="getBudgetColor(incomeBudgetRate)"
            :stroke-width="10"
          />
        </div>
      </el-card>

      <el-card
        class="stat-card expense-card"
        shadow="hover"
        :class="{ 'over-budget': expenseBudgetRate > 100 && budgetStore.expenseBudget > 0 }"
      >
        <div class="stat-content">
          <div class="stat-icon expense-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense-value">¥{{ formatMoney(statistics.totalExpense) }}</div>
          </div>
        </div>
        <div v-if="budgetStore.expenseBudget > 0" class="budget-bar">
          <div class="budget-label">
            预算使用率：{{ expenseBudgetRate.toFixed(1) }}%
          </div>
          <el-progress
            :percentage="Math.min(expenseBudgetRate, 100)"
            :color="getBudgetColor(expenseBudgetRate)"
            :stroke-width="10"
          />
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

    <!-- 月度对比 -->
    <el-card class="month-compare" shadow="hover">
      <template #header>
        <span class="card-header-title">月度对比</span>
      </template>
      <div class="compare-summary">
        <div class="compare-item">
          <span class="compare-label">收入环比</span>
          <span class="compare-value" :class="momIncome >= 0 ? 'up' : 'down'">
            {{ momIncome >= 0 ? '+' : '' }}{{ momIncome.toFixed(1) }}%
          </span>
        </div>
        <div class="compare-item">
          <span class="compare-label">支出环比</span>
          <span class="compare-value" :class="momExpense >= 0 ? 'up' : 'down'">
            {{ momExpense >= 0 ? '+' : '' }}{{ momExpense.toFixed(1) }}%
          </span>
        </div>
        <div class="compare-item">
          <span class="compare-label">余额环比</span>
          <span class="compare-value" :class="momBalance >= 0 ? 'up' : 'down'">
            {{ momBalance >= 0 ? '+' : '' }}{{ momBalance.toFixed(1) }}%
          </span>
        </div>
      </div>

      <el-divider />

      <div class="category-rank-compare">
        <div class="rank-column">
          <h4 class="rank-title">本月支出 TOP5</h4>
          <div class="rank-list">
            <div v-for="(item, index) in currentMonthTop5" :key="'cur-' + index" class="rank-item">
              <span class="rank-index">{{ index + 1 }}</span>
              <span class="rank-name">{{ item.category }}</span>
              <span class="rank-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <el-empty v-if="currentMonthTop5.length === 0" description="本月暂无支出" :image-size="60" />
          </div>
        </div>
        <div class="rank-column">
          <h4 class="rank-title">上月支出 TOP5</h4>
          <div class="rank-list">
            <div v-for="(item, index) in lastMonthTop5" :key="'last-' + index" class="rank-item">
              <span class="rank-index">{{ index + 1 }}</span>
              <span class="rank-name">{{ item.category }}</span>
              <span class="rank-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <el-empty v-if="lastMonthTop5.length === 0" description="上月暂无支出" :image-size="60" />
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

// 预算使用率
const incomeBudgetRate = computed(() => {
  if (budgetStore.incomeBudget <= 0) return 0
  return (statistics.value.totalIncome / budgetStore.incomeBudget) * 100
})

const expenseBudgetRate = computed(() => {
  if (budgetStore.expenseBudget <= 0) return 0
  return (statistics.value.totalExpense / budgetStore.expenseBudget) * 100
})

const getBudgetColor = (rate) => {
  if (rate > 100) return '#f56c6c'
  if (rate >= 80) return '#e6a23c'
  return '#67c23a'
}

// 月度对比
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() // 0-indexed

const getMonthStr = (year, month) => {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

const currentMonthStr = getMonthStr(currentYear, currentMonth)
const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
const lastMonthStr = getMonthStr(lastMonthDate.getFullYear(), lastMonthDate.getMonth())

const filterByMonth = (records, monthStr) => {
  return records.filter(r => r.date && r.date.startsWith(monthStr))
}

const calcStats = (records) => {
  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  return { income, expense, balance: income - expense }
}

const calcMom = (current, last) => {
  if (last === 0) return current === 0 ? 0 : 100
  return ((current - last) / Math.abs(last)) * 100
}

const currentMonthRecords = computed(() => filterByMonth(accountingStore.records, currentMonthStr))
const lastMonthRecords = computed(() => filterByMonth(accountingStore.records, lastMonthStr))

const currentStats = computed(() => calcStats(currentMonthRecords.value))
const lastStats = computed(() => calcStats(lastMonthRecords.value))

const momIncome = computed(() => calcMom(currentStats.value.income, lastStats.value.income))
const momExpense = computed(() => calcMom(currentStats.value.expense, lastStats.value.expense))
const momBalance = computed(() => calcMom(currentStats.value.balance, lastStats.value.balance))

// 分类排行
const getCategoryRanking = (records) => {
  const expenseRecords = records.filter(r => r.type === 'expense')
  const map = {}
  expenseRecords.forEach(r => {
    map[r.category] = (map[r.category] || 0) + r.amount
  })
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

const currentMonthTop5 = computed(() => getCategoryRanking(currentMonthRecords.value))
const lastMonthTop5 = computed(() => getCategoryRanking(lastMonthRecords.value))

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

.budget-bar {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .budget-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
  }
}

.month-compare {
  border-radius: 12px;
  margin-bottom: 24px;

  .card-header-title {
    font-weight: 600;
  }
}

.compare-summary {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.compare-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .compare-label {
    font-size: 13px;
    color: #909399;
  }

  .compare-value {
    font-size: 22px;
    font-weight: 600;

    &.up {
      color: #f56c6c;
    }

    &.down {
      color: #67c23a;
    }
  }
}

.category-rank-compare {
  display: flex;
  gap: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.rank-column {
  flex: 1;

  .rank-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;

  .rank-index {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .rank-name {
    flex: 1;
    font-size: 14px;
    color: #303133;
  }

  .rank-amount {
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
</style>
