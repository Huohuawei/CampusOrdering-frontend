import { defineStore } from 'pinia'
import type { Order, OrderItem, DateRange } from '@/types'
import {
  getOrdersByMerchantId,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../../api/orders'
import {
  getOrderItemsByOrderId
} from '../../api/order-items'

interface OrderStats {
  total: { count: number; amount: number }
  pending: { count: number; amount: number }
  confirmed: { count: number; amount: number }
  preparing: { count: number; amount: number }
  ready: { count: number; amount: number }
  completed: { count: number; amount: number }
  canceled: { count: number; amount: number }
}

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
        const orders = await getOrdersByMerchantId(merchantId)
        this.orders = orders
        return orders
      } catch (error) {
        this.error = '获取订单列表失败'
        throw error
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
    },

    async fetchOrderStats(merchantId: number, dateRange: DateRange): Promise<OrderStats> {
      try {
        const orders = await this.fetchMerchantOrders(merchantId)
        console.log('获取到的所有订单:', orders)
        
        // 日期筛选
        const filteredOrders = dateRange.startDate && dateRange.endDate
          ? orders.filter(order => {
              const orderDate = new Date(order.createdAt)
              const startDate = new Date(dateRange.startDate + 'T00:00:00')
              const endDate = new Date(dateRange.endDate + 'T23:59:59')
              console.log('订单日期:', orderDate, '开始日期:', startDate, '结束日期:', endDate)
              return orderDate >= startDate && orderDate <= endDate
            })
          : orders
        console.log('筛选后的订单:', filteredOrders)

        // 初始化统计数据
        const stats: OrderStats = {
          total: { count: 0, amount: 0 },
          pending: { count: 0, amount: 0 },
          confirmed: { count: 0, amount: 0 },
          preparing: { count: 0, amount: 0 },
          ready: { count: 0, amount: 0 },
          completed: { count: 0, amount: 0 },
          canceled: { count: 0, amount: 0 }
        }

        // 统计各类数据
        filteredOrders.forEach(order => {
          const amount = order.totalPrice || 0
          // 更新总数
          stats.total.count++
          stats.total.amount += amount

          // 根据订单状态更新对应分类
          switch (order.status) {
            case 'PENDING':
              stats.pending.count++
              stats.pending.amount += amount
              break
            case 'CONFIRMED':
              stats.confirmed.count++
              stats.confirmed.amount += amount
              break
            case 'PREPARING':
              stats.preparing.count++
              stats.preparing.amount += amount
              break
            case 'READY':
              stats.ready.count++
              stats.ready.amount += amount
              break
            case 'COMPLETED':
              stats.completed.count++
              stats.completed.amount += amount
              break
            case 'CANCELED':
              stats.canceled.count++
              stats.canceled.amount += amount
              break
          }
        })
        console.log('计算后的统计数据:', stats)
        return stats
      } catch (error) {
        console.error('获取订单统计失败:', error)
        throw error
      }
    }
  }
}) 