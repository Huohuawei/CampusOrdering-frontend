<template>
  <div class="merchant-detail" v-if="merchant">
    <!-- 商户卡片 -->
    <div class="merchant-card">
      <img :src="merchant.coverImage || '/default-merchant.png'" @error="onImageError" alt="商户图片" class="merchant-img" />
      <div class="merchant-info">
        <h2 class="merchant-name">{{ merchant.storeName }}</h2>
        <div class="merchant-item"><i>📍</i> {{ merchant.storeAddress }}</div>
      </div>
    </div>

    <!-- 菜品列表 -->
    <h3 class="section-title">本店热销菜品</h3>
    <div class="dish-list">
      <div class="dish-card" v-for="dish in dishList" :key="dish.id">
        <img :src="dish.imageUrl || '/default-dish.png'" @error="onImageError" :alt="dish.name" class="dish-img" />
        <div class="dish-info">
          <h4 class="dish-name">{{ dish.name }}</h4>
          <p class="dish-description">{{ dish.description }}</p>
          <p class="dish-price">¥{{ dish.price }}</p>
          <div class="cart-action">
            <div v-if="getDishQuantity(dish.id) === 0">
              <button class="add-btn" @click="addToCart(dish)">🛒 加入购物车</button>
            </div>
            <div v-else class="count-controls">
              <button @click="removeFromCart(dish.id)">－</button>
              <span>{{ getDishQuantity(dish.id) }}</span>
              <button @click="addToCart(dish)">＋</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { getMerchantById } from '../../../api/merchant'
import { getDishesByMerchantId } from '../../../api/dish'
import { addCartItem, removeCartItem, updateCartItemQuantity, getCartByUserId, getCartItems } from '../../../api/cart'

const route = useRoute()
const merchant = ref(null)
const dishList = ref([])
const cartMap = ref({})

const userId = 1 // 测试阶段写死，正式要动态获取登录用户ID

// 获取某个菜品的数量
const getDishQuantity = (dishId) => {
  return cartMap.value[dishId]?.quantity || 0
}

// 加入购物车
const addToCart = async (dish) => {
  try {
    const quantity = getDishQuantity(dish.id)
    if (quantity > 0) {
      const cartItemId = cartMap.value[dish.id].cartItemId
      const newQuantity = quantity + 1
      await updateCartItemQuantity(cartItemId, newQuantity)
      cartMap.value[dish.id].quantity = newQuantity
    } else {
      const res = await addCartItem(userId, dish.id, 1)
      cartMap.value[dish.id] = {
        cartItemId: res.id,
        quantity: res.quantity
      }
    }
  } catch (error) {
    console.error('加入购物车失败', error)
  }
}

// 移除购物车
const removeFromCart = async (dishId) => {
  try {
    const quantity = getDishQuantity(dishId)
    if (quantity <= 0) return

    const cartItemId = cartMap.value[dishId].cartItemId
    const newQuantity = quantity - 1

    if (newQuantity > 0) {
      await updateCartItemQuantity(cartItemId, newQuantity)
      cartMap.value[dishId].quantity = newQuantity
    } else {
      await removeCartItem(cartItemId)
      delete cartMap.value[dishId]
    }
  } catch (error) {
    console.error('删除购物车失败', error)
  }
}

// 图片加载失败兜底
const onImageError = (e) => {
  e.target.src = '/default-placeholder.png'
}

// 页面加载
onMounted(async () => {
  const id = parseInt(route.params.id)
  merchant.value = await getMerchantById(id)
  dishList.value = await getDishesByMerchantId(id)

  // ✅ 核心改动：加载cartId + cartItems
  const cartData = await getCartByUserId(userId)
  if (cartData && cartData.id) {
    const cartId = cartData.id
    const cartItems = await getCartItems(cartId) 

    if (Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        const dishId = item.dish.id
        cartMap.value[dishId] = {
          cartItemId: item.id,
          quantity: item.quantity
        }
      })
    }
  }

  console.log('✅ dishList:', dishList.value)
  console.log('✅ cartMap 初始化:', cartMap.value)
})
</script>

<style scoped>
.merchant-detail {
  padding: 24px;
  font-family: 'Poppins', sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 商户卡片 */
.merchant-card {
  background: #fff;
  display: flex;
  align-items: center;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding: 20px 30px;
  max-width: 1000px;
  margin: 0 auto 40px;
  gap: 30px;
}

.merchant-img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.merchant-name {
  font-size: 26px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #666;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
  text-align: center;
}

/* 菜品列表 */
.dish-list {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.dish-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  padding: 16px;
  align-items: center;
  transition: transform 0.2s;
}

.dish-card:hover {
  transform: translateY(-4px);
}

.dish-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.dish-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #222;
  text-align: center;
}

.dish-description {
  font-size: 14px;
  color: #777;
  text-align: center;
  margin: 0;
}

.dish-price {
  font-size: 18px;
  font-weight: bold;
  color: #e94d3b;
  margin-top: 4px;
}

/* 加减购物车区 */
.cart-action {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.add-btn {
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #369f6b;
}

.count-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-controls button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.count-controls button:hover {
  background-color: #ddd;
}

.count-controls .add {
  background-color: #42b983;
  color: #fff;
}

.count-controls .add:hover {
  background-color: #369f6b;
}

.count-controls span {
  font-size: 18px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}
</style>


