import { get, put, patch, post, del } from '../request'
import type { Merchant } from '@/types'

// 获取商家信息
export function getMerchantInfo(id: number) {
  return get<Merchant>(`/api/merchants/${id}`)
}

// 更新商家信息
export function updateMerchantInfo(id: number, data: Merchant) {
  return put<Merchant>(`/api/merchants/${id}`, data)
}

// 删除商家
export function deleteMerchant(id: number) {
  return del<void>(`/api/merchants/${id}`)
}

// 获取商家列表
export function getMerchants() {
  return get<Merchant[]>('/api/merchants')
}

// 创建商家
export function createMerchant(data: Merchant) {
  return post<Merchant>('/api/merchants', data)
}

// 更新商家状态
export function updateMerchantStatus(id: number, status: Merchant['status']) {
  return patch<Merchant>(`/api/merchants/${id}/status/${status}`)
}

// 获取用户关联的商家
export function getMerchantByUserId(userId: number) {
  return get<Merchant>(`/api/merchants/user/${userId}`)
}

// 根据状态获取商家列表
export function getMerchantsByStatus(status: Merchant['status']) {
  return get<Merchant[]>(`/api/merchants/status/${status}`)
}

// 根据店铺名称搜索商家
export function searchMerchantsByName(storeName: string) {
  return get<Merchant[]>(`/api/merchants/name/${storeName}`)
}

// 检查店铺名称是否已存在
export function checkStoreNameExists(storeName: string) {
  return get<boolean>(`/api/merchants/exists/store-name/${storeName}`)
}

// 上传商家封面图片
export function uploadCoverImage(id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return put<Merchant>(`/api/merchants/${id}/cover-image`, formData)
}

// 上传微信支付二维码
export function uploadWechatQr(id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return put<Merchant>(`/api/merchants/${id}/wechat-qr`, formData)
}

// 上传支付宝二维码
export function uploadAlipayQr(id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return put<Merchant>(`/api/merchants/${id}/alipay-qr`, formData)
} 