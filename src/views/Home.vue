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

    <!-- 预算概览 -->
    <el-card class="budget-overview" shadow="hover" v-if="budgetUsage.length > 0">
      <template #header>
        <div class="card-header">
          <span>本月预算概览</span>
          <el-button type="primary" link @click="$router.push('/budget')">
            管理预算 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="budget-list">
        <div
          v-for="item in budgetUsage"
          :key="item.id"
          class="budget-item"
          :class="`budget-${item.status}`"
        >
          <div class="budget-header">
            <span class="budget-category">{{ item.category }}</span>
            <el-tag :type="getBudgetTagType(item.status)" size="small">
              {{ getBudgetStatusText(item.status) }}
            </el-tag>
          </div>
          <div class="budget-progress">
            <el-progress
              :percentage="item.percentage"
              :status="getProgressStatus(item.status)"
              :stroke-width="10"
            />
          </div>
          <div class="budget-footer">
            <span class="budget-used">
              已用: ¥{{ formatMoney(item.used) }}
            </span>
            <span class="budget-total">
              预算: ¥{{ formatMoney(item.amount) }}
            </span>
            <span class="budget-remaining" :class="item.remaining <= 0 ? 'exceeded' : ''">
              剩余: ¥{{ formatMoney(item.remaining) }}
            </span>
          </div>
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

    <!-- 财务报表模块 -->
    <div class="financial-report-section">
      <h3 class="section-title">
        <el-icon><DataAnalysis /></el-icon>
        财务报表
      </h3>
      
      <!-- 时间维度切换和导出按钮 -->
      <div class="report-controls">
        <div class="time-dimension-switch">
          <el-radio-group v-model="selectedTimeDimension" @change="fetchReportData">
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="quarter">季</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>
          
          <el-date-picker
            v-if="selectedTimeDimension === 'month'"
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            @change="fetchReportData"
            style="margin-left: 16px; width: 180px"
          />
          
          <el-select
            v-else-if="selectedTimeDimension === 'quarter'"
            v-model="selectedQuarter"
            placeholder="选择季度"
            @change="fetchReportData"
            style="margin-left: 16px; width: 180px"
          >
            <el-option-group v-for="year in availableYears" :key="year" :label="`${year}年`">
              <el-option v-for="q in 4" :key="`${year}-Q${q}`" :label="`Q${q}`" :value="`${year}-Q${q}`" />
            </el-option-group>
          </el-select>
          
          <el-select
            v-else
            v-model="selectedYear"
            placeholder="选择年份"
            @change="fetchReportData"
            style="margin-left: 16px; width: 180px"
          >
            <el-option v-for="year in availableYears" :key="year" :label="`${year}年`" :value="`${year}`" />
          </el-select>
        </div>
        
        <el-button type="primary" @click="exportToExcel" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出 Excel
        </el-button>
      </div>
      
      <!-- 增长率数据展示 -->
      <el-card class="growth-rate-card" shadow="hover">
        <template #header>
          <span>增长率分析</span>
        </template>
        <div class="growth-rate-grid">
          <div class="growth-item">
            <div class="growth-label">收入 环比</div>
            <div class="growth-value" :class="reportData.summary?.previous?.incomeGrowth >= 0 ? 'growth-positive' : 'growth-negative'">
              {{ formatGrowthRate(reportData.summary?.previous?.incomeGrowth) }}
              <el-icon v-if="reportData.summary?.previous?.incomeGrowth !== undefined">
                <TrendCharts v-if="reportData.summary.previous.incomeGrowth >= 0" />
                <TrendCharts v-else style="transform: rotate(180deg)" />
              </el-icon>
            </div>
            <div class="growth-period">vs 上期 ({{ reportData.summary?.previous?.period || '-' }})</div>
          </div>
          
          <div class="growth-item">
            <div class="growth-label">支出 环比</div>
            <div class="growth-value" :class="reportData.summary?.previous?.expenseGrowth >= 0 ? 'growth-negative' : 'growth-positive'">
              {{ formatGrowthRate(reportData.summary?.previous?.expenseGrowth) }}
              <el-icon v-if="reportData.summary?.previous?.expenseGrowth !== undefined">
                <TrendCharts v-if="reportData.summary.previous.expenseGrowth >= 0" />
                <TrendCharts v-else style="transform: rotate(180deg)" />
              </el-icon>
            </div>
            <div class="growth-period">vs 上期</div>
          </div>
          
          <div class="growth-item">
            <div class="growth-label">收入 同比</div>
            <div class="growth-value" :class="reportData.summary?.yearAgo?.incomeGrowth >= 0 ? 'growth-positive' : 'growth-negative'">
              {{ formatGrowthRate(reportData.summary?.yearAgo?.incomeGrowth) }}
              <el-icon v-if="reportData.summary?.yearAgo?.incomeGrowth !== undefined">
                <TrendCharts v-if="reportData.summary.yearAgo.incomeGrowth >= 0" />
                <TrendCharts v-else style="transform: rotate(180deg)" />
              </el-icon>
            </div>
            <div class="growth-period">vs 去年同期 ({{ reportData.summary?.yearAgo?.period || '-' }})</div>
          </div>
          
          <div class="growth-item">
            <div class="growth-label">支出 同比</div>
            <div class="growth-value" :class="reportData.summary?.yearAgo?.expenseGrowth >= 0 ? 'growth-negative' : 'growth-positive'">
              {{ formatGrowthRate(reportData.summary?.yearAgo?.expenseGrowth) }}
              <el-icon v-if="reportData.summary?.yearAgo?.expenseGrowth !== undefined">
                <TrendCharts v-if="reportData.summary.yearAgo.expenseGrowth >= 0" />
                <TrendCharts v-else style="transform: rotate(180deg)" />
              </el-icon>
            </div>
            <div class="growth-period">vs 去年同期</div>
          </div>
        </div>
      </el-card>
      
      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 分类占比饼图 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>支出分类占比</span>
              <el-radio-group v-model="pieChartType" @change="updatePieChart" size="small">
                <el-radio-button label="expense">支出</el-radio-button>
                <el-radio-button label="income">收入</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
        
        <!-- 收支趋势折线图 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span>收支趋势</span>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </div>
      
      <!-- Top5 消费分类排行 -->
      <div class="top-categories-section">
        <el-card class="top-categories-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>Top5 {{ topCategoryType === 'expense' ? '支出' : '收入' }}分类</span>
              <el-radio-group v-model="topCategoryType" @change="updateTopCategories" size="small">
                <el-radio-button label="expense">支出</el-radio-button>
                <el-radio-button label="income">收入</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="top-categories-list">
            <div
              v-for="(item, index) in topCategoriesList"
              :key="item.name"
              class="top-category-item"
            >
              <div class="rank-number" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </div>
              <div class="category-info">
                <div class="category-name">{{ item.name }}</div>
                <div class="category-meta">
                  <span>{{ item.count }} 笔</span>
                  <span>{{ item.percent }}%</span>
                </div>
              </div>
              <div class="category-amount">¥{{ formatMoney(item.amount) }}</div>
            </div>
            <div v-if="topCategoriesList.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import { 
  getStatistics, 
  getRecords, 
  getCategoryStatistics, 
  getTrendData, 
  getTopCategories, 
  getGrowthRate,
  getFinancialReportData 
} from '@/api/accounting'
import { useBudgetStore } from '@/stores/budget'
import { 
  Money, 
  Wallet, 
  Document, 
  ArrowRight, 
  DataAnalysis, 
  Download, 
  TrendCharts 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const budgetStore = useBudgetStore()
const budgetUsage = computed(() => budgetStore.budgetUsage)

const loading = ref(false)
const statistics = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  incomeCount: 0,
  expenseCount: 0
})
const recentRecords = ref([])

