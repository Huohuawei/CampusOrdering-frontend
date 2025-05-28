<template>
  <div class="merchant-dashboard">
    <el-row :gutter="20">
      <!-- 店铺信息卡片 -->
      <el-col :span="8">
        <el-card class="dashboard-card" @click="router.push('/merchant/profile')">
          <template #header>
            <div class="card-header">
              <el-icon><Shop /></el-icon>
              <span>店铺信息</span>
            </div>
          </template>
          <div class="card-content">
            <h3>{{ merchantStore.currentMerchant?.storeName }}</h3>
            <p>营业状态：{{ merchantStore.currentMerchant?.status === 'APPROVED' ? '营业中' : '未营业' }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 订单管理卡片 -->
      <el-col :span="8">
        <el-card class="dashboard-card" @click="router.push('/merchant/orders')">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </div>
          </template>
          <div class="card-content">
            <h3>今日订单</h3>
            <p>待处理订单：{{ todayOrders.pending }}</p>
            <p>已完成订单：{{ todayOrders.completed }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 销售统计卡片 -->
      <el-col :span="8">
        <el-card class="dashboard-card" @click="router.push('/merchant/statistics')">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>销售统计</span>
            </div>
          </template>
          <div class="card-content">
            <h3>今日销售</h3>
            <p>订单数：{{ todayStats.orderCount }}</p>
            <p>销售额：¥{{ todayStats.totalAmount }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 菜单管理卡片 -->
      <el-col :span="12">
        <el-card class="dashboard-card" @click="router.push('/merchant/menu')">
          <template #header>
            <div class="card-header">
              <el-icon><Menu /></el-icon>
              <span>菜单管理</span>
            </div>
          </template>
          <div class="card-content">
            <h3>菜品管理</h3>
            <p>当前菜品数：{{ menuStats.total }}</p>
            <p>在售菜品：{{ menuStats.available }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 评价管理卡片 -->
      <el-col :span="12">
        <el-card class="dashboard-card" @click="router.push('/merchant/reviews')">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>评价管理</span>
            </div>
          </template>
          <div class="card-content">
            <h3>店铺评价</h3>
            <p>平均评分：{{ reviewStats.averageRating }}</p>
            <p>评价总数：{{ reviewStats.total }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Shop, List, TrendCharts, Menu, ChatDotRound } from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import { ElCard, ElRow, ElCol } from 'element-plus'

const router = useRouter()
const merchantStore = useMerchantShopStore()

// 今日订单统计
const todayOrders = ref({
  pending: 0,
  completed: 0
})

// 今日销售统计
const todayStats = ref({
  orderCount: 0,
  totalAmount: 0
})

// 菜单统计
const menuStats = ref({
  total: 0,
  available: 0
})

// 评价统计
const reviewStats = ref({
  averageRating: 0,
  total: 0
})

// 获取统计数据
const fetchDashboardStats = async () => {
  try {
    // 模拟数据
    todayOrders.value = {
      pending: 5,
      completed: 10
    }
    todayStats.value = {
      orderCount: 15,
      totalAmount: 299.99
    }
    menuStats.value = {
      total: 20,
      available: 15
    }
    reviewStats.value = {
      averageRating: 4.5,
      total: 100
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
.merchant-dashboard {
  padding: 20px;
}

.dashboard-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 200px;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.card-content p {
  margin: 5px 0;
  color: #606266;
}

.mt-4 {
  margin-top: 20px;
}
</style> 