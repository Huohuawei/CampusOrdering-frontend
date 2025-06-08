<template>
  <div class="sales-statistics">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card class="stat-card total">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
              <el-tag type="info">{{ dateRangeText }}</el-tag>
            </div>
          </template>
          <div class="stat-content">
            <div class="amount">¥{{ orderStats.total.amount.toFixed(2) }}</div>
            <div class="count">订单数：{{ orderStats.total.count }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card completed">
          <template #header>
            <div class="card-header">
              <span>已完成订单</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="amount">¥{{ orderStats.completed.amount.toFixed(2) }}</div>
            <div class="count">订单数：{{ orderStats.completed.count }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card pending">
          <template #header>
            <div class="card-header">
              <span>待处理订单</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="amount">¥{{ orderStats.pending.amount.toFixed(2) }}</div>
            <div class="count">订单数：{{ orderStats.pending.count }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日期选择器和刷新按钮 -->
    <div class="filter-section">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        value-format="YYYY-MM-DD"
        @change="handleDateChange"
      />
      <el-button type="primary" :loading="loading" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 详细统计表格 -->
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>订单状态统计</span>
        </div>
      </template>
      <el-table :data="statusStats" style="width: 100%">
        <el-table-column prop="status" label="订单状态" width="180">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="订单数量" width="180" />
        <el-table-column prop="amount" label="订单金额">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比">
          <template #default="{ row }">
            {{ row.percentage }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 图表展示 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售额趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMerchantOrdersStore } from '@/stores/merchant/orders'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import type { DateRange } from '@/types'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'

const ordersStore = useMerchantOrdersStore()
const merchantStore = useMerchantShopStore()

// 日期范围
const dateRange = ref<DateRange>({
  startDate: '',
  endDate: ''
})

// 加载状态
const loading = ref(false)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 日期范围文本
const dateRangeText = computed(() => {
  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    return '全部时间'
  }
  const start = new Date(dateRange.value.startDate)
  const end = new Date(dateRange.value.endDate)
  return `${start.toLocaleDateString()} 至 ${end.toLocaleDateString()}`
})

// 订单统计数据
const orderStats = ref({
  total: { count: 0, amount: 0 },
  pending: { count: 0, amount: 0 },
  confirmed: { count: 0, amount: 0 },
  preparing: { count: 0, amount: 0 },
  ready: { count: 0, amount: 0 },
  completed: { count: 0, amount: 0 },
  canceled: { count: 0, amount: 0 }
})

// 状态统计表格数据
const statusStats = computed(() => {
  const total = orderStats.value.total.amount
  return [
    {
      status: 'PENDING',
      count: orderStats.value.pending.count,
      amount: orderStats.value.pending.amount,
      percentage: total ? ((orderStats.value.pending.amount / total) * 100).toFixed(1) : '0.0'
    },
    {
      status: 'CONFIRMED',
      count: orderStats.value.confirmed.count,
      amount: orderStats.value.confirmed.amount,
      percentage: total ? ((orderStats.value.confirmed.amount / total) * 100).toFixed(1) : '0.0'
    },
    {
      status: 'PREPARING',
      count: orderStats.value.preparing.count,
      amount: orderStats.value.preparing.amount,
      percentage: total ? ((orderStats.value.preparing.amount / total) * 100).toFixed(1) : '0.0'
    },
    {
      status: 'READY',
      count: orderStats.value.ready.count,
      amount: orderStats.value.ready.amount,
      percentage: total ? ((orderStats.value.ready.amount / total) * 100).toFixed(1) : '0.0'
    },
    {
      status: 'COMPLETED',
      count: orderStats.value.completed.count,
      amount: orderStats.value.completed.amount,
      percentage: total ? ((orderStats.value.completed.amount / total) * 100).toFixed(1) : '0.0'
    },
    {
      status: 'CANCELED',
      count: orderStats.value.canceled.count,
      amount: orderStats.value.canceled.amount,
      percentage: total ? ((orderStats.value.canceled.amount / total) * 100).toFixed(1) : '0.0'
    }
  ]
})

// 状态文本映射
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待处理',
    CONFIRMED: '已接单',
    PREPARING: '制作中',
    READY: '待取餐',
    COMPLETED: '已完成',
    CANCELED: '已取消'
  }
  return statusMap[status] || status
}

