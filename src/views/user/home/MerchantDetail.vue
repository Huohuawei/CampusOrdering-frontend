<template>
  <div class="merchant-detail" v-if="merchant">
    <!-- 商户卡片 -->
    <div class="merchant-header">
      <div class="merchant-card">
        <div class="merchant-img-wrapper">
          <img :src="merchant.coverImage || '/default-merchant.png'" @error="onImageError" alt="商户图片" class="merchant-img" />
        </div>
        <div class="merchant-info">
          <h2 class="merchant-name">{{ merchant.storeName }}</h2>
          <div class="merchant-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ merchant.storeAddress }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜品列表 -->
    <div class="content-section">
      <h3 class="section-title">
        <i class="fas fa-fire"></i>
        本店热销菜品
      </h3>
      <div class="dish-list">
        <div class="dish-card" v-for="dish in dishList" :key="dish.id">
          <div class="dish-img-wrapper">
            <img :src="dish.imageUrl || '/default-dish.png'" @error="onImageError" :alt="dish.name" class="dish-img" />
            <div class="dish-overlay">
              <span class="dish-price">¥{{ dish.price }}</span>
            </div>
          </div>
          <div class="dish-info">
            <h4 class="dish-name">{{ dish.name }}</h4>
            <p class="dish-description">{{ dish.description }}</p>
            <div class="cart-action">
              <div v-if="getDishQuantity(dish.id) === 0">
                <button class="add-btn" @click="addToCart(dish)">
                  <i class="fas fa-shopping-cart"></i>
                  加入购物车
                </button>
              </div>
              <div v-else class="count-controls">
                <button class="control-btn minus" @click="removeFromCart(dish.id)">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">{{ getDishQuantity(dish.id) }}</span>
                <button class="control-btn plus" @click="addToCart(dish)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
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

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  // 获取某个菜品的数量
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

})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.merchant-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
}

/* 商户头部 */
.merchant-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  padding: 40px 24px;
  margin-bottom: 40px;
}

.merchant-card {
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  gap: 30px;
  backdrop-filter: blur(10px);
}

.merchant-img-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.merchant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.merchant-img:hover {
  transform: scale(1.05);
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.merchant-name {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #666;
}

.merchant-item i {
  color: #3498db;
  font-size: 18px;
}

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  color: #e74c3c;
}

/* 菜品列表 */
.dish-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.dish-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.dish-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dish-img-wrapper {
  position: relative;
  height: 200px;
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
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
}

.dish-price {
  font-size: 20px;
  font-weight: 700;
}

.dish-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-name {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.dish-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 购物车操作 */
.cart-action {
  margin-top: 8px;
}

.add-btn {
  width: 100%;
  background: linear-gradient(135deg, #42b983, #369f6b);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.count-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: #f0f0f0;
  color: #2c3e50;
  font-size: 16px;
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
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 30px;
  text-align: center;
}

@media (max-width: 768px) {
  .merchant-header {
    padding: 24px 16px;
  }

  .merchant-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .merchant-img-wrapper {
    width: 160px;
    height: 160px;
  }

  .merchant-name {
    font-size: 24px;
  }

  .content-section {
    padding: 0 16px 24px;
  }

  .dish-list {
    grid-template-columns: 1fr;
  }
}
</style>


