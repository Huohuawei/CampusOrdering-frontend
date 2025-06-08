<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in overviewCards" :key="card.title">
        <el-card class="overview-card" :body-style="{ padding: '20px' }" v-loading="loading">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: card.color }">
              <el-icon>
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>商家状态分布</span>
            </div>
          </template>
          <div ref="merchantStatusChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div ref="orderStatusChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  Shop,
  Goods,
  Money
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 加载状态
const loading = ref(true)

// 概览卡片数据
const overviewCards = ref([
  {
    title: '总用户数',
    value: '0',
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '商家数量',
    value: '0',
    icon: 'Shop',
    color: '#67C23A'
  },
  {
    title: '菜品总数',
    value: '0',
    icon: 'Goods',
    color: '#E6A23C'
  },
  {
    title: '订单总数',
    value: '0',
    icon: 'Money',
    color: '#F56C6C'
  }
])

// 图表相关
const merchantStatusChartRef = ref<HTMLElement | null>(null)
const orderStatusChartRef = ref<HTMLElement | null>(null)
let merchantStatusChart: echarts.ECharts | null = null
let orderStatusChart: echarts.ECharts | null = null

// 获取用户数据
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/users')
    const data = await response.json()
    overviewCards.value[0].value = data.length.toString()
  } catch (error) {
    ElMessage.error('获取用户数据失败')
  }
}

// 获取商家数据
const fetchMerchants = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/merchants')
    const data = await response.json()
    overviewCards.value[1].value = data.length.toString()
    return data
  } catch (error) {
    ElMessage.error('获取商家数据失败')
    return []
  }
}

// 获取菜品数据
const fetchDishes = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/dishes')
    const data = await response.json()
    overviewCards.value[2].value = data.length.toString()
  } catch (error) {
    ElMessage.error('获取菜品数据失败')
  }
}

// 获取订单数据
const fetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/orders')
    const data = await response.json()
    overviewCards.value[3].value = data.length.toString()
    return data
  } catch (error) {
    ElMessage.error('获取订单数据失败')
    return []
  }
}

// 初始化商家状态分布图表
const initMerchantStatusChart = async (merchants: any[]) => {
  if (!merchantStatusChartRef.value) return

  const statusCount = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  }

  merchants.forEach(merchant => {
    statusCount[merchant.status]++
  })

  merchantStatusChart = echarts.init(merchantStatusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: statusCount.PENDING, name: '待审核' },
          { value: statusCount.APPROVED, name: '已通过' },
          { value: statusCount.REJECTED, name: '已拒绝' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  merchantStatusChart.setOption(option)
}

// 初始化订单状态分布图表
const initOrderStatusChart = async (orders: any[]) => {
  if (!orderStatusChartRef.value) return

  const statusCount = {
    PENDING: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0
  }

  orders.forEach(order => {
    statusCount[order.status]++
  })

  orderStatusChart = echarts.init(orderStatusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: statusCount.PENDING, name: '待处理' },
          { value: statusCount.PREPARING, name: '准备中' },
          { value: statusCount.READY, name: '待取餐' },
          { value: statusCount.COMPLETED, name: '已完成' },
          { value: statusCount.CANCELLED, name: '已取消' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  orderStatusChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  merchantStatusChart?.resize()
  orderStatusChart?.resize()
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      fetchUsers(),
      fetchDishes()
    ])

    const merchants = await fetchMerchants()
    const orders = await fetchOrders()

    await Promise.all([
      initMerchantStatusChart(merchants),
      initOrderStatusChart(orders)
    ])

    window.addEventListener('resize', handleResize)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  merchantStatusChart?.dispose()
  orderStatusChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 概览卡片样式 */
.overview-card {
  margin-bottom: 20px;
  border-radius: 15px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.card-icon .el-icon {
  font-size: 28px;
  color: #ffffff;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #005c4b;
  margin-bottom: 8px;
}

/* 图表卡片样式 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 15px;
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 92, 75, 0.1);
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #005c4b;
}

.chart {
  height: 350px;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .chart {
    height: 300px;
  }

  .card-value {
    font-size: 20px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
  }
}
</style>