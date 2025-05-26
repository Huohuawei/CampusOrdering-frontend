import axios from 'axios'

// 获取当前用户的所有订单
export const getOrdersByUserId = async (userId: number) => {
  const response = await axios.get(`/api/orders/user/${userId}`)
  return response.data // ✅ 保持统一，只返回 data
}

// ✅ 新增：根据订单 ID 获取订单项详情
export const getOrderItemsByOrderId = async (orderId: number) => {
  const response = await axios.get(`/api/order-items/by-order/${orderId}`)

  // ✅ 防止返回的是错误信息字符串
  if (!Array.isArray(response.data)) {
    throw new Error(`后端返回了错误信息：${response.data}`)
  }

  return response.data
}
export const createOrder = async (userId: number) => {
  const response = await axios.post(`/api/orders/user/${userId}`, {}) // 加这个 {} 是关键
  return response.data
}

// 添加订单项
export const addOrderItem = async (orderId: number, dishId: number, quantity: number) => {
  const response = await axios.post('/api/order-items/add', null, {
    params: {
      orderId,
      dishId,
      quantity
    }
  })
  return response.data
}