// ==================== 财务报表相关变量 ====================
const selectedTimeDimension = ref('month') // 'month' | 'quarter' | 'year'
const selectedMonth = ref('')
const selectedQuarter = ref('')
const selectedYear = ref('')

const availableYears = computed(() => [2026, 2025])

const exporting = ref(false)

// 图表引用
const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChartInstance = null
let lineChartInstance = null

// 图表类型
const pieChartType = ref('expense') // 'expense' | 'income'
const topCategoryType = ref('expense') // 'expense' | 'income'

// 报表数据
const reportData = ref({
  summary: null,
  categoryDetails: { expense: null, income: null },
  trendData: [],
  topCategories: { expense: [], income: [] }
})

const topCategoriesList = computed(() => {
  return reportData.value.topCategories?.[topCategoryType.value]?.categories || []
})

const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '-'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化增长率
const formatGrowthRate = (rate) => {
  if (rate === undefined || rate === null) return '-'
  if (!isFinite(rate)) return rate > 0 ? '+∞' : '-∞'
  const prefix = rate >= 0 ? '+' : ''
  return `${prefix}${rate.toFixed(2)}%`
}

// 获取当前选中的周期
const getCurrentPeriod = () => {
  switch (selectedTimeDimension.value) {
    case 'month':
      return selectedMonth.value
    case 'quarter':
      return selectedQuarter.value
    case 'year':
      return selectedYear.value
    default:
      return selectedMonth.value
  }
}

