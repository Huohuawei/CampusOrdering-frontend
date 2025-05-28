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

const router = useRouter()
const merchantStore = useMerchantShopStore()

const handleLogin = async (formData) => {
  try {
    // 这里替换为实际的API调用
    console.log('登录数据:', formData)

    // 模拟登录成功，硬编码为商家角色
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({
      id: 11, // 使用商家ID
      email: formData.email,
      username: '测试商家',
      role: 'MERCHANT'
    }))

    // 设置模拟的商家信息
    merchantStore.setCurrentMerchant({
      id: 11,
      userId: 11,
      storeName: '测试商家',
      description: '这是一个测试商家',
      status: 'APPROVED',
      address: '测试地址',
      phone: '1234567890',
      businessHours: '09:00-22:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // 直接跳转到商家界面
    router.push('/merchant')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查邮箱和密码')
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