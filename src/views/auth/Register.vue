<template>
  <div class="auth-container">
    <h1>校园点餐系统 - 注册</h1>
    <AuthForm 
      :is-register="true" 
      @submit="handleRegister" 
      @toggle-mode="switchToLogin" 
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthForm from './AuthForm.vue'

const router = useRouter()

const handleRegister = async (formData) => {
  try {
    // 根据角色准备不同的注册数据
    const registrationData = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      role: formData.role
    }
    
    // 添加角色特有字段
    if (formData.role === 'merchant') {
      registrationData.shopName = formData.shopName
    } else {
      registrationData.studentId = formData.studentId
    }
    
    // 这里替换为实际的API调用
    console.log('注册数据:', registrationData)
    
    // 模拟注册成功
    alert(`${formData.role === 'merchant' ? '商家' : '用户'}注册成功，请登录`)
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    alert('注册失败，请重试')
  }
}

const switchToLogin = () => {
  router.push('/login')
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