// 初始化默认时间
const initDefaultTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  selectedMonth.value = `${year}-${month}`
  selectedQuarter.value = `${year}-Q${Math.ceil(now.getMonth() / 3)}`
  selectedYear.value = String(year)
}

const getBudgetTagType = (status) => {
  switch (status) {
    case 'exceeded':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'success'
  }
}

const getBudgetStatusText = (status) => {
  switch (status) {
    case 'exceeded':
      return '已超支'
    case 'warning':
      return '预警'
    default:
      return '正常'
  }
}

const getProgressStatus = (status) => {
  if (status === 'exceeded') return 'exception'
  if (status === 'warning') return 'warning'
  return ''
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

// ==================== 财务报表函数 ====================

// 获取报表数据
const fetchReportData = async () => {
  const period = getCurrentPeriod()
  if (!period) return
  
  try {
    const [growthRes, expenseCatRes, incomeCatRes, trendRes, topExpenseRes, topIncomeRes] = await Promise.all([
      getGrowthRate(selectedTimeDimension.value, period),
      getCategoryStatistics(selectedTimeDimension.value, period, 'expense'),
      getCategoryStatistics(selectedTimeDimension.value, period, 'income'),
      getTrendData(selectedTimeDimension.value, period),
      getTopCategories(selectedTimeDimension.value, period, 'expense', 5),
      getTopCategories(selectedTimeDimension.value, period, 'income', 5)
    ])
    
    reportData.value = {
      summary: growthRes.code === 200 ? growthRes.data : null,
      categoryDetails: {
        expense: expenseCatRes.code === 200 ? expenseCatRes.data : null,
        income: incomeCatRes.code === 200 ? incomeCatRes.data : null
      },
      trendData: trendRes.code === 200 ? trendRes.data : [],
      topCategories: {
        expense: topExpenseRes.code === 200 ? topExpenseRes.data : { categories: [], total: 0 },
        income: topIncomeRes.code === 200 ? topIncomeRes.data : { categories: [], total: 0 }
      }
    }
    
    await nextTick()
    updatePieChart()
    updateLineChart()
    
  } catch (error) {
    console.error('获取报表数据失败:', error)
  }
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance) {
    initPieChart()
    return
  }
  
  const categoryData = reportData.value.categoryDetails?.[pieChartType.value]?.categories || []
  
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    graphic: categoryData.length === 0 ? [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#909399'
        }
      }
    ] : [],
    series: categoryData.length > 0 ? [
      {
        name: pieChartType.value === 'expense' ? '支出' : '收入',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: categoryData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }
    ] : []
  }
  
  pieChartInstance.setOption(option, true)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
  
  pieChartInstance = echarts.init(pieChartRef.value)
  updatePieChart()
  
  const handleResize = () => {
    pieChartInstance?.resize()
  }
  window.addEventListener('resize', handleResize)
}

