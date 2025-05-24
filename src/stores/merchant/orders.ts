import { defineStore } from 'pinia'
import type { Order } from '@/types'
import {
  getOrderById,
  getOrdersByStatus,
  getOrdersByMerchantId,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '@/api/orders'

export const useMerchantOrdersStore = defineStore('merchantOrders', {
  state: () => ({
    orders: [] as Order[],
    loading: false,
    error: null as string | null,
    currentOrder: null as Order | null
  }),

  getters: {
    getOrderById: (state) => (id: number) => state.orders.find(order => order.id === id),
    pendingOrders: (state) => state.orders.filter(order => order.status === 'PENDING'),
    processingOrders: (state) => state.orders.filter(order => 
      ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
    ),
    completedOrders: (state) => state.orders.filter(order => order.status === 'COMPLETED'),
    cancelledOrders: (state) => state.orders.filter(order => order.status === 'CANCELED')
  },

  actions: {
    async fetchOrderById(id: number) {
      this.loading = true
      this.error = null
      try {
        this.currentOrder = await getOrderById(id)
        return this.currentOrder
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取订单详情失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrdersByStatus(status: Order['status']) {
      this.loading = true
      this.error = null
      try {
        this.orders = await getOrdersByStatus(status)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取订单列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrdersByMerchant(merchantId: number) {
      this.loading = true
      this.error = null
      try {
        this.orders = await getOrdersByMerchantId(merchantId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取商家订单列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrdersByUser(userId: number) {
      this.loading = true
      this.error = null
      try {
        this.orders = await getOrdersByUserId(userId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取用户订单列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createOrder(userId: number) {
      this.loading = true
      this.error = null
      try {
        const newOrder = await createOrder(userId)
        this.orders.push(newOrder)
        return newOrder
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建订单失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(orderId: number, status: Order['status']) {
      this.loading = true
      this.error = null
      try {
        const updatedOrder = await updateOrderStatus(orderId, status)
        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index] = updatedOrder
        }
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = updatedOrder
        }
        return updatedOrder
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新订单状态失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId: number) {
      this.loading = true
      this.error = null
      try {
        await cancelOrder(orderId)
        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], status: 'CANCELED' }
        }
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, status: 'CANCELED' }
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '取消订单失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    setCurrentOrder(order: Order | null) {
      this.currentOrder = order
    },

    clearOrders() {
      this.orders = []
      this.currentOrder = null
    }
  }
}) 