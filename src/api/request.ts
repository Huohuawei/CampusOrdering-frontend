import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    // 检查 HTTP 状态码
    if (response.status !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 检查业务状态码
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '业务处理失败')
      return Promise.reject(new Error(res.message || '业务处理失败'))
    }
    return res.data || res
  },
  (error) => {
    ElMessage.error(error.response?.data?.message || error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get<T>(url: string, params?: any): Promise<T> {
  return service.get(url, { params })
}

// 封装POST请求
export function post<T>(url: string, data?: any): Promise<T> {
  return service.post(url, data)
}

// 封装PUT请求
export function put<T>(url: string, data?: any): Promise<T> {
  return service.put(url, data)
}

// 封装DELETE请求
export function del<T>(url: string): Promise<T> {
  return service.delete(url)
}

// 封装PATCH请求
export function patch<T>(url: string, data?: any): Promise<T> {
  return service.patch(url, data)
}

export default service 