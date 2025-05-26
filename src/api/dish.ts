import axios from 'axios'

// 获取指定商户的所有菜品
export const getDishesByMerchantId = async (merchantId: number) => {
  const response = await axios.get(`/api/dishes/merchant/${merchantId}`)
  return response.data
}
