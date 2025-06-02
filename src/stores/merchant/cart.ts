import { defineStore } from 'pinia'
import type { Cart, CartItem } from '@/types'
import {
  getCartByUserId,
  getCartItems,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart
} from '../../api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null as Cart | null,
    items: [] as CartItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    getItemById: (state) => (id: number) => state.items.find(item => item.id === id)
  },

  actions: {
    async fetchCart(userId: number) {
      this.loading = true
      this.error = null
      try {
        this.cart = await getCartByUserId(userId)
        if (this.cart) {
          this.items = await getCartItems(this.cart.id)
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取购物车失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addItem(userId: number, dishId: number, quantity: number = 1) {
      this.loading = true
      this.error = null
      try {
        const newItem = await addItemToCart(userId, dishId, quantity)
        this.items.push(newItem)
        return newItem
      } catch (err) {
        this.error = err instanceof Error ? err.message : '添加商品失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateQuantity(itemId: number, quantity: number) {
      this.loading = true
      this.error = null
      try {
        const updatedItem = await updateCartItemQuantity(itemId, quantity)
        const index = this.items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.items[index] = updatedItem
        }
        return updatedItem
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新商品数量失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeItem(itemId: number) {
      this.loading = true
      this.error = null
      try {
        await removeItemFromCart(itemId)
        this.items = this.items.filter(item => item.id !== itemId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '删除商品失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async clearCart(userId: number) {
      this.loading = true
      this.error = null
      try {
        await clearCart(userId)
        this.items = []
      } catch (err) {
        this.error = err instanceof Error ? err.message : '清空购物车失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    resetCart() {
      this.cart = null
      this.items = []
    }
  }
}) 