// 更新折线图
const updateLineChart = () => {
  if (!lineChartInstance) {
    initLineChart()
    return
  }
  
  const trendData = reportData.value.trendData || []
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ¥${param.value.toLocaleString()}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出', '结余'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(item => item.period),
      axisLabel: {
        rotate: trendData.length > 12 ? 45 : 0,
        fontSize: 11,
        interval: trendData.length > 20 ? Math.floor(trendData.length / 10) : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#67c23a'
        },
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        },
        data: trendData.map(item => item.income)
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#f56c6c'
        },
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        data: trendData.map(item => item.expense)
      },
      {
        name: '结余',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#409eff',
          type: 'dashed'
        },
        itemStyle: {
          color: '#409eff'
        },
        data: trendData.map(item => item.balance)
      }
    ]
  }
  
  lineChartInstance.setOption(option, true)
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return
  
  if (lineChartInstance) {
    lineChartInstance.dispose()
  }
  
  lineChartInstance = echarts.init(lineChartRef.value)
  updateLineChart()
  
  const handleResize = () => {
    lineChartInstance?.resize()
  }
  window.addEventListener('resize', handleResize)
}

// 更新 Top 分类
const updateTopCategories = () => {
  // 数据通过 computed 属性自动更新
}

// 导出 Excel
const exportToExcel = async () => {
  const period = getCurrentPeriod()
  if (!period) {
    ElMessage.warning('请先选择时间范围')
    return
  }
  
  exporting.value = true
  
  try {
    const res = await getFinancialReportData(selectedTimeDimension.value, period)
    if (res.code !== 200) {
      throw new Error('获取导出数据失败')
    }
    
    const data = res.data
    
    // 创建 workbook
    const wb = XLSX.utils.book_new()
    
    // 1. 汇总数据 Sheet
    const summaryData = [
      ['财务报表 - 汇总数据'],
      ['周期', period],
      [''],
      ['当前周期数据'],
      ['指标', '金额'],
      ['总收入', data.summary?.current?.income || 0],
      ['总支出', data.summary?.current?.expense || 0],
      ['结余', data.summary?.current?.balance || 0],
      [''],
      ['环比增长率'],
      ['指标', '上期金额', '增长率'],
      ['收入', data.summary?.previous?.income || 0, data.summary?.previous?.incomeGrowth + '%' || '-'],
      ['支出', data.summary?.previous?.expense || 0, data.summary?.previous?.expenseGrowth + '%' || '-'],
      ['结余', data.summary?.previous?.balance || 0, data.summary?.previous?.balanceGrowth + '%' || '-'],
      [''],
      ['同比增长率'],
      ['指标', '去年同期金额', '增长率'],
      ['收入', data.summary?.yearAgo?.income || 0, data.summary?.yearAgo?.incomeGrowth + '%' || '-'],
      ['支出', data.summary?.yearAgo?.expense || 0, data.summary?.yearAgo?.expenseGrowth + '%' || '-'],
      ['结余', data.summary?.yearAgo?.balance || 0, data.summary?.yearAgo?.balanceGrowth + '%' || '-']
    ]
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, '汇总数据')
    
    // 2. 分类明细 Sheet
    const categoryData = [
      ['分类明细'],
      [''],
      ['支出分类'],
      ['分类名称', '金额', '占比', '笔数'],
      ...(data.topCategories?.expense?.categories || []).map(item => [
        item.name,
        item.amount,
        item.percent + '%',
        item.count
      ]),
      ['支出合计', data.topCategories?.expense?.total || 0],
      [''],
      ['收入分类'],
      ['分类名称', '金额', '占比', '笔数'],
      ...(data.topCategories?.income?.categories || []).map(item => [
        item.name,
        item.amount,
        item.percent + '%',
        item.count
      ]),
      ['收入合计', data.topCategories?.income?.total || 0]
    ]
    
    const ws2 = XLSX.utils.aoa_to_sheet(categoryData)
    XLSX.utils.book_append_sheet(wb, ws2, '分类明细')
    
    // 3. 趋势数据 Sheet
    const trendData = [
      ['趋势数据'],
      ['周期', '收入', '支出', '结余'],
      ...(data.trendData || []).map(item => [
        item.period,
        item.income,
        item.expense,
        item.balance
      ])
    ]
    
    const ws3 = XLSX.utils.aoa_to_sheet(trendData)
    XLSX.utils.book_append_sheet(wb, ws3, '趋势数据')
    
    // 导出文件
    const fileName = `财务报表_${period}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('导出成功')
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchStatistics()
  fetchRecentRecords()
  budgetStore.fetchBudgetUsage()
  
  // 初始化财务报表
  initDefaultTime()
  nextTick(() => {
    initPieChart()
    initLineChart()
    fetchReportData()
  })
})

onUnmounted(() => {
  pieChartInstance?.dispose()
  lineChartInstance?.dispose()
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

.budget-overview {
  border-radius: 12px;
  margin-bottom: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .budget-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .budget-item {
    padding: 16px;
    border-radius: 8px;
    background: #f5f7fa;
    transition: all 0.3s;

    &:hover {
      background: #eef2f7;
    }

    &.budget-warning {
      background: rgba(230, 162, 60, 0.1);
      border: 1px solid rgba(230, 162, 60, 0.3);
    }

    &.budget-exceeded {
      background: rgba(245, 108, 108, 0.1);
      border: 1px solid rgba(245, 108, 108, 0.3);
    }
  }

  .budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .budget-category {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .budget-progress {
    margin-bottom: 12px;
  }

  .budget-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #909399;
  }

  .budget-used {
    color: #606266;
  }

  .budget-total {
    color: #409eff;
    font-weight: 500;
  }

  .budget-remaining {
    color: #67c23a;
    font-weight: 500;

    &.exceeded {
      color: #f56c6c;
    }
  }
}

// ==================== 财务报表样式 ====================
.financial-report-section {
  margin-top: 24px;
  
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .report-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
    
    .time-dimension-switch {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .growth-rate-card {
    margin-bottom: 20px;
    border-radius: 12px;
    
    .growth-rate-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      
      .growth-item {
        text-align: center;
        padding: 16px;
        border-radius: 8px;
        background: #f5f7fa;
        
        .growth-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
        }
        
        .growth-value {
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          
          &.growth-positive {
            color: #67c23a;
          }
          
          &.growth-negative {
            color: #f56c6c;
          }
        }
        
        .growth-period {
          font-size: 11px;
          color: #c0c4cc;
          margin-top: 4px;
        }
      }
    }
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
    
    .chart-card {
      border-radius: 12px;
      
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      
      .chart-container {
        width: 100%;
        height: 350px;
      }
    }
  }
  
  .top-categories-section {
    .top-categories-card {
      border-radius: 12px;
      
      .top-categories-list {
        .top-category-item {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #ebeef5;
          
          &:last-child {
            border-bottom: none;
          }
          
          .rank-number {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 16px;
            
            &.rank-1 {
              background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
              color: #fff;
            }
            
            &.rank-2 {
              background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
              color: #fff;
            }
            
            &.rank-3 {
              background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
              color: #fff;
            }
            
            &.rank-4, &.rank-5 {
              background: #f5f7fa;
              color: #909399;
            }
          }
          
          .category-info {
            flex: 1;
            
            .category-name {
              font-size: 15px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .category-meta {
              font-size: 12px;
              color: #909399;
              display: flex;
              gap: 16px;
            }
          }
          
          .category-amount {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .empty-data {
          text-align: center;
          padding: 40px;
          color: #909399;
        }
      }
    }
  }
}
</style>
