import { get, post, put, del } from '../request'
import type { Review } from '@/types'

// 获取所有评价
export function getAllReviews() {
  return get<Review[]>('/reviews')
}

// 获取评价详情
export function getReviewDetail(id: number) {
  return get<Review>(`/reviews/${id}`)
}

// 创建评价
export function createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
  return post<Review>('/reviews', data)
}

// 更新评价
export function updateReview(id: number, data: Partial<Review>) {
  return put<Review>(`/reviews/${id}`, data)
}

// 删除评价
export function deleteReview(id: number) {
  return del<void>(`/reviews/${id}`)
}

// 获取商家的评价列表
export function getMerchantReviews(merchantId: number) {
  return get<Review[]>(`/reviews/merchant/${merchantId}`)
}

// 获取用户的评价列表
export function getUserReviews(userId: number) {
  return get<Review[]>(`/reviews/user/${userId}`)
}

// 获取菜品的评价列表
export function getDishReviews(dishId: number) {
  return get<Review[]>(`/reviews/dish/${dishId}`)
}

// 检查是否已评价
export function checkReviewed(orderId: number) {
  return get<boolean>(`/reviews/check-reviewed?orderId=${orderId}`)
} 