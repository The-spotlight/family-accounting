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
        <div v-if="budgetStore.incomeBudget > 0" class="budget-progress">
          <div class="progress-label">
            <span>预算使用率</span>
            <span>{{ incomePercent }}%</span>
          </div>
          <el-progress
            :percentage="Math.min(incomePercent, 100)"
            :color="getProgressColor(incomePercent)"
            :stroke-width="8"
          />
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
        <div v-if="budgetStore.expenseBudget > 0" class="budget-progress">
          <div class="progress-label">
            <span>预算使用率</span>
            <span>{{ expensePercent }}%</span>
          </div>
          <el-progress
            :percentage="Math.min(expensePercent, 100)"
            :color="getProgressColor(expensePercent)"
            :stroke-width="8"
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

    <el-card class="monthly-comparison" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>月度对比</span>
        </div>
      </template>

      <div class="comparison-stats">
        <div class="compare-item">
          <div class="compare-label">收入环比</div>
          <div class="compare-value" :class="incomeChangeClass">
            {{ incomeChangeText }}
          </div>
        </div>
        <div class="compare-item">
          <div class="compare-label">支出环比</div>
          <div class="compare-value" :class="expenseChangeClass">
            {{ expenseChangeText }}
          </div>
        </div>
        <div class="compare-item">
          <div class="compare-label">余额环比</div>
          <div class="compare-value" :class="balanceChangeClass">
            {{ balanceChangeText }}
          </div>
        </div>
      </div>

      <div class="category-ranking">
        <div class="ranking-column">
          <h4>本月支出分类排行</h4>
          <div class="ranking-list">
            <div v-for="(item, index) in currentMonthExpenseRanking" :key="item.category" class="ranking-item">
              <span class="rank">{{ index + 1 }}</span>
              <span class="category-name">{{ item.category }}</span>
              <span class="category-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <div v-if="currentMonthExpenseRanking.length === 0" class="no-data">暂无数据</div>
          </div>
        </div>
        <div class="ranking-column">
          <h4>上月支出分类排行</h4>
          <div class="ranking-list">
            <div v-for="(item, index) in lastMonthExpenseRanking" :key="item.category" class="ranking-item">
              <span class="rank">{{ index + 1 }}</span>
              <span class="category-name">{{ item.category }}</span>
              <span class="category-amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
            <div v-if="lastMonthExpenseRanking.length === 0" class="no-data">暂无数据</div>
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
import { getMockRecords } from '@/utils/mock'
import { Money, Wallet, Document, ArrowRight } from '@element-plus/icons-vue'

const accountingStore = useAccountingStore()
const budgetStore = useBudgetStore()

const loading = computed(() => accountingStore.loading)
const statistics = computed(() => accountingStore.statistics)
const recentRecords = computed(() => accountingStore.records.slice(0, 5))

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 预算计算
const incomePercent = computed(() => {
  if (budgetStore.incomeBudget === 0) return 0
  return Math.round((statistics.value.totalIncome / budgetStore.incomeBudget) * 100)
})

const expensePercent = computed(() => {
  if (budgetStore.expenseBudget === 0) return 0
  return Math.round((statistics.value.totalExpense / budgetStore.expenseBudget) * 100)
})

const incomeOverBudget = computed(() => incomePercent.value > 100)
const expenseOverBudget = computed(() => expensePercent.value > 100)

const getProgressColor = (percent) => {
  if (percent < 80) return '#67c23a'
  if (percent <= 100) return '#e6a23c'
  return '#f56c6c'
}

// 月度对比
const getMonthString = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const currentMonth = getMonthString(new Date())
const lastMonthDate = new Date()
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
const lastMonth = getMonthString(lastMonthDate)

const currentMonthStats = computed(() => {
  return accountingStore.calculateStatistics(getMockRecords(), currentMonth)
})

const lastMonthStats = computed(() => {
  return accountingStore.calculateStatistics(getMockRecords(), lastMonth)
})

const calculateChange = (current, last) => {
  if (last === 0) return current > 0 ? 100 : 0
  return Math.round(((current - last) / last) * 100)
}

const incomeChange = computed(() => {
  return calculateChange(currentMonthStats.value.totalIncome, lastMonthStats.value.totalIncome)
})

const expenseChange = computed(() => {
  return calculateChange(currentMonthStats.value.totalExpense, lastMonthStats.value.totalExpense)
})

const balanceChange = computed(() => {
  return calculateChange(currentMonthStats.value.balance, lastMonthStats.value.balance)
})

const getChangeText = (change) => {
  if (change > 0) return `+${change}%`
  if (change < 0) return `${change}%`
  return '0%'
}

const getChangeClass = (change, inverse) => {
  if (change === 0) return 'change-zero'
  // inverse=true for expense: increase is bad (red), decrease is good (green)
  if (inverse) {
    return change > 0 ? 'change-up-bad' : 'change-down-good'
  }
  return change > 0 ? 'change-up-good' : 'change-down-bad'
}

const incomeChangeText = computed(() => getChangeText(incomeChange.value))
const expenseChangeText = computed(() => getChangeText(expenseChange.value))
const balanceChangeText = computed(() => getChangeText(balanceChange.value))

const incomeChangeClass = computed(() => getChangeClass(incomeChange.value, false))
const expenseChangeClass = computed(() => getChangeClass(expenseChange.value, true))
const balanceChangeClass = computed(() => getChangeClass(balanceChange.value, false))

// 支出分类排行
const getExpenseRanking = (month) => {
  const records = getMockRecords().filter(r => {
    return r.type === 'expense' && r.date.substring(0, 7) === month
  })

  const categoryMap = {}
  records.forEach(r => {
    if (!categoryMap[r.category]) {
      categoryMap[r.category] = 0
    }
    categoryMap[r.category] += r.amount
  })

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

const currentMonthExpenseRanking = computed(() => getExpenseRanking(currentMonth))
const lastMonthExpenseRanking = computed(() => getExpenseRanking(lastMonth))

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
  }

  &.over-budget {
    border-color: #f56c6c;
    animation: pulse 2s ease-in-out infinite;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
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

  .budget-progress {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 12px rgba(245, 108, 108, 0.3);
  }
  50% {
    box-shadow: 0 2px 20px rgba(245, 108, 108, 0.6);
  }
}

.monthly-comparison {
  border-radius: 12px;
  margin-bottom: 24px;

  .card-header {
    font-weight: 600;
  }

  .comparison-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .compare-item {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      text-align: center;

      .compare-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 12px;
      }

      .compare-value {
        font-size: 24px;
        font-weight: 600;

        &.change-up-good {
          color: #67c23a;
        }

        &.change-down-bad {
          color: #f56c6c;
        }

        &.change-up-bad {
          color: #f56c6c;
        }

        &.change-down-good {
          color: #67c23a;
        }

        &.change-zero {
          color: #909399;
        }
      }
    }
  }

  .category-ranking {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    .ranking-column {
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;
      }

      .ranking-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 6px;

          .rank {
            width: 24px;
            height: 24px;
            background: #409eff;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          .category-name {
            flex: 1;
            color: #606266;
          }

          .category-amount {
            font-weight: 600;
            color: #f56c6c;
          }
        }

        .no-data {
          text-align: center;
          color: #c0c4cc;
          padding: 20px;
        }
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
