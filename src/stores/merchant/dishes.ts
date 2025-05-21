import { defineStore } from 'pinia'
import type { Dish } from '@/types'
import {
  getDishDetail,
  updateDish,
  deleteDish,
  getAllDishes,
  createDish,
  toggleDishAvailability,
  getMerchantDishes,
  getAvailableDishes
} from '@/api/merchant/menu'

export const useMerchantDishesStore = defineStore('merchantDishes', {
  state: () => ({
    dishes: [] as Dish[],
    loading: false,
    error: null as string | null,
    currentDish: null as Dish | null
  }),

  getters: {
    getDishById: (state) => (id: number) => state.dishes.find(dish => dish.id === id),
    availableDishes: (state) => state.dishes.filter(dish => dish.available),
    unavailableDishes: (state) => state.dishes.filter(dish => !dish.available)
  },

  actions: {
    async fetchAllDishes() {
      this.loading = true
      this.error = null
      try {
        this.dishes = await getAllDishes()
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取菜品列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchDishDetail(id: number) {
      this.loading = true
      this.error = null
      try {
        this.currentDish = await getDishDetail(id)
        return this.currentDish
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取菜品详情失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createDish(data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const newDish = await createDish(data)
        this.dishes.push(newDish)
        return newDish
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建菜品失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateDish(id: number, data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const updatedDish = await updateDish(id, data)
        const index = this.dishes.findIndex(dish => dish.id === id)
        if (index !== -1) {
          this.dishes[index] = updatedDish
        }
        if (this.currentDish?.id === id) {
          this.currentDish = updatedDish
        }
        return updatedDish
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新菜品失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteDish(id: number) {
      this.loading = true
      this.error = null
      try {
        await deleteDish(id)
        this.dishes = this.dishes.filter(dish => dish.id !== id)
        if (this.currentDish?.id === id) {
          this.currentDish = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '删除菜品失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async toggleAvailability(id: number) {
      this.loading = true
      this.error = null
      try {
        await toggleDishAvailability(id)
        const dish = this.dishes.find(d => d.id === id)
        if (dish) {
          dish.available = !dish.available
        }
        if (this.currentDish?.id === id) {
          this.currentDish.available = !this.currentDish.available
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '切换菜品可用状态失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMerchantDishes(merchantId: number) {
      this.loading = true
      this.error = null
      try {
        this.dishes = await getMerchantDishes(merchantId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家菜品列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableDishes(merchantId: number) {
      this.loading = true
      this.error = null
      try {
        this.dishes = await getAvailableDishes(merchantId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家可用菜品列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    setCurrentDish(dish: Dish | null) {
      this.currentDish = dish
    },

    clearDishes() {
      this.dishes = []
      this.currentDish = null
    }
  }
}) 