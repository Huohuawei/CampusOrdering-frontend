<template>
  <div class="order-confirm">
    <el-card shadow="hover" class="confirm-card">
      <h2 class="confirm-title">🧾 确认订单</h2>

      <el-table :data="items" style="width: 100%" border>
        <el-table-column prop="dish.name" label="菜品" />
        <el-table-column prop="dish.price" label="单价" />
        <el-table-column prop="quantity" label="数量" />
      </el-table>

      <div class="total-area">
        <p class="total">总计：¥{{ total }}</p>
        <el-button type="primary" size="large" class="submit-btn" @click="confirmOrder">
          确认下单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder, addOrderItem } from '../../../api/order'

const router = useRouter()
const items = ref([])      // 存储确认页展示的菜品项
const total = ref(0)       // 总价
const userId = 1           // 当前用户 ID，可改为动态获取

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
.order-confirm {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
  background-color: #f9fafb;
  min-height: 100vh;
}
.confirm-card {
  width: 100%;
  max-width: 800px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.confirm-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}
.total-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  flex-wrap: wrap;
}
.total {
  font-size: 20px;
  font-weight: bold;
  color: #dc2626;
}
.submit-btn {
  font-size: 16px;
  padding: 10px 28px;
  font-weight: 500;
}
</style>
