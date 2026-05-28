<template>
  <div class="main-layout">
    <el-container>
      <!-- 顶部菜单栏 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon><Wallet /></el-icon>
            <span class="logo-text">家庭收支记账</span>
          </div>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            class="top-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/home">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/detail">
              <el-icon><List /></el-icon>
              <span>明细</span>
            </el-menu-item>
            <el-menu-item index="/budget">
              <el-icon><Coin /></el-icon>
              <span>预算</span>
            </el-menu-item>
            <el-menu-item index="/category">
              <el-icon><Menu /></el-icon>
              <span>分类</span>
            </el-menu-item>
          </el-menu>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="user-name">
                <el-icon><User /></el-icon>
                {{ userStore.userInfo?.name || '用户' }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAccountingStore } from '@/stores/accounting'
import { ElMessageBox } from 'element-plus'
import {
  Wallet,
  HomeFilled,
  List,
  User,
  ArrowDown,
  Coin,
  Menu
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const accountingStore = useAccountingStore()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      accountingStore.reset()
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px !important;
  line-height: 64px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #409eff;

    .logo-text {
      color: #303133;
    }
  }

  .top-menu {
    flex: 1;
    border-bottom: none;
    margin-left: 40px;

    :deep(.el-menu-item) {
      height: 64px;
      line-height: 64px;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
        border-bottom-color: #409eff;
      }

      &.is-active {
        color: #409eff;
        border-bottom-color: #409eff;
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    height: 64px;
    line-height: 64px;

    :deep(.el-dropdown) {
      height: 100%;
      display: flex;
      align-items: center;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;
      height: 100%;
      padding: 0 8px;
      border-radius: 4px;

      &:hover {
        color: #409eff;
        background-color: rgba(64, 158, 255, 0.1);
      }

      .el-icon {
        font-size: 18px;
      }

      .el-icon--right {
        font-size: 14px;
        margin-left: 4px;
      }
    }
  }
}

.main-content {
  padding: 20px;
  min-height: calc(100vh - 64px);
}
</style>
