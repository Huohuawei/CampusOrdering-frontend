<template>
  <div class="auth-container">
    <h1>校园点餐系统 - 登录</h1>
    <AuthForm @submit="handleLogin" @toggle-mode="switchToRegister" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import AuthForm from './AuthForm.vue'


const router = useRouter()

const handleLogin = async (formData) => {
  try {
    // 这里替换为实际的API调用
    console.log('登录数据:', formData)

    // 模拟登录成功
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({
      email: formData.email,
      username: '测试用户',
      role: 'user' // 实际应从API响应中获取
    }))

    // 根据角色跳转到不同页面
    const role = 'user' // 实际应从API响应中获取
    if (role === 'merchant') {
      router.push('/merchant-dashboard')
    } else {
      router.push('/home')
    }
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
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #42b983;
}
</style>