<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="auth-header">
        <h1>校园点餐系统</h1>
        <p class="subtitle">美味校园，一键开启</p>
      </div>
      <AuthForm @submit="handleLogin" @toggle-mode="switchToRegister" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthForm from './AuthForm.vue'
import userHome from '../user/Home.vue'

const router = useRouter()

const handleLogin = async (formData) => {
  try {
    // console.log('登录数据:', formData)
    
    // 1. 调用API获取用户信息
    const response = await fetch(`http://localhost:8080/api/users/username/${formData.username}`)
    
    if (!response.ok) {
      throw new Error('用户不存在或服务器错误')
    }
    
    const userData = await response.json()
    
    //  验证密码
    if (userData.password !== formData.password) {
      throw new Error('密码错误')
    }
    
   
    localStorage.setItem('token', 'user-token') // 
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar
    }))



    // 根据角色跳转到不同页面
    switch(userData.role) {
      case 'ADMIN':
        router.push('adminhome')
        break
      case 'MERCHANT':
        router.push('/merchanthome')
        break
      case 'USER':
      default:
        router.push('/userhome')
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    alert(error.message || '登录失败，请检查用户名和密码')
  }
}
const switchToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: 
    linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(44, 62, 80, 0.2) 100%),
    url('../src/assets/logo1.jpg') no-repeat center center;
  background-size: cover;
  position: relative;
}

.auth-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.auth-container {
  width: 800px;
  max-width: 500px;
  margin: auto;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 2;
  position: relative;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .auth-wrapper {
    background-position: 60% center;
  }
  
  .auth-container {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>