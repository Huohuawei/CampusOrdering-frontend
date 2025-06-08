<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>销售统计</h2>
      
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ formatNumber(totalSales) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>订单总数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ totalOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>平均订单金额</span>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ formatNumber(averageOrderAmount) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>完成订单数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">{{ completedOrders }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div ref="orderStatusChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商家销售额分布</span>
            </div>
          </template>
          <div ref="merchantSalesChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商家销售排行</span>
            </div>
          </template>
          <el-table :data="merchantRanking" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="{ row }">
                <div class="rank" :class="{ 'top-3': row.rank <= 3 }">{{ row.rank }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="storeName" label="商家名称" />
            <el-table-column prop="orderCount" label="订单数" />
            <el-table-column prop="totalSales" label="销售额">
              <template #default="{ row }">
                ¥{{ formatNumber(row.totalSales) }}
              </template>
            </el-table-column>
            <el-table-column prop="averageOrderAmount" label="平均订单金额">
              <template #default="{ row }">
                ¥{{ formatNumber(row.averageOrderAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 状态选择
const selectedStatus = ref('ALL')

// 统计数据
const totalSales = ref(0)
const totalOrders = ref(0)
const completedOrders = ref(0)
const averageOrderAmount = computed(() => {
  return totalOrders.value > 0 ? totalSales.value / totalOrders.value : 0
})

// 商家排行数据
const merchantRanking = ref([])

// 图表相关
const orderStatusChartRef = ref<HTMLElement | null>(null)
const merchantSalesChartRef = ref<HTMLElement | null>(null)
let orderStatusChart: echarts.ECharts | null = null
let merchantSalesChart: echarts.ECharts | null = null

// 获取订单数据
const fetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/orders')
    const data = await response.json()
    totalOrders.value = data.length
    // 计算总销售额（只计算已完成的订单）
    totalSales.value = data
      .filter((order: any) => order.status === 'COMPLETED')
      .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0)
    completedOrders.value = data.filter((order: any) => order.status === 'COMPLETED').length
    return data
  } catch (error) {
    ElMessage.error('获取订单数据失败')
    return []
  }
}

// 获取商家数据
const fetchMerchants = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/merchants')
    const data = await response.json()
    return data
  } catch (error) {
    ElMessage.error('获取商家数据失败')
    return []
  }
}

// 计算商家销售排行
const calculateMerchantRanking = async (orders: any[], merchants: any[]) => {
  const merchantSales = new Map()
  
  // 初始化商家销售数据
  merchants.forEach(merchant => {
    merchantSales.set(merchant.id, {
      storeName: merchant.storeName,
      orderCount: 0,
      totalSales: 0
    })
  })
  
  // 统计每个商家的销售数据（只统计已完成的订单）
  orders
    .filter(order => order.status === 'COMPLETED')
    .forEach(order => {
      if (merchantSales.has(order.merchant.id)) {
        const merchantData = merchantSales.get(order.merchant.id)
        merchantData.orderCount++
        merchantData.totalSales += order.totalPrice || 0
      }
    })
  
  // 转换为数组并排序
  const ranking = Array.from(merchantSales.values())
    .map((data, index) => ({
      rank: index + 1,
      ...data,
      averageOrderAmount: data.orderCount > 0 ? data.totalSales / data.orderCount : 0
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
  
  merchantRanking.value = ranking
  return ranking
}

// 初始化订单状态分布图表
const initOrderStatusChart = async (orders: any[]) => {
  if (!orderStatusChartRef.value) return
  
  const statusCount = {
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    CANCELED: 0,
    COMPLETED: 0
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
          { value: statusCount.CONFIRMED, name: '已确认' },
          { value: statusCount.PREPARING, name: '准备中' },
          { value: statusCount.READY, name: '待取餐' },
          { value: statusCount.CANCELED, name: '已取消' },
          { value: statusCount.COMPLETED, name: '已完成' }
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

// 初始化商家销售额分布图表
const initMerchantSalesChart = (ranking: any[]) => {
  if (!merchantSalesChartRef.value) return
  
  merchantSalesChart = echarts.init(merchantSalesChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: ranking.slice(0, 5).map(item => ({
          value: item.totalSales,
          name: item.storeName
        })),
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
  merchantSalesChart.setOption(option)
}

// 处理状态变化
const handleStatusChange = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/orders/status/${selectedStatus.value}`)
    const data = await response.json()
    totalOrders.value = data.length
    // 更新销售额（只计算已完成的订单）
    totalSales.value = data
      .filter((order: any) => order.status === 'COMPLETED')
      .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0)
    completedOrders.value = data.filter((order: any) => order.status === 'COMPLETED').length
    initOrderStatusChart(data)
  } catch (error) {
    ElMessage.error('获取订单数据失败')
  }
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 监听窗口大小变化
const handleResize = () => {
  orderStatusChart?.resize()
  merchantSalesChart?.resize()
}

onMounted(async () => {
  try {
    const [orders, merchants] = await Promise.all([
      fetchOrders(),
      fetchMerchants()
    ])
    
    const ranking = await calculateMerchantRanking(orders, merchants)
    
    await Promise.all([
      initOrderStatusChart(orders),
      initMerchantSalesChart(ranking)
    ])
    
    window.addEventListener('resize', handleResize)
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  orderStatusChart?.dispose()
  merchantSalesChart?.dispose()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  border: 1px solid rgba(0, 92, 75, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #005c4b;
  font-weight: 600;
  position: relative;
  padding-left: 15px;
}

.page-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #005c4b, #90c3b5);
  border-radius: 2px;
}

/* 数据卡片样式 */
.data-card {
  border-radius: 15px;
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  transition: all 0.3s;
  margin-bottom: 20px;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.data-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #f8faf9 0%, #e6f0ec 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  color: #005c4b;
  font-weight: 600;
  font-size: 16px;
}

.card-content {
  padding: 20px;
  text-align: center;
}

.amount {
  font-size: 28px;
  font-weight: 600;
  color: #005c4b;
  margin-bottom: 10px;
}

/* 图表卡片样式 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 15px;
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.chart {
  height: 350px;
  padding: 20px;
}

/* 表格样式 */
.chart-card :deep(.el-table) {
  --el-table-border-color: rgba(0, 92, 75, 0.1);
  --el-table-header-bg-color: #f8faf9;
  --el-table-row-hover-bg-color: #e6f0ec;
}

.chart-card :deep(.el-table th) {
  background-color: #f8faf9;
  color: #005c4b;
  font-weight: 600;
}

.chart-card :deep(.el-table td) {
  color: #666;
}

.rank {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 12px;
  background: #f8faf9;
  color: #666;
  font-weight: 500;
}

.rank.top-3 {
  color: #ffffff;
  font-weight: 600;
}

.rank.top-3:nth-child(1) {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.rank.top-3:nth-child(2) {
  background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
}

.rank.top-3:nth-child(3) {
  background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .chart {
    height: 300px;
  }

  .amount {
    font-size: 24px;
  }
}
</style> 