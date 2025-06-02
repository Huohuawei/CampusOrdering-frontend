import { get, post } from './request'
import type { OrderItem } from '@/types'

// 根据订单ID获取订单项
export function getOrderItemsByOrderId(orderId: number) {
  return get<OrderItem[]>(`/api/order-items/by-order/${orderId}`)
}

// 添加订单项
export function addOrderItem(orderId: number, dishId: number, quantity: number) {
  return post<OrderItem>(`/api/order-items/add?orderId=${orderId}&dishId=${dishId}&quantity=${quantity}`)
} 