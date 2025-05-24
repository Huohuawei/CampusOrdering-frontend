<template>
  <div class="api-tester">
    <h2>API测试页面</h2>
    <div class="api-tester__select">
      <label>选择API：</label>
      <select v-model="selectedApiName">
        <option v-for="api in apiList" :key="api.name" :value="api.name">
          {{ api.name }}
        </option>
      </select>
    </div>
    <div v-if="selectedApi">
      <div class="api-tester__params">
        <div v-for="param in selectedApi.params" :key="param.name" class="api-tester__param">
          <label>{{ param.name }}：</label>
          <input v-model="paramValues[param.name]" :placeholder="param.type" />
        </div>
      </div>
      <button @click="callApi" :disabled="loading">发送请求</button>
    </div>
    <div class="api-tester__result">
      <h3>返回结果：</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as ordersApi from '@/api/orders'
import * as dishesApi from '@/api/dishes'
import * as cartApi from '@/api/cart'
import * as merchantApi from '@/api/merchant'
import * as orderItemsApi from '@/api/order-items'
import { ref, computed, watch } from 'vue'

// 手动维护API参数列表（如需自动化可用ts-morph等工具，但此处手动）
const apiList = [
  // ordersApi
  { name: 'getOrderById', func: ordersApi.getOrderById, params: [{ name: 'id', type: 'number' }] },
  { name: 'getOrdersByStatus', func: ordersApi.getOrdersByStatus, params: [{ name: 'status', type: 'Order[\'status\']' }] },
  { name: 'getOrdersByMerchantId', func: ordersApi.getOrdersByMerchantId, params: [{ name: 'merchantId', type: 'number' }] },
  { name: 'getOrdersByUserId', func: ordersApi.getOrdersByUserId, params: [{ name: 'userId', type: 'number' }] },
  { name: 'createOrder', func: ordersApi.createOrder, params: [{ name: 'userId', type: 'number' }] },
  { name: 'updateOrderStatus', func: ordersApi.updateOrderStatus, params: [{ name: 'orderId', type: 'number' }, { name: 'status', type: 'Order[\'status\']' }] },
  { name: 'cancelOrder', func: ordersApi.cancelOrder, params: [{ name: 'orderId', type: 'number' }] },
  // orderItemsApi
  { name: 'getOrderItemsByOrderId', func: orderItemsApi.getOrderItemsByOrderId, params: [{ name: 'orderId', type: 'number' }] },
  { name: 'addOrderItem', func: orderItemsApi.addOrderItem, params: [{ name: 'orderId', type: 'number' }, { name: 'dishId', type: 'number' }, { name: 'quantity', type: 'number' }] },
  // dishesApi
  { name: 'getDishDetail', func: dishesApi.getDishDetail, params: [{ name: 'id', type: 'number' }] },
  { name: 'updateDish', func: dishesApi.updateDish, params: [{ name: 'id', type: 'number' }, { name: 'data', type: 'UpdateDishDTO (JSON)' }] },
  { name: 'deleteDish', func: dishesApi.deleteDish, params: [{ name: 'id', type: 'number' }] },
  { name: 'getAllDishes', func: dishesApi.getAllDishes, params: [] },
  { name: 'createDish', func: dishesApi.createDish, params: [{ name: 'data', type: 'CreateDishDTO (JSON)' }] },
  { name: 'toggleDishAvailability', func: dishesApi.toggleDishAvailability, params: [{ name: 'id', type: 'number' }] },
  { name: 'getMerchantDishes', func: dishesApi.getMerchantDishes, params: [{ name: 'merchantId', type: 'number' }] },
  { name: 'getAvailableDishes', func: dishesApi.getAvailableDishes, params: [{ name: 'merchantId', type: 'number' }] },
  // cartApi
  { name: 'getCartByUserId', func: cartApi.getCartByUserId, params: [{ name: 'userId', type: 'number' }] },
  { name: 'getCartItems', func: cartApi.getCartItems, params: [{ name: 'cartId', type: 'number' }] },
  { name: 'addItemToCart', func: cartApi.addItemToCart, params: [{ name: 'userId', type: 'number' }, { name: 'dishId', type: 'number' }, { name: 'quantity', type: 'number (可选, 默认1)' }] },
  { name: 'updateCartItemQuantity', func: cartApi.updateCartItemQuantity, params: [{ name: 'cartItemId', type: 'number' }, { name: 'quantity', type: 'number' }] },
  { name: 'removeItemFromCart', func: cartApi.removeItemFromCart, params: [{ name: 'cartItemId', type: 'number' }] },
  { name: 'clearCart', func: cartApi.clearCart, params: [{ name: 'userId', type: 'number' }] },
  // merchantApi（包含shop和reviews）
  { name: 'getMerchantInfo', func: merchantApi.getMerchantInfo, params: [{ name: 'id', type: 'number' }] },
  { name: 'updateMerchantInfo', func: merchantApi.updateMerchantInfo, params: [{ name: 'id', type: 'number' }, { name: 'data', type: 'Merchant (JSON)' }] },
  { name: 'deleteMerchant', func: merchantApi.deleteMerchant, params: [{ name: 'id', type: 'number' }] },
  { name: 'getMerchants', func: merchantApi.getMerchants, params: [] },
  { name: 'createMerchant', func: merchantApi.createMerchant, params: [{ name: 'data', type: 'Merchant (JSON)' }] },
  { name: 'updateMerchantStatus', func: merchantApi.updateMerchantStatus, params: [{ name: 'id', type: 'number' }, { name: 'status', type: 'Merchant[\'status\']' }] },
  { name: 'getMerchantByUserId', func: merchantApi.getMerchantByUserId, params: [{ name: 'userId', type: 'number' }] },
  { name: 'getMerchantsByStatus', func: merchantApi.getMerchantsByStatus, params: [{ name: 'status', type: 'Merchant[\'status\']' }] },
  { name: 'searchMerchantsByName', func: merchantApi.searchMerchantsByName, params: [{ name: 'storeName', type: 'string' }] },
  { name: 'checkStoreNameExists', func: merchantApi.checkStoreNameExists, params: [{ name: 'storeName', type: 'string' }] },
  { name: 'getAllReviews', func: merchantApi.getAllReviews, params: [] },
  { name: 'getReviewDetail', func: merchantApi.getReviewDetail, params: [{ name: 'id', type: 'number' }] },
  { name: 'createReview', func: merchantApi.createReview, params: [{ name: 'data', type: 'Review (JSON, 无id/createdAt/updatedAt)' }] },
  { name: 'updateReview', func: merchantApi.updateReview, params: [{ name: 'id', type: 'number' }, { name: 'data', type: 'Partial<Review> (JSON)' }] },
  { name: 'deleteReview', func: merchantApi.deleteReview, params: [{ name: 'id', type: 'number' }] },
  { name: 'getMerchantReviews', func: merchantApi.getMerchantReviews, params: [{ name: 'merchantId', type: 'number' }] },
  { name: 'getUserReviews', func: merchantApi.getUserReviews, params: [{ name: 'userId', type: 'number' }] },
  { name: 'getDishReviews', func: merchantApi.getDishReviews, params: [{ name: 'dishId', type: 'number' }] },
  { name: 'checkReviewed', func: merchantApi.checkReviewed, params: [{ name: 'orderId', type: 'number' }] },
]

