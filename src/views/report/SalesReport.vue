<template>
  <div class="sales-report">
    <a-card title="销售报表" :bordered="false">
      <!-- 筛选条件 -->
      <a-form layout="inline" class="filter-form">
        <a-form-item label="时间范围">
          <a-range-picker
            v-model="dateRange"
            show-time
            @change="handleDateRangeChange"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="generateReport">
            生成报表
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 数据概览 -->
      <div class="data-overview">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card>
              <statistic
                title="总销售额"
                :value="reportData.totalSales"
                :precision="2"
                prefix="￥"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <statistic
                title="总订单数"
                :value="reportData.totalOrders"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <statistic
                title="已完成订单数"
                :value="reportData.completedOrders"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <statistic
                title="平均订单金额"
                :value="reportData.averageOrderValue"
                :precision="2"
                prefix="￥"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 订单状态分布 -->
      <a-card title="订单状态分布" class="chart-card">
        <div ref="orderStatusChart" style="height: 300px"></div>
      </a-card>

      <!-- 销售趋势 -->
      <a-card title="销售趋势" class="chart-card">
        <div ref="salesTrendChart" style="height: 300px"></div>
      </a-card>

      <!-- 订单列表 -->
      <a-card title="订单明细" class="table-card">
        <a-table
          :columns="columns"
          :data-source="orders"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'totalPrice'">
              ￥{{ record.totalPrice.toFixed(2) }}
            </template>
            <template v-else-if="column.dataIndex === 'createdAt'">
              {{ formatDateTime(record.createdAt) }}
            </template>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, reactive } from 'vue'
import { Statistic } from 'ant-design-vue'
import * as echarts from 'echarts'
import { getOrders } from '@/api/order'
import { formatDateTime } from '@/utils/format'

export default defineComponent({
  name: 'SalesReport',
  components: {
    Statistic
  },
  setup() {
    const dateRange = ref([])
    const loading = ref(false)
    const orders = ref([])
    const orderStatusChart = ref(null)
    const salesTrendChart = ref(null)

    const reportData = reactive({
      totalSales: 0,
      totalOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0
    })

    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0
    })

    const columns = [
      {
        title: '订单编号',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: '商家名称',
        dataIndex: ['merchant', 'storeName'],
        key: 'merchantName'
      },
      {
        title: '订单金额',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        sorter: true
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status'
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true
      }
    ]

    // 获取订单数据
    const fetchOrders = async () => {
      loading.value = true
      try {
        const [startDate, endDate] = dateRange.value || []
        const params = {
          startDate: startDate?.format('YYYY-MM-DD HH:mm:ss'),
          endDate: endDate?.format('YYYY-MM-DD HH:mm:ss')
        }
        const response = await getOrders(params)
        orders.value = response.data
        calculateReportData()
        renderCharts()
      } catch (error) {
        console.error('获取订单数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 计算报表数据
    const calculateReportData = () => {
      const completedOrders = orders.value.filter(order => order.status === 'COMPLETED')
      reportData.totalOrders = orders.value.length
      reportData.completedOrders = completedOrders.length
      reportData.totalSales = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)
      reportData.averageOrderValue = reportData.completedOrders > 0
        ? reportData.totalSales / reportData.completedOrders
        : 0
    }

    // 渲染图表
    const renderCharts = () => {
      renderOrderStatusChart()
      renderSalesTrendChart()
    }

    // 渲染订单状态分布图
    const renderOrderStatusChart = () => {
      const statusCount = {}
      orders.value.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1
      })

      const chart = echarts.init(orderStatusChart.value)
      chart.setOption({
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
            data: Object.entries(statusCount).map(([status, count]) => ({
              name: getStatusText(status),
              value: count
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
      })
    }

    // 渲染销售趋势图
    const renderSalesTrendChart = () => {
      const dailySales = {}
      orders.value
        .filter(order => order.status === 'COMPLETED')
        .forEach(order => {
          const date = order.createdAt.split(' ')[0]
          dailySales[date] = (dailySales[date] || 0) + order.totalPrice
        })

      const chart = echarts.init(salesTrendChart.value)
      chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: Object.keys(dailySales).sort()
        },
        yAxis: {
          type: 'value',
          name: '销售额（元）'
        },
        series: [
          {
            data: Object.entries(dailySales)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([_, value]) => value),
            type: 'line',
            smooth: true
          }
        ]
      })
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        PENDING: '待处理',
        PROCESSING: '处理中',
        COMPLETED: '已完成',
        CANCELED: '已取消'
      }
      return statusMap[status] || status
    }

    // 获取状态颜色
    const getStatusColor = (status) => {
      const colorMap = {
        PENDING: 'orange',
        PROCESSING: 'blue',
        COMPLETED: 'green',
        CANCELED: 'red'
      }
      return colorMap[status] || 'default'
    }

    // 处理日期范围变化
    const handleDateRangeChange = () => {
      generateReport()
    }

    // 生成报表
    const generateReport = () => {
      fetchOrders()
    }

    // 处理表格变化
    const handleTableChange = (pag, filters, sorter) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      // 可以根据需要添加排序逻辑
    }

    onMounted(() => {
      generateReport()
    })

    return {
      dateRange,
      loading,
      orders,
      reportData,
      columns,
      pagination,
      orderStatusChart,
      salesTrendChart,
      handleDateRangeChange,
      generateReport,
      handleTableChange,
      getStatusText,
      getStatusColor,
      formatDateTime
    }
  }
})
</script>

<style scoped>
.sales-report {
  padding: 24px;
}

.filter-form {
  margin-bottom: 24px;
}

.data-overview {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.table-card {
  margin-bottom: 24px;
}
</style> 