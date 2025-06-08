<template>
  <div class="auth-wrapper">
    <!-- 动态背景粒子 -->
    <div class="particles-container">
      <div class="particle" v-for="n in 60" :key="n"></div>
    </div>

    <!-- 浮动装饰元素 -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>

    <div class="auth-container">
      <!-- 顶部装饰线 -->
      <div class="decoration-line"></div>

      <div class="auth-header">
        <!-- Logo 区域 -->
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 7L12 12L5 7M19 7V17C19 17.5523 18.5523 18 18 18H6C5.44772 18 5 17.5523 5 17V7M19 7L18.2929 6.29289C18.1054 6.10536 17.851 6 17.5858 6H6.41421C6.14869 6 5.89464 6.10536 5.70711 6.29289L5 7"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <h1 class="main-title">
          <span class="title-text">加入校园点餐</span>
          <div class="title-glow"></div>
        </h1>

        <p class="subtitle">
          <span class="subtitle-icon">🌴</span>
          开启您的校园美食之旅
          <span class="subtitle-icon">🌺</span>
        </p>
      </div>

      <!-- 表单容器 -->
      <div class="form-container">
        <AuthForm :is-register="true" @submit="handleRegister" @toggle-mode="switchToLogin" />
      </div>


    </div>

    <!-- 侧边装饰 -->
    <div class="side-decoration left">
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
    </div>
    <div class="side-decoration right">
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
      <div class="decoration-item"></div>
    </div>

    <!-- 成功提示模态框 -->
    <div v-if="showSuccessModal" class="success-modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h3>注册成功！</h3>
        <p>{{ successMessage }}</p>
        <button @click="closeSuccessModal" class="success-button">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthForm from './AuthForm.vue'

const router = useRouter()
const showSuccessModal = ref(false)
const successMessage = ref('')

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const handleRegister = async (formData) => {
  try {
    // 1. 准备用户注册数据
    const userRegistrationData = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      phone: formData.phoneId,
      role: formData.role.toUpperCase() // 转换为大写以匹配数据库枚举
    }

    console.log('用户注册数据:', userRegistrationData)

    // 2. 调用API注册用户
    const userResponse = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userRegistrationData)
    })

    // 3. 处理用户注册响应
    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      throw new Error(errorData.message || '用户注册失败')
    }

    const createdUser = await userResponse.json()
    console.log('用户注册成功:', createdUser)

    // 4. 如果是商家，注册商家信息
    if (formData.role === 'merchant') {
      // 准备商家数据，包含完整的用户对象
      const merchantData = {
        user: {
          id: createdUser.id,
          username: createdUser.username,
          password: createdUser.password, // 注意：实际项目中不应返回密码
          email: createdUser.email,
          phone: createdUser.phone,
          role: createdUser.role,
          avatar: createdUser.avatar,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt
        },
        storeName: formData.shopName,
        storeDescription: formData.shopDes,
        status: 'PENDING', // 默认待审核状态
        storeAddress: formData.shopAddress || '', // 可选地址
        coverImage: formData.coverImage || null, // 封面图片URL
        wechatQr: formData.wechatQr || null, // 微信支付二维码
        alipayQr: formData.alipayQr || null // 支付宝二维码
      }

      console.log('商家注册数据:', merchantData)

      // 调用商家API创建商家信息
      const merchantResponse = await fetch('http://localhost:8080/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(merchantData)
      })

      // 处理商家注册响应
      if (!merchantResponse.ok) {
        // 尝试获取错误详情
        let errorMessage = '商家信息创建失败'
        try {
          const errorData = await merchantResponse.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('解析错误响应失败:', e)
        }

        throw new Error(errorMessage)
      }

      const createdMerchant = await merchantResponse.json()
      console.log('商家信息创建成功:', createdMerchant)
    }

    // 5. 注册成功处理
    successMessage.value = formData.role === 'merchant'
      ? '商家注册成功，请等待管理员审核后即可开始营业！'
      : '注册成功！欢迎加入校园点餐系统，现在可以开始点餐了！'

    showSuccessModal.value = true

  } catch (error) {
    console.error('注册失败:', error)

    // 根据错误类型显示不同的提示
    let errorMessage = '注册失败，请重试'
    if (error.message.includes('username') || error.message.includes('用户名')) {
      errorMessage = '用户名已存在，请更换'
    } else if (error.message.includes('email') || error.message.includes('邮箱')) {
      errorMessage = '邮箱已被注册，请更换'
    } else if (error.message.includes('phone') || error.message.includes('手机号')) {
      errorMessage = '手机号已被使用，请更换'
    } else if (error.message.includes('user_id') || error.message.includes('用户ID')) {
      errorMessage = '该用户已经是商家，不能重复注册'
    } else if (error.message.includes('store_name') || error.message.includes('店铺名称')) {
      errorMessage = '店铺名称已存在，请更换'
    } else {
      errorMessage = error.message || errorMessage
    }
    alert(errorMessage)
  }
}

const switchToLogin = () => {
  router.push('/login')
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

@for $i from 1 through 60 {
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

.shape-5 {
  width: 90px;
  height: 90px;
  bottom: 25%;
  left: 50%;
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

.dot:nth-child(4) {
  animation-delay: 0.6s;
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

.footer-text {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #004c5f;
}

.login-link {
  color: #00b7eb;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #0080a0;
  background: rgba(0, 183, 235, 0.1);
  border-radius: 8px;
  padding: 0.2rem 0.5rem;
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

.decoration-item:nth-child(4) {
  animation-delay: 1.5s;
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

.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 76, 95, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.success-modal {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.9));
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 76, 95, 0.2);
  animation: popIn 0.4s ease-out;
  max-width: 400px;
  width: 90%;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(45deg, #00b7eb, #00d4ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon svg {
  width: 36px;
  height: 36px;
  color: white;
}

.success-modal h3 {
  font-size: 1.5rem;
  color: #004c5f;
  margin-bottom: 1rem;
}

.success-modal p {
  font-size: 1rem;
  color: #0080a0;
  margin-bottom: 1.5rem;
}

.success-button {
  padding: 0.8rem 2rem;
  background: linear-gradient(90deg, #00b7eb, #00d4ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.success-button:hover {
  background: linear-gradient(90deg, #00a3d3, #00c0f0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 183, 235, 0.3);
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

  .success-modal {
    padding: 1.5rem;
  }

  .success-modal h3 {
    font-size: 1.3rem;
  }

  .success-modal p {
    font-size: 0.95rem;
  }
}
</style>