const selectedApiName = ref(apiList[0].name)
const selectedApi = computed(() => apiList.find(api => api.name === selectedApiName.value))
const paramValues = ref<Record<string, any>>({})
const result = ref('')
const loading = ref(false)

watch(selectedApiName, () => {
  paramValues.value = {}
  result.value = ''
})

async function callApi() {
  if (!selectedApi.value) return
  loading.value = true
  result.value = ''
  try {
    // 参数处理：支持JSON输入
    const args = selectedApi.value.params.map(param => {
      const val = paramValues.value[param.name]
      if (param.type.includes('JSON')) {
        try {
          return val ? JSON.parse(val) : undefined
        } catch (e) {
          throw new Error(`${param.name} 请输入合法JSON`)
        }
      }
      if (param.type.includes('number')) return val ? Number(val) : undefined
      return val
    })
    const res = await selectedApi.value.func(...args)
    result.value = JSON.stringify(res, null, 2)
  } catch (e: any) {
    result.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-tester {
  max-width: 700px;
  margin: 40px auto;
  padding: 32px;
  background: #f8f8ff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}
.api-tester__select {
  margin-bottom: 20px;
}
.api-tester__params {
  margin-bottom: 16px;
}
.api-tester__param {
  margin-bottom: 8px;
}
.api-tester__result {
  margin-top: 24px;
  background: #222;
  color: #fff;
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  min-height: 80px;
  white-space: pre-wrap;
}
button {
  padding: 6px 18px;
  border-radius: 6px;
  border: none;
  background: #4f8cff;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
button:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style> 