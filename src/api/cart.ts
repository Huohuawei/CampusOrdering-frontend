import { get, post, put, del } from './request'
import type { Cart, CartItem } from '@/types'

// 获取用户购物车
export function getCartByUserId(userId: number) {
  return get<Cart>(`/api/carts/user/${userId}`)
}

// 获取购物车商品列表
export function getCartItems(cartId: number) {
  return get<CartItem[]>(`/api/carts/${cartId}/items`)
}

// 添加商品到购物车
export function addItemToCart(userId: number, dishId: number, quantity: number = 1) {
  return post<CartItem>(`/api/carts/${userId}/items?dishId=${dishId}&quantity=${quantity}`)
}

// 更新购物车商品数量
export function updateCartItemQuantity(cartItemId: number, quantity: number) {
  return put<CartItem>(`/api/carts/items/${cartItemId}?quantity=${quantity}`)
}

// 从购物车移除商品
export function removeItemFromCart(cartItemId: number) {
  return del<void>(`/api/carts/items/${cartItemId}`)
}

// 清空购物车
export function clearCart(userId: number) {
  return del<void>(`/api/carts/user/${userId}/clear`)
} 