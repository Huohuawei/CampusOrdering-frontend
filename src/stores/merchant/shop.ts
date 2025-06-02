import { defineStore } from 'pinia'
import type { Merchant } from '@/types'
import {
  getMerchantInfo,
  updateMerchantInfo,
  deleteMerchant,
  getMerchants,
  createMerchant,
  updateMerchantStatus,
  getMerchantByUserId,
  getMerchantsByStatus,
  searchMerchantsByName,
  checkStoreNameExists
} from '../../api/merchant/shop'

export const useMerchantShopStore = defineStore('merchantShop', {
  state: () => ({
    merchants: [] as Merchant[],
    currentMerchant: null as Merchant | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    getMerchantById: (state) => (id: number) =>
      state.merchants.find(merchant => merchant.id === id),
    getMerchantsByStatus: (state) => (status: Merchant['status']) =>
      state.merchants.filter(merchant => merchant.status === status)
  },

  actions: {
    async fetchAllMerchants() {
      this.loading = true
      this.error = null
      try {
        this.merchants = await getMerchants()
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMerchantInfo(id: number) {
      this.loading = true
      this.error = null
      try {
        this.currentMerchant = await getMerchantInfo(id)
        return this.currentMerchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家信息失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createMerchant(data: Merchant) {
      this.loading = true
      this.error = null
      try {
        const newMerchant = await createMerchant(data)
        this.merchants.push(newMerchant)
        return newMerchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建商家失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateMerchantInfo(id: number, data: Merchant) {
      this.loading = true
      this.error = null
      try {
        const updatedMerchant = await updateMerchantInfo(id, data)
        const index = this.merchants.findIndex(m => m.id === id)
        if (index !== -1) {
          this.merchants[index] = updatedMerchant
        }
        if (this.currentMerchant?.id === id) {
          this.currentMerchant = updatedMerchant
        }
        return updatedMerchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新商家信息失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteMerchant(id: number) {
      this.loading = true
      this.error = null
      try {
        await deleteMerchant(id)
        this.merchants = this.merchants.filter(m => m.id !== id)
        if (this.currentMerchant?.id === id) {
          this.currentMerchant = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '删除商家失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateMerchantStatus(id: number, status: Merchant['status']) {
      this.loading = true
      this.error = null
      try {
        const updatedMerchant = await updateMerchantStatus(id, status)
        const index = this.merchants.findIndex(m => m.id === id)
        if (index !== -1) {
          this.merchants[index] = updatedMerchant
        }
        if (this.currentMerchant?.id === id) {
          this.currentMerchant = updatedMerchant
        }
        return updatedMerchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新商家状态失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMerchantByUserId(userId: number) {
      this.loading = true
      this.error = null
      try {
        const merchant = await getMerchantByUserId(userId)
        this.currentMerchant = merchant
        return merchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取用户关联商家失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMerchantsByStatus(status: Merchant['status']) {
      this.loading = true
      this.error = null
      try {
        this.merchants = await getMerchantsByStatus(status)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async searchMerchantsByName(storeName: string) {
      this.loading = true
      this.error = null
      try {
        this.merchants = await searchMerchantsByName(storeName)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '搜索商家失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async checkStoreNameExists(storeName: string) {
      this.loading = true
      this.error = null
      try {
        return await checkStoreNameExists(storeName)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '检查店铺名称失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async getCurrentMerchant() {
      this.loading = true
      this.error = null
      try {
        // 优先从 localStorage 获取模拟数据
        const storedMerchant = localStorage.getItem('merchant')
        if (storedMerchant) {
          this.currentMerchant = JSON.parse(storedMerchant)
          return this.currentMerchant
        }

        // 如果没有模拟数据，则从 API 获取
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.id) {
          const merchant = await getMerchantByUserId(user.id)
          this.currentMerchant = merchant
          return merchant
        }
        return null
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家信息失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateMerchant(data: Partial<Merchant>) {
      this.loading = true
      this.error = null
      try {
        if (!this.currentMerchant?.id) {
          throw new Error('当前商家ID不存在')
        }
        const merchantData = {
          ...this.currentMerchant,
          ...data
        } as Merchant
        const updatedMerchant = await updateMerchantInfo(this.currentMerchant.id, merchantData)
        if (this.currentMerchant?.id === updatedMerchant.id) {
          this.currentMerchant = updatedMerchant
        }
        return updatedMerchant
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新商家信息失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    setCurrentMerchant(merchant: Merchant | null) {
      this.currentMerchant = merchant
    },

    clearMerchants() {
      this.merchants = []
      this.currentMerchant = null
    }
  }
}) 