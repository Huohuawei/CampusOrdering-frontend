<template>
  <div class="order-management">
    <div class="header">
      <div class="header-left">
        <h1>订单管理</h1>
        <el-tag type="info" class="ml-4">{{ merchantStore.currentMerchant?.storeName }}</el-tag>
      </div>
      <el-radio-group v-model="activeTab" class="order-tabs">
        <el-radio-button label="pending">待处理</el-radio-button>
        <el-radio-button label="processing">处理中</el-radio-button>
        <el-radio-button label="completed">已完成</el-radio-button>
        <el-radio-button label="cancelled">已取消</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <el-table
      v-loading="loading"
      :data="currentOrders"
      style="width: 100%"
      @row-click="handleOrderClick"
    >
      <el-table-column prop="id" label="订单号" width="100" />
      <el-table-column label="用户信息" width="200">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" :src="row.user.avatar" />
            <span class="ml-2">{{ row.user.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalPrice" label="总价" width="120">
        <template #default="{ row }">
          ¥{{ row.totalPrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
          <el-button 
            v-if="row.status === 'PENDING'"
            type="success" 
              @click.stop="handleAcceptOrder(row)"
            >
              接单
            </el-button>
            <el-button 
              v-if="row.status === 'PENDING'"
              type="danger" 
              @click.stop="handleRejectOrder(row)"
          >
              拒单
          </el-button>
          <el-button 
            v-if="row.status === 'CONFIRMED'"
            type="primary" 
              @click.stop="handleStartPreparing(row)"
          >
            开始制作
          </el-button>
          <el-button 
            v-if="row.status === 'PREPARING'"
              type="success" 
              @click.stop="handleMarkReady(row)"
          >
              制作完成
          </el-button>
          <el-button 
            v-if="row.status === 'READY'"
            type="success" 
              @click.stop="handleCompleteOrder(row)"
          >
            完成订单
          </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span>{{ currentOrder.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span>{{ formatDate(currentOrder.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">总价：</span>
            <span class="price">¥{{ currentOrder.totalPrice.toFixed(2) }}</span>
          </div>
        </div>

        <div class="user-info">
          <h3>用户信息</h3>
          <div class="info-item">
            <span class="label">用户名：</span>
            <span>{{ currentOrder.user.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span>{{ currentOrder.user.phone }}</span>
          </div>
        </div>

        <div class="order-items">
        <h3>订单项目</h3>
          <el-table :data="currentOrderItems" style="width: 100%">
            <el-table-column prop="dish.name" label="菜品名称" />
            <el-table-column prop="dish.price" label="单价" width="120">
            <template #default="{ row }">
              ¥{{ row.dish.price.toFixed(2) }}
            </template>
          </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column label="小计" width="120">
            <template #default="{ row }">
                ¥{{ (row.dish.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMerchantOrdersStore } from '@/stores/merchant/orders'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import type { Order } from '@/types'

const ordersStore = useMerchantOrdersStore()
const merchantStore = useMerchantShopStore()

// 移除模拟商家数据
const loading = ref(false)
const activeTab = ref('pending')
const dialogVisible = ref(false)

// 根据当前标签获取对应的订单列表
const currentOrders = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return ordersStore.pendingOrders
    case 'processing':
      return ordersStore.processingOrders
    case 'completed':
      return ordersStore.completedOrders
    case 'cancelled':
      return ordersStore.cancelledOrders
    default:
      return []
  }
})

// 获取当前订单和订单项
const currentOrder = computed(() => ordersStore.currentOrder)
const currentOrderItems = computed(() => ordersStore.currentOrderItems)

// 获取订单状态类型
const getStatusType = (status: Order['status']) => {
  const statusMap: Record<Order['status'], string> = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'PREPARING': 'info',
    'READY': 'success',
    'COMPLETED': 'success',
    'CANCELED': 'danger'
  }
  return statusMap[status]
}

// 获取订单状态文本
const getStatusText = (status: Order['status']) => {
  const statusMap: Record<Order['status'], string> = {
    'PENDING': '待处理',
    'CONFIRMED': '已接单',
    'PREPARING': '制作中',
    'READY': '待取餐',
    'COMPLETED': '已完成',
    'CANCELED': '已取消'
  }
  return statusMap[status]
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    if (!merchantStore.currentMerchant?.id) {
      throw new Error('当前商家信息不存在')
    }
    await ordersStore.fetchMerchantOrders(merchantStore.currentMerchant.id)
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理订单点击
const handleOrderClick = async (order: Order) => {
  try {
    await ordersStore.fetchOrderDetail(order.id)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  }
}

// 处理接单
const handleAcceptOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定接受此订单吗？', '提示', {
      type: 'warning'
    })
    await ordersStore.updateOrderStatus(order.id, 'CONFIRMED')
    ElMessage.success('接单成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('接单失败')
    }
  }
}

// 处理拒单
const handleRejectOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定拒绝此订单吗？', '提示', {
      type: 'warning'
    })
    await ordersStore.cancelOrder(order.id)
    ElMessage.success('已拒绝订单')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒单失败')
    }
  }
}

// 开始制作
const handleStartPreparing = async (order: Order) => {
  try {
    await ordersStore.updateOrderStatus(order.id, 'PREPARING')
    ElMessage.success('已开始制作')
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 标记制作完成
const handleMarkReady = async (order: Order) => {
  try {
    await ordersStore.updateOrderStatus(order.id, 'READY')
    ElMessage.success('已标记为制作完成')
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 完成订单
const handleCompleteOrder = async (order: Order) => {
  try {
    await ordersStore.updateOrderStatus(order.id, 'COMPLETED')
    ElMessage.success('订单已完成')
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(async () => {
  try {
    // 获取当前商家信息
    await merchantStore.getCurrentMerchant()
    // 获取订单列表
    await fetchOrders()
  } catch (error) {
    ElMessage.error('初始化失败')
  }
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-tabs {
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-detail {
  padding: 20px;
}

.order-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.user-info {
  margin-bottom: 24px;
}

.user-info h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: #303133;
}

.order-items h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: #303133;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}
</style>

