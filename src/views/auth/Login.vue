<template>
  <div class="auth-wrapper">
    <!-- 动态背景粒子 -->
    <div class="particles-container">
      <div class="particle" v-for="n in 50" :key="n"></div>
    </div>

    <!-- 浮动装饰元素 -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="auth-container">
      <!-- 顶部装饰线 -->
      <div class="decoration-line"></div>

      <div class="auth-header">
        <!-- Logo 区域 -->
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                fill="currentColor" />
            </svg>
          </div>
        </div>

        <h1 class="main-title">
          <span class="title-text">校园点餐系统</span>
          <div class="title-glow"></div>
        </h1>

        <p class="subtitle">
          <span class="subtitle-icon">🌴</span>
          美味校园，一键开启
          <span class="subtitle-icon">🌺</span>
        </p>
      </div>

      <!-- 表单容器 -->
      <div class="form-container">
        <AuthForm @submit="handleLogin" @toggle-mode="switchToRegister" />
      </div>

      <!-- 底部装饰 -->
      <div class="auth-footer">
        <div class="footer-decoration">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>

    <!-- 侧边装饰 -->
    <div class="side-decoration left">
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
    </div>
    <div class="side-decoration right">
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthForm from './AuthForm.vue'

const router = useRouter()

const handleLogin = async (formData) => {
  try {
    // 添加加载状态的视觉反馈
    const response = await fetch(`http://localhost:8080/api/users/username/${formData.username}`)

    if (!response.ok) {
      throw new Error('用户不存在或服务器错误')
    }

    const userData = await response.json()

    if (userData.password !== formData.password) {
      throw new Error('密码错误')
    }

    localStorage.setItem('token', 'user-token')
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar
    }))

    // 根据角色跳转到不同页面
    switch (userData.role) {
      case 'ADMIN':
        router.push('/admin/statistic')
        break
      case 'MERCHANT':
        router.push('/merchant/dashboard')
        break
      case 'USER':
      default:
        router.push('/user/home')
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
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #00b7eb 0%, #0080a0 100%);
  position: relative;
  overflow: hidden;
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float 15s infinite ease-in-out;
}

.particle:nth-child(odd) {
  width: 8px;
  height: 8px;
  animation-duration: 20s;
}

.particle:nth-child(even) {
  width: 12px;
  height: 12px;
  animation-duration: 25s;
}

@for $i from 1 through 50 {
  .particle:nth-child(#{$i}) {
    left: random(100) * 1%;
    top: random(100) * 1%;
    animation-delay: random(10) * -1s;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shape {
  position: absolute;
  background: linear-gradient(45deg, rgba(255, 245, 200, 0.4), rgba(255, 255, 255, 0.2));
  border-radius: 50%;
  animation: drift 30s infinite ease-in-out;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 15%;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 20%;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 15%;
  left: 30%;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 10%;
}

@keyframes drift {

  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(20px, -20px);
  }
}

.auth-container {
  position: relative;
  width: 90%;
  max-width: 480px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.9));
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 76, 95, 0.2);
  backdrop-filter: blur(10px);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.decoration-line {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #00b7eb, #00d4ff);
  border-radius: 2px;
  margin: 0 auto 1.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #00b7eb, #00d4ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 183, 235, 0.3);
  animation: pulse 2s infinite ease-in-out;
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: white;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.main-title {
  position: relative;
  margin: 0.5rem 0;
}

.title-text {
  font-size: 2rem;
  font-weight: 700;
  color: #004c5f;
  text-shadow: 0 2px 4px rgba(0, 76, 95, 0.2);
}

.title-glow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00b7eb, transparent);
  border-radius: 2px;
}

.subtitle {
  font-size: 1.1rem;
  color: #0080a0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.subtitle-icon {
  font-size: 1.2rem;
  animation: twinkle 3s infinite ease-in-out;
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.form-container {
  margin: 0 auto;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
}

.footer-decoration {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #00b7eb;
  border-radius: 50%;
  animation: bounce 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.side-decoration {
  position: absolute;
  top: 0;
  height: 100%;
  width: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.side-decoration.left {
  left: 0;
}

.side-decoration.right {
  right: 0;
}

.decoration-item {
  width: 12px;
  height: 80px;
  background: linear-gradient(180deg, #00b7eb, transparent);
  border-radius: 6px;
  opacity: 0.3;
  animation: glow 2.5s infinite ease-in-out;
}

.decoration-item:nth-child(2) {
  animation-delay: 0.5s;
}

.decoration-item:nth-child(3) {
  animation-delay: 1s;
}

@keyframes glow {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.6;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
  }

  .title-text {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
  }

  .logo-icon svg {
    width: 30px;
    height: 30px;
  }
}
</style>