<template>
  <div class="cart-page">
    <div class="cart-header">
      <h2 class="cart-title">
        <i class="fas fa-shopping-cart"></i>
        我的购物车
      </h2>
    </div>

    <div v-if="filteredGroupedItems && Object.keys(filteredGroupedItems).length === 0" class="empty-cart">
      <i class="fas fa-shopping-basket"></i>
      <p>购物车还是空的，快去挑选美食吧～</p>
    </div>

    <div v-else class="cart-content">
      <!-- 搜索 + 全选 -->
      <div class="cart-actions">
        <div class="search-wrapper">
          <i class="fas fa-search"></i>
          <el-input
            v-model="search"
            placeholder="搜索菜品..."
            size="large"
            class="search-input"
            clearable
          />
        </div>
        <el-checkbox
          v-model="selectAll"
          @change="toggleSelectAll"
          class="select-all"
        >
          全选
        </el-checkbox>
      </div>

      <!-- 每个商户分组 -->
      <div v-for="(group, merchantId) in filteredGroupedItems" :key="merchantId" class="merchant-group">
        <div class="merchant-header">
          <i class="fas fa-store"></i>
          <h3 class="merchant-name">{{ group[0].dish.merchant.storeName }}</h3>
        </div>
        <el-checkbox-group v-model="selectedIds">
          <div class="dish-grid">
            <div class="dish-card" v-for="item in group" :key="item.id">
              <div class="dish-img-wrapper">
                <img :src="item.dish.imageUrl" class="dish-img" />
                <div class="dish-overlay">
                  <span class="dish-price">¥{{ item.dish.price }}</span>
                </div>
              </div>
              <div class="dish-info">
                <h4 class="dish-name">{{ item.dish.name }}</h4>
                <div class="dish-meta">
                  <el-checkbox :value="item.id" class="card-checkbox" />
                  <div class="count-controls">
                    <button class="control-btn minus" @click="changeQuantity(item, item.quantity - 1)">
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button class="control-btn plus" @click="changeQuantity(item, item.quantity + 1)">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>

      <!-- 底部操作 -->
      <div class="cart-footer">
        <div class="total-info">
          <span class="total-label">已选总价：</span>
          <span class="total-price">¥{{ selectedTotal }}</span>
        </div>
        <el-button type="primary" size="large" class="checkout-btn" @click="submitOrder">
          <i class="fas fa-wallet"></i>
          去结算
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

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  

console.log("asfghisahashgiuads",userId)

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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.cart-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  padding: 24px;
}

.cart-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  margin: -24px -24px 30px -24px;
  padding: 40px 24px;
  text-align: center;
}

.cart-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.cart-title i {
  font-size: 24px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-cart i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-cart p {
  font-size: 16px;
  margin: 0;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 搜索 + 全选 */
.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

.select-all {
  margin-left: 20px;
}

/* 商户分组 */
.merchant-group {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.merchant-header i {
  color: #3498db;
  font-size: 20px;
}

.merchant-name {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* 菜品网格 */
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.dish-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.dish-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dish-img-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.dish-card:hover .dish-img {
  transform: scale(1.05);
}

.dish-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
}

.dish-price {
  font-size: 18px;
  font-weight: 600;
}

.dish-info {
  padding: 16px;
}

.dish-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.dish-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.control-btn.plus {
  background: #42b983;
  color: #fff;
}

.control-btn.plus:hover {
  background: #369f6b;
}

.quantity {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 24px;
  text-align: center;
}

/* 底部结算 */
.cart-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 16px;
  color: #666;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
}

.checkout-btn {
  background: linear-gradient(135deg, #42b983, #369f6b);
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

@media (max-width: 768px) {
  .cart-header {
    padding: 30px 16px;
  }

  .cart-title {
    font-size: 24px;
  }

  .cart-actions {
    flex-direction: column;
    gap: 16px;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .dish-grid {
    grid-template-columns: 1fr;
  }

  .cart-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
