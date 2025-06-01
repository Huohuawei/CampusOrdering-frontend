import axios from 'axios'

// 根据 ID 获取用户信息
export const getUserById = async (id: number) => {
  const response = await axios.get(`/api/users/${id}`)
  return response.data
}

// 根据用户名获取用户信息
export const getUserByUsername = async (username: string) => {
  const response = await axios.get(`/api/users/username/${username}`)
  return response.data
}

// 更新用户信息（根据 ID）
export const updateUserById = async (id: number, userData: any) => {
  const response = await axios.put(`/api/users/${id}`, userData)
  return response.data
}

// 检查用户名是否存在
export const checkUsernameExists = async (username: string) => {
  const response = await axios.get(`/api/users/exists/username/${username}`)
  return response.data // true / false
}

// 检查邮箱是否存在
export const checkEmailExists = async (email: string) => {
  const response = await axios.get(`/api/users/exists/email/${email}`)
  return response.data // true / false
}

// 检查手机号是否存在
export const checkPhoneExists = async (phone: string) => {
  const response = await axios.get(`/api/users/exists/phone/${phone}`)
  return response.data // true / false
}
