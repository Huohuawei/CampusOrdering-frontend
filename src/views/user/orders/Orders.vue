<template>
  <div class="orders-page">
    <div class="orders-header">
      <h2 class="orders-title">
        <i class="fas fa-clipboard-list"></i>
        我的订单
      </h2>
    </div>

    <div class="orders-content">
      <!-- 搜索 + 排序 -->
      <div class="toolbar">
        <div class="search-wrapper">
          <i class="fas fa-search"></i>
          <el-input 
            v-model="searchText" 
            placeholder="搜索订单号或店铺名" 
            clearable
            class="search-input"
          />
        </div>
        <el-select 
          v-model="sortKey" 
          placeholder="排序方式" 
          class="sort-select"
        >
          <el-option label="时间倒序" value="time_desc" />
          <el-option label="时间正序" value="time_asc" />
          <el-option label="金额从高到低" value="price_desc" />
          <el-option label="金额从低到高" value="price_asc" />
        </el-select>
      </div>

      <el-empty 
        v-if="filteredOrders.length === 0" 
        description="暂无订单"
        class="empty-state"
      >
        <template #image>
          <i class="fas fa-shopping-bag empty-icon"></i>
        </template>
      </el-empty>

      <div class="order-list" v-else>
        <el-card
          v-for="order in filteredOrders"
          :key="order.id"
          shadow="hover"
          class="order-card"
        >
          <!-- 封面图 -->
          <div class="order-cover-wrapper">
            <el-image
              class="order-cover"
              :src="order.merchant?.coverImage"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="order-cover-placeholder">
                  <i class="fas fa-image"></i>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
            <div class="order-status">
              <el-tag 
                :type="getStatusType(order.status)" 
                size="small" 
                effect="dark" 
                round
              >
                {{ order.status }}
              </el-tag>
            </div>
          </div>

          <!-- 内容 -->
          <div class="order-content">
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-store">
                  <i class="fas fa-store"></i>
                  {{ order.merchant?.storeName || '未知商户' }}
                </h3>
                <div class="order-meta">
                  <p class="order-text">
                    <i class="fas fa-hashtag"></i>
                    订单号：{{ order.id }}
                  </p>
                  <p class="order-text">
                    <i class="fas fa-clock"></i>
                    下单时间：{{ formatDate(order.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="order-total">
                <span class="total-label">总计</span>
                <span class="total-price">￥{{ order.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 订单项明细 -->
            <div class="order-items">
              <el-table
                :data="order.items"
                v-if="order.items && order.items.length"
                style="width: 100%"
                size="small"
                :header-cell-style="{ background: '#f8f9fa', color: '#2c3e50' }"
                :cell-style="{ padding: '12px' }"
              >
                <el-table-column label="菜品" min-width="200">
                  <template #default="{ row }">
                    <div class="dish-info">
                      <img :src="row.dish.imageUrl" class="dish-img" />
                      <span class="dish-name">{{ row.dish.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="dish.price" label="单价" width="100">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.dish.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column label="小计" width="100">
                  <template #default="{ row }">
                    <span class="subtotal">¥{{ (row.dish.price * row.quantity).toFixed(2) }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-else class="no-items">
                <i class="fas fa-exclamation-circle"></i>
                暂无订单详情
              </div>
            </div>
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

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  

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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.orders-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  padding: 24px;
}

.orders-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  margin: -24px -24px 30px -24px;
  padding: 40px 24px;
  text-align: center;
}

.orders-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.orders-title i {
  font-size: 24px;
}

.orders-content {
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  padding-left: 36px;
  border-radius: 8px;
}

.sort-select {
  width: 180px;
}

.sort-select :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.empty-state {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  color: #ddd;
}

.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.order-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-cover-wrapper {
  position: relative;
  height: 200px;
}

.order-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-cover-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  gap: 8px;
}

.order-cover-placeholder i {
  font-size: 32px;
}

.order-status {
  position: absolute;
  top: 16px;
  right: 16px;
}

.order-content {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info {
  flex: 1;
}

.order-store {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-store i {
  color: #3498db;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-text i {
  color: #999;
  font-size: 12px;
}

.order-total {
  text-align: right;
}

.total-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
}

.order-items {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}

.dish-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.price, .subtotal {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.subtotal {
  color: #e74c3c;
  font-weight: 600;
}

.no-items {
  text-align: center;
  color: #999;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .orders-header {
    padding: 30px 16px;
  }

  .orders-title {
    font-size: 24px;
  }

  .toolbar {
    flex-direction: column;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .order-list {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 12px;
  }

  .order-total {
    text-align: left;
  }
}
</style>
