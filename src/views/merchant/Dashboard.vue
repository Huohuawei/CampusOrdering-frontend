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
      <el-col :span="24">
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
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Shop, List, TrendCharts, Menu } from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import { useMerchantOrdersStore } from '@/stores/merchant/orders'
import { useMerchantDishesStore } from '@/stores/merchant/dishes'
import { ElCard, ElRow, ElCol } from 'element-plus'
import type { DateRange } from '@/types'

const router = useRouter()
const merchantStore = useMerchantShopStore()
const ordersStore = useMerchantOrdersStore()
const dishesStore = useMerchantDishesStore()
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
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.dashboard-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  height: 200px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid rgba(0, 77, 128, 0.15);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s;
}

.dashboard-card:hover::before {
  left: 100%;
}

.dashboard-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 77, 128, 0.15);
  border-color: rgba(0, 77, 128, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

.card-header .el-icon {
  font-size: 20px;
  color: #004d80;
}

.card-header span {
  color: #004d80;
  font-weight: 600;
  font-size: 16px;
}

.card-content {
  text-align: center;
  padding: 25px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.card-content h3 {
  margin: 0 0 15px 0;
  color: #004d80;
  font-size: 18px;
  font-weight: 600;
}

.card-content p {
  margin: 8px 0;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.6;
}

.mt-4 {
  margin-top: 25px;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .merchant-dashboard {
    padding: 15px;
  }
  
  .dashboard-card {
    height: 180px;
    margin-bottom: 15px;
  }
  
  .card-content {
    padding: 20px 15px;
  }
  
  .card-content h3 {
    font-size: 16px;
  }
  
  .card-content p {
    font-size: 13px;
  }
}
</style> 