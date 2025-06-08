<template>
  <form @submit.prevent="submitForm" class="auth-form">
    <!-- 公共字段 -->
    <div class="form-group">
      <label for="username">用户名</label>
      <input type="text" id="username" v-model="formData.username" required placeholder="请输入您的用户名" class="form-input" />
      <span class="input-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </span>
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password" required
        placeholder="请输入密码" class="form-input" />
      <span class="input-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </span>
      <button type="button" class="password-toggle" @click="showPassword = !showPassword">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <!-- 注册特有字段 -->
    <template v-if="isRegister">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="formData.email" required placeholder="请输入您的邮箱" class="form-input" />
        <span class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </span>
      </div>

      <div class="form-group">
        <label for="role">注册为</label>
        <div class="select-wrapper">
          <select id="role" v-model="formData.role" required class="form-select">
            <option value="user">普通用户</option>
            <option value="merchant">商家</option>
          </select>
          <span class="select-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="phoneId">联系方式</label>
        <input type="tel" id="phoneId" v-model="formData.phoneId" required placeholder="请输入手机号码" class="form-input" />
        <span class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
            </path>
          </svg>
        </span>
      </div>

      <!-- 商家特有字段 -->
      <div v-if="formData.role === 'merchant'" class="form-group">
        <label for="shopName">店铺名称</label>
        <input type="text" id="shopName" v-model="formData.shopName" required placeholder="请输入店铺名称"
          class="form-input" />
        <span class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
      </div>

      <div v-if="formData.role === 'merchant'" class="form-group">
        <label for="shopDes">店铺描述</label>
        <textarea id="shopDes" v-model="formData.shopDes" required placeholder="请简要描述您的店铺" class="form-textarea"
          rows="3"></textarea>
        <span class="input-icon textarea-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </span>
      </div>
    </template>

    <button type="submit" class="submit-btn">
      {{ isRegister ? '注册' : '登录' }}
      <span class="btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </span>
    </button>

    <div class="toggle-auth">
      <span v-if="isRegister">已有账号？</span>
      <span v-else>没有账号？</span>
      <button type="button" @click.prevent="toggleAuthMode" class="toggle-btn">
        {{ isRegister ? '去登录' : '去注册' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isRegister: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'toggle-mode'])

const formData = ref({
  username: '',
  password: '',
  email: '',
  role: 'user',
  shopName: '',
  phoneId: '',
  shopDes: ''
})

const showPassword = ref(false)

const toggleAuthMode = () => {
  emit('toggle-mode')
}

const submitForm = () => {
  emit('submit', formData.value)
}
</script>

<style scoped>
/* Sea island vacation theme */
.auth-form {
  width: 90%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.9));
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 76, 95, 0.15);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  position: relative;
  margin-bottom: 1.8rem;
}

label {
  display: block;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  color: #004c5f;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
  border: 1px solid rgba(0, 128, 160, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  background: linear-gradient(145deg, #f0f8ff, #e6f0fa);
  color: #003a4a;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 76, 95, 0.1);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00b7eb;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(0, 183, 235, 0.3);
  transform: scale(1.02);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  padding-top: 1.2rem;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 70%;
  transform: translateY(-50%);
  color: #0080a0;
  transition: color 0.3s ease;
}

.form-input:focus+.input-icon,
.form-select:focus+.select-arrow,
.form-textarea:focus+.textarea-icon {
  color: #00b7eb;
}

.textarea-icon {
  top: 2.8rem;
  transform: none;
}

.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
  padding-right: 3rem;
  cursor: pointer;
  background: linear-gradient(145deg, #f0f8ff, #e6f0fa);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 70%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #0080a0;
}

.password-toggle {
  position: absolute;
  right: 0.8rem;
  top: 70%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #0080a0;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #00b7eb;
  background: rgba(0, 183, 235, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #00b7eb, #00d4ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: 0.5s;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 183, 235, 0.4);
  background: linear-gradient(90deg, #00a3d3, #00c0f0);
}

.btn-icon {
  margin-left: 0.6rem;
  display: flex;
}

.toggle-auth {
  text-align: center;
  margin-top: 1.8rem;
  font-size: 0.95rem;
  color: #004c5f;
}

.toggle-btn {
  background: none;
  border: none;
  color: #00b7eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  margin-left: 0.4rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #0080a0;
  text-decoration: none;
  background: rgba(0, 183, 235, 0.1);
  border-radius: 8px;
}

@media (max-width: 480px) {
  .auth-form {
    padding: 1.5rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    padding-left: 2.8rem;
    font-size: 0.95rem;
  }

  .input-icon {
    left: 0.9rem;
  }
}
</style>