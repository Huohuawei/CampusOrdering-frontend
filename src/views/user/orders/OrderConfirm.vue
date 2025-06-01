<template>
  <div class="order-confirm">
    <div class="confirm-header">
      <h2 class="confirm-title">
        <i class="fas fa-clipboard-check"></i>
        确认订单
      </h2>
    </div>

    <div class="confirm-content">
      <el-card shadow="hover" class="confirm-card">
        <div class="order-info">
          <div class="info-header">
            <i class="fas fa-store"></i>
            <span class="merchant-name">{{ items[0]?.dish.merchant.storeName }}</span>
          </div>

          <el-table 
            :data="items" 
            style="width: 100%" 
            :header-cell-style="{ background: '#f8f9fa', color: '#2c3e50' }"
            :cell-style="{ padding: '16px' }"
          >
            <el-table-column label="菜品" min-width="200">
              <template #default="{ row }">
                <div class="dish-info">
                  <img :src="row.dish.imageUrl" class="dish-img" />
                  <span class="dish-name">{{ row.dish.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="dish.price" label="单价" width="120">
              <template #default="{ row }">
                <span class="price">¥{{ row.dish.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="120">
              <template #default="{ row }">
                <span class="quantity">{{ row.quantity }}</span>
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                <span class="subtotal">¥{{ (row.dish.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="total-area">
            <div class="total-info">
              <span class="total-label">总计：</span>
              <span class="total-price">¥{{ total.toFixed(2) }}</span>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              class="submit-btn" 
              @click="confirmOrder"
            >
              <i class="fas fa-check-circle"></i>
              确认下单
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder, addOrderItem } from '../../../api/order'

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  


const router = useRouter()
const items = ref([])      // 存储确认页展示的菜品项
const total = ref(0)       // 总价



// 加载 draftOrder 草稿数据（只包含用户选中的菜品）
onMounted(() => {
  const saved = sessionStorage.getItem('draftOrder')

  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      // ✅ 合并重复菜品
      const mergedMap = new Map()
      for (const item of parsed.items || []) {
        const dish = item?.dish
        if (!dish) continue
        const id = dish.id
        if (!mergedMap.has(id)) {
          mergedMap.set(id, {
            dish: {
              ...dish,
              price: Number(dish.price || 0)
            },
            quantity: Number(item.quantity || 0)
          })
        } else {
          mergedMap.get(id).quantity += Number(item.quantity || 0)
        }
      }
      items.value = Array.from(mergedMap.values())

      // ✅ 计算总价
      total.value = items.value.reduce((sum, item) => {
        return sum + item.dish.price * item.quantity
      }, 0)

      console.log('✅ 加载草稿订单成功（已去重）:', items.value)
    } catch (err) {
      console.error('❌ 草稿订单解析失败:', err)
      ElMessage.error('订单数据格式错误，返回购物车')
      router.push('/user/cart')
    }
  } else {
    ElMessage.error('订单信息缺失，返回购物车')
    router.push('/user/cart')
  }
})

// 提交订单
const confirmOrder = async () => {
  console.log('💥 confirmOrder 触发了')
  try {

    const order = await createOrder(userId)
    const orderId = order.id

    for (const item of items.value) {
      await addOrderItem(orderId, item.dish.id, item.quantity)
    }

    await fetch(`/api/orders/${orderId}/status/CONFIRMED`, { method: 'PATCH' })

    sessionStorage.removeItem('draftOrder')

    ElMessage.success('下单成功！')
    router.push('/user/orders')
  } catch (err) {
    console.error('❌ 下单失败:', err)
    ElMessage.error('提交失败，请稍后重试')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.order-confirm {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  padding: 24px;
}

.confirm-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  margin: -24px -24px 30px -24px;
  padding: 40px 24px;
  text-align: center;
}

.confirm-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.confirm-title i {
  font-size: 24px;
}

.confirm-content {
  max-width: 1000px;
  margin: 0 auto;
}

.confirm-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.order-info {
  padding: 24px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.info-header i {
  color: #3498db;
  font-size: 20px;
}

.merchant-name {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dish-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.dish-name {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.price, .quantity, .subtotal {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.subtotal {
  color: #e74c3c;
  font-weight: 600;
}

.total-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 18px;
  color: #666;
}

.total-price {
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
}

.submit-btn {
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

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

@media (max-width: 768px) {
  .confirm-header {
    padding: 30px 16px;
  }

  .confirm-title {
    font-size: 24px;
  }

  .order-info {
    padding: 16px;
  }

  .total-area {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
