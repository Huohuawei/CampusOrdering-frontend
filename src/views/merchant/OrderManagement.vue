<template>
  <div class="order-management">
    <h2>订单管理</h2>
    
    <!-- 订单状态筛选 -->
    <el-tabs v-model="activeStatus" @tab-click="handleStatusChange">
      <el-tab-pane label="全部" name="ALL" />
      <el-tab-pane label="待确认" name="PENDING" />
      <el-tab-pane label="制作中" name="PREPARING" />
      <el-tab-pane label="待取餐" name="READY" />
      <el-tab-pane label="已完成" name="COMPLETED" />
      <el-tab-pane label="已取消" name="CANCELED" />
    </el-tabs>

    <!-- 订单列表 -->
    <el-table :data="orders" style="width: 100%">
      <el-table-column prop="id" label="订单号" width="100" />
      <el-table-column prop="user.username" label="用户" width="120" />
      <el-table-column prop="totalPrice" label="总价" width="100">
        <template #default="{ row }">
          ¥{{ row.totalPrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'PENDING'"
            type="success" 
            link 
            @click="handleConfirmOrder(row)"
          >
            确认订单
          </el-button>
          <el-button 
            v-if="row.status === 'CONFIRMED'"
            type="primary" 
            link 
            @click="handleStartPreparing(row)"
          >
            开始制作
          </el-button>
          <el-button 
            v-if="row.status === 'PREPARING'"
            type="warning" 
            link 
            @click="handleReadyForPickup(row)"
          >
            准备完成
          </el-button>
          <el-button 
            v-if="row.status === 'READY'"
            type="success" 
            link 
            @click="handleCompleteOrder(row)"
          >
            完成订单
          </el-button>
          <el-button 
            v-if="['PENDING', 'CONFIRMED'].includes(row.status)"
            type="danger" 
            link 
            @click="handleCancelOrder(row)"
          >
            取消订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="600px"
    >
      <div v-if="currentOrder">
        <h3>订单信息</h3>
        <p>订单号：{{ currentOrder.id }}</p>
        <p>用户：{{ currentOrder.user.username }}</p>
        <p>总价：¥{{ currentOrder.totalPrice.toFixed(2) }}</p>
        <p>状态：{{ getStatusText(currentOrder.status) }}</p>
        <p>下单时间：{{ new Date(currentOrder.createdAt).toLocaleString() }}</p>
        
        <h3>订单项目</h3>
        <el-table :data="currentOrder.orderItems" style="width: 100%">
          <el-table-column prop="dish.name" label="菜品" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="dish.price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.dish.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              ¥{{ (row.quantity * row.dish.price).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMerchantOrdersStore } from '@/stores/merchant/orders'
import type { Order, OrderStatus } from '@/types'

const ordersStore = useMerchantOrdersStore()
const orders = ref<Order[]>([])
const activeStatus = ref('ALL')
const orderDetailVisible = ref(false)
const currentOrder = ref<Order | null>(null)

// 获取订单列表
const fetchOrders = async () => {
  try {
    await ordersStore.fetchOrders(activeStatus.value === 'ALL' ? undefined : activeStatus.value as OrderStatus)
    orders.value = ordersStore.orders
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

// 处理状态变化
const handleStatusChange = () => {
  fetchOrders()
}

// 获取状态类型
const getStatusType = (status: OrderStatus) => {
  const types: Record<OrderStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PREPARING: 'primary',
    READY: 'success',
    COMPLETED: 'success',
    CANCELED: 'danger'
  }
  return types[status]
}

// 获取状态文本
const getStatusText = (status: OrderStatus) => {
  const texts: Record<OrderStatus, string> = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    PREPARING: '制作中',
    READY: '待取餐',
    COMPLETED: '已完成',
    CANCELED: '已取消'
  }
  return texts[status]
}

// 确认订单
const handleConfirmOrder = async (order: Order) => {
  try {
    await ordersStore.updateOrderStatus(order.id, 'CONFIRMED')
    ElMessage.success('订单已确认')
    fetchOrders()
  } catch (error) {
    ElMessage.error('确认订单失败')
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

// 准备完成
const handleReadyForPickup = async (order: Order) => {
  try {
    await ordersStore.updateOrderStatus(order.id, 'READY')
    ElMessage.success('订单已准备完成')
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

// 取消订单
const handleCancelOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await ordersStore.updateOrderStatus(order.id, 'CANCELED')
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.el-tabs {
  margin-bottom: 20px;
}
</style>
