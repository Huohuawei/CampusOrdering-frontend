import { defineStore } from 'pinia'
import type { Order, OrderItem } from '@/types'
import {
  getOrdersByMerchantId,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '@/api/orders'
import {
  getOrderItemsByOrderId
} from '@/api/order-items'

export const useMerchantOrdersStore = defineStore('merchantOrders', {
  state: () => ({
    orders: [] as Order[],
    currentOrder: null as Order | null,
    currentOrderItems: [] as OrderItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    pendingOrders: (state) => state.orders.filter(order => order.status === 'PENDING'),
    processingOrders: (state) => state.orders.filter(order => 
      ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
    ),
    completedOrders: (state) => state.orders.filter(order => order.status === 'COMPLETED'),
    cancelledOrders: (state) => state.orders.filter(order => order.status === 'CANCELED')
  },

  actions: {
    // 获取商家的所有订单
    async fetchMerchantOrders(merchantId: number) {
      this.loading = true
      this.error = null
      try {
        this.orders = await getOrdersByMerchantId(merchantId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取订单列表失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    // 获取订单详情
    async fetchOrderDetail(orderId: number) {
      this.loading = true
      this.error = null
      try {
        this.currentOrder = await getOrderById(orderId)
        this.currentOrderItems = await getOrderItemsByOrderId(orderId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取订单详情失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    // 更新订单状态
    async updateOrderStatus(orderId: number, status: Order['status']) {
      this.loading = true
      this.error = null
      try {
        const updatedOrder = await updateOrderStatus(orderId, status)
        // 更新本地订单列表
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

    // 取消订单
    async cancelOrder(orderId: number) {
      this.loading = true
      this.error = null
      try {
        await cancelOrder(orderId)
        // 更新本地订单列表
        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index].status = 'CANCELED'
        }
        if (this.currentOrder?.id === orderId) {
          this.currentOrder.status = 'CANCELED'
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '取消订单失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    // 清除当前订单
    clearCurrentOrder() {
      this.currentOrder = null
      this.currentOrderItems = []
    }
  }
}) 