// 状态类型映射
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PREPARING: 'primary',
    READY: 'success',
    COMPLETED: 'success',
    CANCELED: 'danger'
  }
  return typeMap[status] || ''
}

// 图表实例
let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

// 更新饼图数据
const updatePieChart = () => {
  if (!pieChart) return
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
        data: statusStats.value.map(item => ({
          name: getStatusText(item.status),
          value: item.amount
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
  pieChart.setOption(option)
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)
  updateLineChart()
}

// 更新折线图数据
const updateLineChart = () => {
  if (!lineChart) return
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['待处理', '已接单', '制作中', '待取餐', '已完成', '已取消']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: statusStats.value.map(item => item.amount),
        type: 'line',
        smooth: true
      }
    ]
  }
  lineChart.setOption(option)
}

// 处理日期变化
const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    dateRange.value = {
      startDate: val[0],
      endDate: val[1]
    }
  } else {
    dateRange.value = {
      startDate: '',
      endDate: ''
    }
  }
}

// 处理刷新
const handleRefresh = async () => {
  loading.value = true
  try {
    await fetchStats()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    if (!merchantStore.currentMerchant?.id) {
      throw new Error('当前商家信息不存在')
    }
    console.log('获取统计数据，日期范围:', dateRange.value)
    const stats = await ordersStore.fetchOrderStats(
      merchantStore.currentMerchant.id,
      dateRange.value
    )
    console.log('获取到的统计数据:', stats)
    orderStats.value = stats
    updatePieChart()
    updateLineChart()
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
    throw error
  }
}

// 监听窗口大小变化
const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(async () => {
  try {
    // 获取当前商家信息
    await merchantStore.getCurrentMerchant()
    // 获取统计数据
    await fetchStats()
    // 初始化图表
    initPieChart()
    initLineChart()
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  } catch (error) {
    ElMessage.error('初始化失败')
  }
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  pieChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
.sales-statistics {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.mb-4 {
  margin-bottom: 25px;
}

.mt-4 {
  margin-top: 25px;
}

/* 统计卡片样式 */
.stat-card {
  height: 180px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid rgba(0, 77, 128, 0.15);
  border-radius: 15px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 77, 128, 0.15);
}

.stat-card.total {
  border-left: 4px solid #004d80;
}

.stat-card.completed {
  border-left: 4px solid #67c23a;
}

.stat-card.pending {
  border-left: 4px solid #e6a23c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

.card-header span {
  color: #004d80;
  font-size: 16px;
  font-weight: 600;
}

.stat-content {
  padding: 20px;
  text-align: center;
}

.amount {
  font-size: 28px;
  font-weight: 600;
  color: #004d80;
  margin-bottom: 10px;
}

.count {
  color: #2c3e50;
  font-size: 14px;
}

/* 筛选区域样式 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
}

:deep(.el-date-editor) {
  --el-datepicker-border-color: rgba(0, 77, 128, 0.2);
  --el-datepicker-hover-border-color: #004d80;
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
}

/* 表格样式 */
:deep(.el-table) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%) !important;
  color: #004d80;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 77, 128, 0.1);
}

:deep(.el-table tr:hover > td) {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%) !important;
}

/* 图表卡片样式 */
:deep(.el-card) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
  transition: all 0.3s;
}

:deep(.el-card:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 77, 128, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sales-statistics {
    padding: 15px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .stat-card {
    height: 160px;
    margin-bottom: 15px;
  }
  
  .amount {
    font-size: 24px;
  }
  
  .count {
    font-size: 13px;
  }
}
</style> 