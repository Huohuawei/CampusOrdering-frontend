<template>
  <div class="cart-page">
    <h2 style="text-align: center; margin-bottom: 24px;">🛒 我的购物车</h2>

    <div v-if="filteredGroupedItems && Object.keys(filteredGroupedItems).length === 0" class="empty">
      没有找到符合的菜品，请重新搜索～
    </div>

    <div v-else class="cart-list">
      <!-- 搜索 + 全选 -->
      <div class="cart-actions">
        <el-input
          v-model="search"
          placeholder="搜索菜品..."
          size="large"
          class="search-input"
          clearable
        />
        <el-checkbox
          v-model="selectAll"
          @change="toggleSelectAll"
          class="round-checkbox"
        >
          全选
        </el-checkbox>
      </div>

      <!-- 每个商户分组 -->
      <div v-for="(group, merchantId) in filteredGroupedItems" :key="merchantId" class="merchant-group">
        <h3 class="merchant-name">🏬 {{ group[0].dish.merchant.storeName }}</h3>
        <el-checkbox-group v-model="selectedIds">
          <div class="dish-grid">
            <div class="dish-card" v-for="item in group" :key="item.id">
              <img :src="item.dish.imageUrl" class="dish-img" />
              <h4 class="dish-name">{{ item.dish.name }}</h4>
              <div class="dish-meta">
                <el-checkbox :value="item.id" class="card-checkbox" />
                <span class="dish-price">¥{{ item.dish.price }}</span>
              </div>
              <div class="count-controls">
                <button @click="changeQuantity(item, item.quantity - 1)">－</button>
                <span>{{ item.quantity }}</span>
                <button @click="changeQuantity(item, item.quantity + 1)">＋</button>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>

      <!-- 底部操作 -->
      <div class="cart-footer">
        <p class="total">已选总价：¥{{ selectedTotal }}</p>
        <el-button type="primary" size="large" round @click="submitOrder">
          💰 选择结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { getCartByUserId, getCartItems, updateCartItemQuantity, removeCartItem } from '../../../api/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
<<<<<<< Updated upstream
const userId = 1
=======

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  

>>>>>>> Stashed changes
const cartItems = ref([])
const selectedIds = ref([])
const selectAll = ref(false)
const search = ref('')

// 获取数据
onMounted(async () => {
  const cart = await getCartByUserId(userId)
  if (cart && cart.id) {
    const items = await getCartItems(cart.id)
    cartItems.value = items || []
  }
})

// 商户分组
const groupedItems = computed(() => {
  const map = {}
  for (const item of cartItems.value) {
    const merchantId = item.dish.merchant.id
    if (!map[merchantId]) map[merchantId] = []
    map[merchantId].push(item)
  }
  return map
})

// 搜索过滤
const filteredGroupedItems = computed(() => {
  if (!search.value.trim()) return groupedItems.value
  const map = {}
  for (const [merchantId, items] of Object.entries(groupedItems.value)) {
    const filtered = items.filter(item =>
      item.dish.name.includes(search.value.trim())
    )
    if (filtered.length > 0) map[merchantId] = filtered
  }
  return map
})

// 数量变更
const changeQuantity = async (item, quantity) => {
  if (quantity <= 0) {
    await removeCartItem(item.id)
    cartItems.value = cartItems.value.filter(i => i.id !== item.id)
    selectedIds.value = selectedIds.value.filter(id => id !== item.id)
  } else {
    await updateCartItemQuantity(item.id, quantity)
    item.quantity = quantity
  }
}

// 总价计算
const selectedTotal = computed(() => {
  return cartItems.value
    .filter(item => selectedIds.value.includes(item.id))
    .reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
})

// 全选功能
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = cartItems.value.map(item => item.id)
  } else {
    selectedIds.value = []
  }
}

// 提交订单
const submitOrder = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一项进行结算')
    return
  }

  const selectedItems = cartItems.value.filter(item => selectedIds.value.includes(item.id))

  // ✅ 备份整个购物车数据
  sessionStorage.setItem('draftCart', JSON.stringify(cartItems.value))

  // ✅ 仅提交选中的部分
  sessionStorage.setItem('draftOrder', JSON.stringify({
    items: selectedItems,
    total: selectedTotal.value
  }))

  // ✅ 跳转到确认订单页面
  router.push('/user/order/confirm')
}


</script>

<style scoped>
.cart-page {
  padding: 24px;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 搜索 + 全选 */
/* 搜索框 + 全选框 */
.cart-actions {
  display: flex;
  justify-content: center;         /* 水平居中对齐 */
  align-items: center;             /* 垂直居中对齐 */
  gap: 120px;                      /* ✅ 增大搜索框与全选框的间距 */
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  width: 300px;
}

.round-checkbox {
  transform: scale(2.0);
  display: flex;
  align-items: center;
}

::v-deep(.round-checkbox .el-checkbox__label) {
  font-size: 8px;
  margin-left: 2px;
}

/* 商户分组 */
.cart-list {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.merchant-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.merchant-name {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  border-left: 4px solid #42b983;
  padding-left: 10px;
}

/* 卡片网格布局 */
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
@media (min-width: 1200px) {
  .dish-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dish-card {
  aspect-ratio: 4 / 5;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 16px;
  justify-content: space-between;
}

/* 菜品图 */
.dish-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

/* 菜名 */
.dish-name {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 8px 0;
  color: #222;
}

/* 价格 + 复选框 */
.dish-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-top: 4px;
}

.card-checkbox {
  transform: scale(1.3);
}

.dish-price {
  font-size: 16px;
  color: #e94d3b;
}

/* 数量按钮 */
.count-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.count-controls button {
  background-color: #42b983;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.count-controls button:hover {
  background-color: #369f6b;
}

.count-controls span {
  font-size: 16px;
  min-width: 28px;
  text-align: center;
}

/* 底部 */
.cart-footer {
  text-align: right;
  margin-top: 32px;
}

.total {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #222;
}

.empty {
  text-align: center;
  font-size: 16px;
  color: #888;
  margin-top: 80px;
}
</style>
