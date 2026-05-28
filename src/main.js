import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import { useAccountingStore } from './stores/accounting'
import { mockInitRecords } from './utils/mock'
import './styles/main.scss'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 根据 store 当前的分类列表初始化 mock 种子记录，保证 mock 数据与分类配置同源
const accountingStore = useAccountingStore()
const incomeMap = Object.fromEntries(
  accountingStore.incomeCategories.map((c, i) => [`income${i + 1}`, c.name])
)
const expenseMap = Object.fromEntries(
  accountingStore.expenseCategories.map((c, i) => [`expense${i + 1}`, c.name])
)
mockInitRecords({ income: incomeMap, expense: expenseMap })

app.mount('#app')
