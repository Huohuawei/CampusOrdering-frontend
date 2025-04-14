<template>
    <div class="home-container">
      <h1>欢迎, {{ user.username }}!</h1>
      <p>这里是校园点餐系统的主页</p>
      <button @click="handleLogout">退出登录</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const user = ref({})
  
  onMounted(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      user.value = JSON.parse(userData)
    }
  })
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .home-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }
  
  button {
    background-color: #ff4757;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  </style>