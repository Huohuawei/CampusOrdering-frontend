// 主布局，适用于用户和商家
<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo" @click="router.push('/merchant')" style="cursor: pointer;">
        <el-icon><HomeFilled /></el-icon>
        校园点餐系统
      </div>
      <el-menu
        mode="horizontal"
        :router="true"
        class="nav-menu"
      >
        <el-menu-item index="/merchant/menu">菜单管理</el-menu-item>
        <el-menu-item index="/merchant/orders">订单管理</el-menu-item>
        <el-menu-item index="/merchant/profile">商家信息</el-menu-item>
      </el-menu>
      <div class="user-info">
        <el-dropdown>
          <span class="user-dropdown">
            {{ merchantStore.currentMerchant?.storeName || '商家' }}
            <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <router-view></router-view>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, HomeFilled } from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const merchantStore = useMerchantShopStore()
const userStore = useUserStore()

// 获取商家信息
const fetchMerchantInfo = async () => {
  if (!userStore.currentUser) return
  try {
    await merchantStore.fetchMerchantByUserId(userStore.currentUser.id)
  } catch (error) {
    ElMessage.error('获取商家信息失败')
  }
}

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  fetchMerchantInfo()
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 40px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.user-info {
  margin-left: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-dropdown .el-icon {
  margin-left: 4px;
}

.main-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
}
</style>