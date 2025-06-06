import axios from 'axios'

// 加入购物车
export const addCartItem = async (userId: number, dishId: number, quantity: number) => {
  const params = new URLSearchParams()
  params.append('dishId', dishId.toString())
  params.append('quantity', quantity.toString())

  const response = await axios.post(`/api/carts/${userId}/items`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return response.data
}

// 更新购物车数量
export const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
  const response = await axios.put(`/api/carts/items/${cartItemId}?quantity=${quantity}`)
  return response.data
}

// 删除购物车项
export const removeCartItem = async (cartItemId: number) => {
  const response = await axios.delete(`/api/carts/items/${cartItemId}`)
  return response.data
}

// 根据用户ID拉取购物车（拿cartId）
export const getCartByUserId = async (userId: number) => {
  const response = await axios.get(`/api/carts/user/${userId}`)
  return response.data
}

// ✅ 新增：根据cartId拉取购物车里的菜品(cartItems)
export const getCartItems = async (cartId: number) => {
  const response = await axios.get(`/api/carts/${cartId}/items`)
  return response.data
}
