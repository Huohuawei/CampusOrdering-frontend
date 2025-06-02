import { defineStore } from 'pinia'
import type { Review } from '@/types'
import {
  getAllReviews,
  getReviewDetail,
  createReview,
  updateReview,
  deleteReview,
  getMerchantReviews,
  getUserReviews,
  getDishReviews,
  checkReviewed
} from '@/api/merchant/reviews'

export const useMerchantReviewsStore = defineStore('merchantReviews', {
  state: () => ({
    reviews: [] as Review[],
    loading: false,
    error: null as string | null,
    currentReview: null as Review | null
  }),

  getters: {
    getReviewById: (state) => (id: number) => state.reviews.find(review => review.id === id),
    getReviewsByDish: (state) => (dishId: number) => 
      state.reviews.filter(review => review.dish.id === dishId),
    averageRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0)
      return sum / state.reviews.length
    }
  },

  actions: {
    async fetchAllReviews() {
      this.loading = true
      this.error = null
      try {
        this.reviews = await getAllReviews()
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取评价列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchReviewDetail(id: number) {
      this.loading = true
      this.error = null
      try {
        this.currentReview = await getReviewDetail(id)
        return this.currentReview
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取评价详情失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createReview(data: Omit<Review, 'id' | 'createdAt'>) {
      this.loading = true
      this.error = null
      try {
        const newReview = await createReview(data)
        this.reviews.push(newReview)
        return newReview
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建评价失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateReview(id: number, data: Partial<Review>) {
      this.loading = true
      this.error = null
      try {
        const updatedReview = await updateReview(id, data)
        const index = this.reviews.findIndex(review => review.id === id)
        if (index !== -1) {
          this.reviews[index] = updatedReview
        }
        if (this.currentReview?.id === id) {
          this.currentReview = updatedReview
        }
        return updatedReview
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新评价失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteReview(id: number) {
      this.loading = true
      this.error = null
      try {
        await deleteReview(id)
        this.reviews = this.reviews.filter(review => review.id !== id)
        if (this.currentReview?.id === id) {
          this.currentReview = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '删除评价失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMerchantReviews(merchantId: number) {
      this.loading = true
      this.error = null
      try {
        this.reviews = await getMerchantReviews(merchantId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家评价列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUserReviews(userId: number) {
      this.loading = true
      this.error = null
      try {
        this.reviews = await getUserReviews(userId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取用户评价列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchDishReviews(dishId: number) {
      this.loading = true
      this.error = null
      try {
        this.reviews = await getDishReviews(dishId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取菜品评价列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async checkReviewed(orderId: number, dishId: number) {
      this.loading = true
      this.error = null
      try {
        return await checkReviewed(orderId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '检查评价状态失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    setCurrentReview(review: Review | null) {
      this.currentReview = review
    },

    clearReviews() {
      this.reviews = []
      this.currentReview = null
    }
  }
}) 