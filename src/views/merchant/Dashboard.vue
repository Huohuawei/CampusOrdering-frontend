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
import { useMerchantOrdersStore } from '@/stores/merchant/orders'
import { useMerchantDishesStore } from '@/stores/merchant/dishes'
import { useMerchantReviewsStore } from '@/stores/merchant/reviews'
import { ElCard, ElRow, ElCol } from 'element-plus'
import type { DateRange } from '@/types'

const router = useRouter()
const merchantStore = useMerchantShopStore()
const ordersStore = useMerchantOrdersStore()
const dishesStore = useMerchantDishesStore()
const reviewsStore = useMerchantReviewsStore()

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

// 获取今日日期范围
const getTodayDateRange = (): DateRange => {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  return {
    startDate: dateStr,
    endDate: dateStr
  }
}

// 获取统计数据
const fetchDashboardStats = async () => {
  try {
    if (!merchantStore.currentMerchant?.id) {
      throw new Error('当前商家信息不存在')
    }

    // 获取今日订单统计
    const todayRange = getTodayDateRange()
    const orderStats = await ordersStore.fetchOrderStats(
      merchantStore.currentMerchant.id,
      todayRange
    )
    todayOrders.value = {
      pending: orderStats.pending.count,
      completed: orderStats.completed.count
    }
    todayStats.value = {
      orderCount: orderStats.total.count,
      totalAmount: orderStats.total.amount
    }

    // 获取菜单统计
    await dishesStore.fetchAllDishes()
    menuStats.value = {
      total: dishesStore.dishes.length,
      available: dishesStore.dishes.filter(dish => dish.available).length
    }

    // 获取评价统计
    await reviewsStore.fetchAllReviews()
    const reviews = reviewsStore.reviews
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    reviewStats.value = {
      averageRating: reviews.length ? Number((totalRating / reviews.length).toFixed(1)) : 0,
      total: reviews.length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(async () => {
  try {
    // 获取当前商家信息
    await merchantStore.getCurrentMerchant()
    // 获取统计数据
    await fetchDashboardStats()
  } catch (error) {
    console.error('初始化失败:', error)
  }
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