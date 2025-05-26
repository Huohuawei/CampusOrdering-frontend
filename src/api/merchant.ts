import axios from 'axios'

// 获取所有商户
export const getMerchants = async () => {
  const response = await axios.get('/api/merchants')
  return response.data // ✅ 因为后端直接返回的是数组
}

// 根据id获取单个商户
export const getMerchantById = async (id: number) => {
  const response = await axios.get(`/api/merchants/${id}`)
  return response.data
}
