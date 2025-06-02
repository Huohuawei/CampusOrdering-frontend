import { get, post, patch } from './request'
import type { Order } from '@/types'

// 获取订单详情
export function getOrderById(id: number) {
  return get<Order>(`/api/orders/${id}`)
}

// 根据状态获取订单列表
export function getOrdersByStatus(status: Order['status']) {
  return get<Order[]>(`/api/orders/status/${status}`)
}

// 获取商家的订单列表
export function getOrdersByMerchantId(merchantId: number) {
  return get<Order[]>(`/api/orders/merchant/${merchantId}`)
}

// 获取用户的订单列表
export function getOrdersByUserId(userId: number) {
  return get<Order[]>(`/api/orders/user/${userId}`)
}

// 创建订单
export function createOrder(userId: number) {
  return post<Order>(`/api/orders/user/${userId}`)
}

// 更新订单状态
export function updateOrderStatus(orderId: number, status: Order['status']) {
  return patch<Order>(`/api/orders/${orderId}/status/${status}`)
}

// 取消订单
export function cancelOrder(orderId: number) {
  return patch<void>(`/api/orders/${orderId}/cancel`)
} 