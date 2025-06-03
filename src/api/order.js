import request from '@/utils/request'

export function getOrders(params) {
  return request({
    url: '/api/orders',
    method: 'get',
    params
  })
} 