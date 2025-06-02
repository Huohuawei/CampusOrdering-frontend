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
<<<<<<< Updated upstream
import userHome from '../user/Home.vue'

const router = useRouter()

=======
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import { useMerchantShopStore } from '../../stores/merchant/shop'
const router = useRouter()
const userStore = useUserStore()
const merchantStore = useMerchantShopStore() // 获取商家store
>>>>>>> Stashed changes
const handleLogin = async (formData) => {
  try {
    // 1. 调用API获取用户信息
    const response = await fetch(`http://localhost:8080/api/users/username/${formData.username}`)

    if (!response.ok) {
      throw new Error('用户不存在或服务器错误')
    }

    const userData = await response.json()

    // 验证密码
    if (userData.password !== formData.password) {
      throw new Error('密码错误')
    }
<<<<<<< Updated upstream
    
   
    localStorage.setItem('token', 'user-token') // 
    localStorage.setItem('user', JSON.stringify({
=======

    // 存储基础用户信息
    const userInfo = {
>>>>>>> Stashed changes
      id: userData.id,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar
<<<<<<< Updated upstream
    }))



    // 根据角色跳转到不同页面
    switch(userData.role) {
=======
    }

    localStorage.setItem('token', 'user-token')
    localStorage.setItem('user', JSON.stringify(userInfo))


    // 如果是商户，获取并存储商户专属信息
    if (userData.role === 'MERCHANT') {
      try {
        const merchantResponse = await fetch(`http://localhost:8080/api/merchants/user/${userData.id}`)

        if (!merchantResponse.ok) {
          throw new Error('获取商家信息失败')
        }

        const merchantData = await merchantResponse.json()

        // 存储到localStorage
        localStorage.setItem('merchant', JSON.stringify(merchantData))

        // 更新商家store
        merchantStore.setCurrentMerchant(merchantData)

        console.log('商家信息已加载:', merchantStore.currentMerchant)

      } catch (merchantError) {
        console.error('获取商家信息失败:', merchantError)
        // 商户信息获取失败不影响基础登录，但可以提示用户
        ElMessage.warning('商家信息加载失败，部分功能可能受限')
      }
    }

    // 更新Pinia store
    userStore.currentUser = userInfo

    console.log('当前用户:', userStore.currentUser)

    // 根据角色跳转
    switch (userData.role) {
>>>>>>> Stashed changes
      case 'ADMIN':
        router.push('/adminhome')
        ElMessage.success('管理员登录成功')
        break
      case 'MERCHANT':
        router.push('/merchant')
        ElMessage.success('商户登录成功')
        break
      case 'USER':
      default:
<<<<<<< Updated upstream
        router.push('/userhome')
=======
        router.push('/user/home')
        ElMessage.success('用户登录成功')
>>>>>>> Stashed changes
    }

  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    // 清理可能不完整的登录状态
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('merchant')
    userStore.currentUser = null
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
<<<<<<< Updated upstream
  background: 
    linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(44, 62, 80, 0.2) 100%),
=======
  background:
    linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(44, 62, 80, 0.3) 100%),
>>>>>>> Stashed changes
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