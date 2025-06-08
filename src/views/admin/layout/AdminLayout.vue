<template>
    <div class="admin-layout">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
        <div class="logo-container">
          <div class="logo-text">
            <span class="logo-icon">🍴</span>
            <span class="title" v-show="!isCollapsed">校园点餐系统</span>
          </div>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
  
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
  
          <el-menu-item index="/admin/merchants">
            <el-icon><Shop /></el-icon>
            <template #title>商家管理</template>
          </el-menu-item>
  
          <el-menu-item index="/admin/statistic">
            <el-icon><TrendCharts /></el-icon>
            <template #title>销售统计</template>
          </el-menu-item>
  
          <el-menu-item index="/admin/system">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
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
              <span class="food-icon" v-if="isCollapsed">🍔</span>
            </el-button>
          </el-tooltip>
        </div>
      </div>
  
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 顶部导航栏 -->
        <div class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="username">{{ username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
        
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
            
              </template>
            </el-dropdown>
          </div>
        </div>
  
        <!-- 页面内容 -->
        <div class="content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    DataLine,
    User,
    Shop,
    TrendCharts,
    Setting,
    CaretBottom,
    SwitchButton,
    Expand,
    Fold
  } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  
  const router = useRouter()
  const route = useRoute()
  
  // 侧边栏折叠状态
  const isCollapsed = ref(false)
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }
  
  // 当前激活的菜单
  const activeMenu = computed(() => route.path)
  
  // 当前页面名称
  const currentPage = computed(() => {
    const pathMap: Record<string, string> = {
      '/admin/dashboard': '仪表盘',
      '/admin/users': '用户管理',
      '/admin/merchants': '商家管理',
      '/admin/statistic': '销售统计',
      '/admin/system': '系统设置'
    }
    return pathMap[route.path] || '未知页面'
  })
  
  // 用户信息
  const username = ref('管理员')
  const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
  
  // 处理用户操作
  const handleProfile = () => {
    // TODO: 跳转到个人信息页面
  }
  
  const handleSettings = () => {
    // TODO: 跳转到账号设置页面
  }
  
  const handleLogout = () => {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 调用退出登录API
      router.push('/login')
    })
  }
  </script>
  
  <style scoped>
  .admin-layout {
    display: flex;
    height: 100vh;
    background-color: #f5f6f5;
  }
  
  /* 侧边栏样式 - 冰凉薄荷主题 */
  .sidebar {
    width: 260px;
    height: 100%;
    background: linear-gradient(180deg, #e6f0ec 0%, #d4e8e2 100%);
    box-shadow: 4px 0 20px rgba(0, 92, 75, 0.1);
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(15px);
    pointer-events: none;
  }
  
  .sidebar.collapsed {
    width: 80px;
  }
  
  .logo-container {
    height: 80px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #c8e0d8 0%, #b2d4cb 100%);
    border-bottom: 1px solid rgba(0, 92, 75, 0.2);
    position: relative;
    z-index: 1;
  }
  
  .logo-text {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .logo-icon {
    font-size: 30px;
    filter: drop-shadow(0 2px 3px rgba(0, 92, 75, 0.2));
  }
  
  .title {
    color: #005c4b;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 92, 75, 0.15);
  }
  
  .sidebar-menu {
    flex: 1;
    border-right: none;
    background: transparent;
    padding: 15px 0;
    position: relative;
    z-index: 1;
  }
  
  .sidebar-menu :deep(.el-menu-item) {
    color: #005c4b;
    margin: 6px 12px;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 92, 75, 0.15);
    font-weight: 500;
    height: 50px;
    line-height: 50px;
    position: relative;
    overflow: hidden;
  }
  
  .sidebar-menu :deep(.el-menu-item::before) {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.4s;
  }
  
  .sidebar-menu :deep(.el-menu-item:hover::before) {
    left: 100%;
  }
  
  .sidebar-menu :deep(.el-menu-item:hover) {
    background: linear-gradient(135deg, #c8e0d8 0%, #b2d4cb 100%);
    color: #003d33;
    transform: translateX(3px);
    box-shadow: 0 4px 15px rgba(0, 92, 75, 0.15);
    border-color: rgba(0, 92, 75, 0.3);
  }
  
  .sidebar-menu :deep(.el-menu-item.is-active) {
    background: linear-gradient(135deg, #a8d0c4 0%, #90c3b5 100%);
    color: #002b24;
    box-shadow: 0 6px 20px rgba(0, 92, 75, 0.2);
    border-color: rgba(0, 92, 75, 0.4);
    font-weight: 600;
  }
  
  .sidebar-menu :deep(.el-menu-item .el-icon) {
    margin-right: 10px;
    font-size: 20px;
    color: #005c4b;
  }
  
  .sidebar-footer {
    padding: 20px;
    display: flex;
    justify-content: center;
    border-top: 1px solid rgba(0, 92, 75, 0.2);
    background: linear-gradient(135deg, #c8e0d8 0%, #b2d4cb 100%);
    position: relative;
    z-index: 1;
  }
  
  .collapse-btn {
    background: linear-gradient(135deg, #a8d0c4 0%, #90c3b5 100%);
    border: 2px solid rgba(0, 92, 75, 0.3);
    color: #005c4b;
    width: 50px;
    height: 50px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 92, 75, 0.1);
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
    background: linear-gradient(135deg, #90c3b5 0%, #7ab6a7 100%);
    color: #003d33;
    transform: scale(1.08) rotate(360deg);
    box-shadow: 0 6px 18px rgba(0, 92, 75, 0.2);
    border-color: rgba(0, 92, 75, 0.5);
  }
  
  .collapse-btn:active {
    transform: scale(1.05) rotate(360deg);
  }
  
  /* 主内容区样式 */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* 顶部导航栏样式 */
  .header {
    height: 70px;
    background: #ffffff;
    box-shadow: 0 2px 15px rgba(0, 92, 75, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 25px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    background: #f5f6f5;
    border: 1px solid #d4e8e2;
  }
  
  .user-info:hover {
    background: #e6f0ec;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 92, 75, 0.1);
  }
  
  .username {
    margin: 0 8px;
    color: #003d33;
    font-weight: 500;
  }
  
  /* 内容区样式 */
  .content {
    flex: 1;
    padding: 25px;
    overflow-y: auto;
    background: #f5f6f5;
  }
  
  /* 过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  /* 下拉菜单样式 */
  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    transition: all 0.3s;
  }
  
  :deep(.el-dropdown-menu__item:hover) {
    background: #e6f0ec;
  }
  
  :deep(.el-dropdown-menu__item .el-icon) {
    margin-right: 4px;
    color: #005c4b;
  }
  
  /* 面包屑样式美化 */
  :deep(.el-breadcrumb__item) {
    color: #005c4b;
    font-weight: 500;
  }
  
  :deep(.el-breadcrumb__item.is-link) {
    color: #007a66;
  }
  
  :deep(.el-breadcrumb__item.is-link:hover) {
    color: #005c4b;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .sidebar {
      width: 240px;
      border-radius: 0;
    }
    
    .sidebar.collapsed {
      width: 60px;
    }
    
    .header {
      padding: 0 15px;
    }
    
    .content {
      padding: 15px;
    }
  }
  
  /* 滚动条美化 */
  .content::-webkit-scrollbar {
    width: 6px;
  }
  
  .content::-webkit-scrollbar-track {
    background: #e6f0ec;
    border-radius: 3px;
  }
  
  .content::-webkit-scrollbar-thumb {
    background: #a8d0c4;
    border-radius: 3px;
  }
  
  .content::-webkit-scrollbar-thumb:hover {
    background: #90c3b5;
  }
  </style>