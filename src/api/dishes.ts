import { get, put, post, del, patch } from './request'
import type { Dish } from '@/types'

type CreateDishDTO = Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>
type UpdateDishDTO = Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>

// 获取菜品详情
export function getDishDetail(id: number) {
  return get<Dish>(`/api/dishes/${id}`)
}

// 更新菜品信息
export function updateDish(id: number, data: UpdateDishDTO) {
  return put<Dish>(`/api/dishes/${id}`, data)
}

// 删除菜品
export function deleteDish(id: number) {
  return del<void>(`/api/dishes/${id}`)
}

// 获取所有菜品
export function getAllDishes() {
  return get<Dish[]>('/api/dishes')
}

// 创建菜品
export function createDish(data: CreateDishDTO) {
  return post<Dish>('/api/dishes', data)
}

// 切换菜品可用状态
export function toggleDishAvailability(id: number) {
  return patch<void>(`/api/dishes/${id}/toggle-availability`)
}

// 获取商家的所有菜品
export function getMerchantDishes(merchantId: number) {
  return get<Dish[]>(`/api/dishes/merchant/${merchantId}`)
}

// 获取商家的可用菜品
export function getAvailableDishes(merchantId: number) {
  return get<Dish[]>(`/api/dishes/merchant/${merchantId}/available`)
} 