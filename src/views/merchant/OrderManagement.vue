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
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.header {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  color: #004d80;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.ml-4 {
  margin-left: 15px;
}

/* 订单标签页样式 */
.order-tabs {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  padding: 5px;
  border-radius: 10px;
  border: 1px solid rgba(0, 77, 128, 0.15);
}

:deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  color: #004d80;
  transition: all 0.3s;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  color: #004d80;
  box-shadow: 0 2px 8px rgba(0, 77, 128, 0.15);
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
  cursor: pointer;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ml-2 {
  margin-left: 8px;
}

/* 按钮组样式 */
:deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
}

/* 订单详情对话框样式 */
:deep(.el-dialog) {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 77, 128, 0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

:deep(.el-dialog__title) {
  color: #004d80;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 25px;
}

.order-detail {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 20px;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  border-radius: 10px;
  border: 1px solid rgba(0, 77, 128, 0.15);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  color: #004d80;
  font-weight: 600;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 18px;
}

.user-info h3,
.order-items h3 {
  color: #004d80;
  font-size: 18px;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 77, 128, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-management {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .order-info {
    grid-template-columns: 1fr;
  }
  
  :deep(.el-button-group) {
    flex-wrap: wrap;
  }
}
</style>

