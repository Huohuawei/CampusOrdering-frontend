<template>
  <div class="auth-container">
    <h1>校园点餐系统 - 登录</h1>
    <AuthForm @submit="handleLogin" @toggle-mode="switchToRegister" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import AuthForm from './AuthForm.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const merchantStore = useMerchantShopStore()

const handleLogin = async (formData) => {
  try {
    // 模拟登录成功，设置统一的模拟数据
    const mockUser = {
      id: 101,
      username: "test",
      password: "test",
      email: "mioikeda@gmail.com",
      phone: "52-390-8417",
      role: "MERCHANT",
      avatar: "bgqoiJ72Mh",
      createdAt: "2016-09-28T10:23:31",
      updatedAt: "2025-05-23T18:10:02"
    }

    const mockMerchant = {
      id: 11,
      user: mockUser,
      storeName: "绿色有机农场",
      storeDescription: "提供新鲜有机蔬菜、水果和农产品，直接从农场到餐桌",
      storeAddress: "北京市海淀区中关村南大街5号",
      status: "PENDING",
      createdAt: "2023-01-10T08:15:22",
      updatedAt: "2025-04-27T19:39:45",
      coverImage: "https://img0.baidu.com/it/u=2554227556,3236173474&fm=253&fmt=auto&app=120&f=JPEG?w=1200&h=800",
      wechatQr: "https://example.com/qr/wechat101.png",
      alipayQr: "https://example.com/qr/alipay101.png"
    }

    // 存储模拟数据到 localStorage
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('merchant', JSON.stringify(mockMerchant))

    // 更新 store 中的商家信息
    merchantStore.setCurrentMerchant(mockMerchant)

    // 跳转到商家界面
    router.push('/merchant')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查邮箱和密码')
  }
}

const switchToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}
</style>