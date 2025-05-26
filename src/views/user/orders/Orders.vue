<template>
  <div class="page-wrapper">
    <div class="page-container">
      <h2 class="title">我的订单</h2>

      <!-- 搜索 + 排序 -->
      <div class="toolbar">
        <el-input v-model="searchText" placeholder="搜索订单号或店铺名" clearable />
        <el-select v-model="sortKey" placeholder="排序方式" style="width: 180px;">
          <el-option label="时间倒序" value="time_desc" />
          <el-option label="时间正序" value="time_asc" />
          <el-option label="金额从高到低" value="price_desc" />
          <el-option label="金额从低到高" value="price_asc" />
        </el-select>
      </div>

      <el-empty v-if="filteredOrders.length === 0" description="暂无订单" />

      <div class="order-list" v-else>
        <el-card
          v-for="order in filteredOrders"
          :key="order.id"
          shadow="hover"
          class="order-card"
        >
          <!-- 封面图 -->
          <el-image
            class="order-cover"
            :src="order.merchant?.coverImage"
            fit="cover"
            lazy
          >
            <template #error>
              <div class="order-cover-placeholder">加载失败</div>
            </template>
          </el-image>

          <!-- 内容 -->
          <div class="order-header">
            <div class="order-info">
              <div>
                <p class="order-store">{{ order.merchant?.storeName || '未知商户' }}</p>
                <p class="order-text">订单号：{{ order.id }}</p>
                <p class="order-text">下单时间：{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>

            <div class="text-right">
              <el-tag :type="getStatusType(order.status)" size="small" effect="light" round>
                {{ order.status }}
              </el-tag>
              <p class="order-total">￥{{ order.totalPrice }}</p>
            </div>
          </div>

          <!-- ✅ 新增：订单项明细 -->
          <div class="order-items">
            <el-table
              :data="order.items"
              v-if="order.items && order.items.length"
              style="width: 100%; margin-top: 10px;"
              size="small"
              border
            >
              <el-table-column prop="dish.name" label="菜品名称" />
              <el-table-column prop="dish.price" label="单价" />
              <el-table-column prop="quantity" label="数量" />
            </el-table>
            <div v-else style="margin-top: 10px; color: gray;">暂无订单详情</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOrdersByUserId, getOrderItemsByOrderId } from '../../../api/order'
import { ElMessage } from 'element-plus'

const orders = ref([])
const searchText = ref('')
const sortKey = ref('time_desc')

const userId = 1

onMounted(async () => {
  try {
    const res = await getOrdersByUserId(userId)
    if (Array.isArray(res)) {
      for (const order of res) {
        try {
          const items = await getOrderItemsByOrderId(order.id)
          order.items = items
        } catch (itemErr) {
          order.items = []
          console.warn(`订单 ${order.id} 加载订单项失败：`, itemErr)
        }
      }
      orders.value = res
    } else {
      orders.value = []
    }
  } catch (err) {
    ElMessage.error('获取订单失败')
    console.error(err)
  }
})

const filteredOrders = computed(() => {
  const keyword = searchText.value.toLowerCase()
  let result = orders.value.filter(order =>
    String(order.id).includes(keyword) ||
    order.merchant?.storeName?.toLowerCase().includes(keyword)
  )

  switch (sortKey.value) {
    case 'time_asc':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'time_desc':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'price_asc':
      result.sort((a, b) => a.totalPrice - b.totalPrice)
      break
    case 'price_desc':
      result.sort((a, b) => b.totalPrice - a.totalPrice)
      break
  }

  return result
})

const getStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'info'
    case 'CONFIRMED': return 'success'
    case 'CANCELLED': return 'danger'
    default: return 'info' // ✅ 默认改成合法值
  }
}

const formatDate = (datetime) => {
  const d = new Date(datetime)
  return d.toLocaleString()
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 40px 0;
}

.page-container {
  width: 100%;
  max-width: 960px;
  padding: 0 16px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

/* ✅ 两列排列：新增 */
.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.order-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.order-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.order-cover-placeholder {
  width: 100%;
  height: 180px;
  background-color: #f2f2f2;
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-text {
  font-size: 14px;
  color: #6b7280;
  margin: 2px 0;
}

.order-store {
  font-size: 16px;
  font-weight: 600;
}

.order-total {
  font-size: 20px;
  color: #dc2626;
  font-weight: bold;
  margin-top: 8px;
}
</style>
