<template>
  <el-container class="merchant-layout">
    <el-aside :width="isCollapsed ? '70px' : '240px'" class="sidebar">
      <div class="logo-container" @click="router.push('/merchant')" style="cursor: pointer;">
        <div class="logo-text">
          <el-icon class="logo-icon"><HomeFilled /></el-icon>
          <span class="title" v-show="!isCollapsed">校园点餐系统</span>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="merchant-menu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>商家主页</template>
        </el-menu-item>
        <el-menu-item index="/merchant/menu">
          <el-icon><Menu /></el-icon>
          <template #title>菜单管理</template>
        </el-menu-item>
        <el-menu-item index="/merchant/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/merchant/statistics">
          <el-icon><TrendCharts /></el-icon>
          <template #title>销售统计</template>
        </el-menu-item>
        <el-menu-item index="/merchant/AI">
          <el-icon><MagicStick /></el-icon>
          <template #title>备菜助手</template>
        </el-menu-item>
        <el-menu-item index="/merchant/profile">
          <el-icon><User /></el-icon>
          <template #title>商家信息</template>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-tooltip
          :content="isCollapsed ? '展开菜单' : '收起菜单'"
          placement="right"
        >
          <el-button
            class="collapse-btn"
            :icon="isCollapsed ? 'Expand' : 'Fold'"
            circle
            @click="toggleCollapse"
          >
            <span class="food-icon" v-if="isCollapsed">🍽️</span>
          </el-button>
        </el-tooltip>
      </div>
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
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataLine,
  Menu,
  List,
  TrendCharts,
  User,
  ArrowDown,
  HomeFilled,
  MagicStick,
  SwitchButton,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'

const route = useRoute()
const router = useRouter()
const merchantStore = useMerchantShopStore()

const isCollapsed = ref(false)
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('merchant')
  router.push('/login')
  ElMessage.success('退出登录成功')
}
</script>

<style scoped>
.merchant-layout {
  height: 100vh;
  display: flex;
}

/* 侧边栏样式 - 凉风主题 */
.sidebar {
  height: 100%;
  background: linear-gradient(180deg, #e8f0f5 0%, #d3e4ed 100%);
  box-shadow: 4px 0 15px rgba(0, 77, 128, 0.1);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(12px);
  pointer-events: none;
}

.logo-container {
  height: 80px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
  position: relative;
  z-index: 1;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
  color: #004d80;
  filter: drop-shadow(0 2px 3px rgba(0, 77, 128, 0.2));
}

.title {
  color: #004d80;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 77, 128, 0.15);
}

.merchant-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  padding: 15px 0;
  position: relative;
  z-index: 1;
}

.merchant-menu :deep(.el-menu-item) {
  color: #004d80;
  margin: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 77, 128, 0.15);
  font-weight: 500;
  height: 50px;
  line-height: 50px;
  position: relative;
  overflow: hidden;
}

.merchant-menu :deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s;
}

.merchant-menu :deep(.el-menu-item:hover::before) {
  left: 100%;
}

.merchant-menu :deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  color: #003866;
  transform: translateX(3px);
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.15);
  border-color: rgba(0, 77, 128, 0.3);
}

.merchant-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #a0c8e0 0%, #8ab9d6 100%);
  color: #002b4d;
  box-shadow: 0 6px 20px rgba(0, 77, 128, 0.2);
  border-color: rgba(0, 77, 128, 0.4);
  font-weight: 600;
}

.merchant-menu :deep(.el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 20px;
  color: #004d80;
}

.sidebar-footer {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 77, 128, 0.2);
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  position: relative;
  z-index: 1;
}

.collapse-btn {
  background: linear-gradient(135deg, #a0c8e0 0%, #8ab9d6 100%);
  border: 2px solid rgba(0, 77, 128, 0.3);
  color: #004d80;
  width: 50px;
  height: 50px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.1);
}

.collapse-btn .food-icon {
  font-size: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.4s;
}

.collapse-btn:hover::before {
  left: 100%;
}

.collapse-btn:hover {
  background: linear-gradient(135deg, #8ab9d6 0%, #74aacc 100%);
  color: #003866;
  transform: scale(1.08) rotate(360deg);
  box-shadow: 0 6px 18px rgba(0, 77, 128, 0.2);
  border-color: rgba(0, 77, 128, 0.5);
}

.collapse-btn:active {
  transform: scale(1.05) rotate(360deg);
}

.el-header {
  background: #ffffff;
  border-bottom: 1px solid #d3e4ed;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  color: #004d80;
  font-size: 20px;
  font-weight: 600;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: #e8f0f5;
  border: 1px solid #c6e0f0;
  color: #004d80;
}

.user-dropdown:hover {
  background: #d3e4ed;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 77, 128, 0.1);
}

.user-dropdown .el-icon {
  margin-left: 4px;
  color: #004d80;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #004d80;
  transition: all 0.3s;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #d3e4ed;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
  color: #004d80;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 220px !important;
    border-radius: 0;
  }
  
  .sidebar.collapsed {
    width: 60px !important;
  }
  
  .el-header {
    padding: 0 15px;
  }
  
  .el-main {
    padding: 15px;
  }
}

/* 滚动条美化 */
.el-main::-webkit-scrollbar {
  width: 6px;
}

.el-main::-webkit-scrollbar-track {
  background: #e8f0f5;
  border-radius: 3px;
}

.el-main::-webkit-scrollbar-thumb {
  background: #a0c8e0;
  border-radius: 3px;
}

.el-main::-webkit-scrollbar-thumb:hover {
  background: #8ab9d6;
}
</style>