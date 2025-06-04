<template>
  <el-container class="merchant-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        class="merchant-menu"
        router
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>商家主页</span>
        </el-menu-item>
        <el-menu-item index="/merchant/menu">
          <el-icon><Menu /></el-icon>
          <span>菜单管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>销售统计</span>
        </el-menu-item>
        <el-menu-item index="/merchant/AI">
          <el-icon><List /></el-icon>
          <span>备菜助手</span>
        </el-menu-item>
        <el-menu-item index="/merchant/profile">
          <el-icon><User /></el-icon>
          <span>商家信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>{{ merchantStore.currentMerchant?.storeName }}</h2>
          <el-dropdown>
            <span class="user-dropdown">
              {{ merchantStore.currentMerchant?.user.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataLine,
  Menu,
  List,
  TrendCharts,
  User,
  ArrowDown
} from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'

const route = useRoute()
const router = useRouter()
const merchantStore = useMerchantShopStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  // 清除本地存储的用户信息
  localStorage.removeItem('user')
  localStorage.removeItem('merchant')
  // 跳转到登录页
  router.push('/login')
  ElMessage.success('退出登录成功')
}
</script>

<style scoped>
.merchant-layout {
  height: 100vh;
}

.merchant-menu {
  height: 100%;
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-dropdown .el-icon {
  margin-left: 4px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style> 