<template>
    <form @submit.prevent="submitForm">
      <!-- 公共字段 -->
      <div class="form-group">
        <label for="email">邮箱</label>
        <input 
          type="email" 
          id="email" 
          v-model="formData.email" 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          type="password" 
          id="password" 
          v-model="formData.password" 
          required
        />
      </div>
      
      <!-- 注册特有字段 -->
      <template v-if="isRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="role">注册为</label>
          <select id="role" v-model="formData.role" required>
            <option value="user">普通用户</option>
            <option value="merchant">商家</option>
          </select>
        </div>
        

        <div class="form-group">
            <label for="phoneId">联系方式</label>
            <input 
              type="text" 
              id="phoneId" 
              v-model="formData.phoneId" 
              required
            />
          </div>


        <!-- 商家特有字段 -->
        <div v-if="formData.role === 'merchant'" class="form-group">
          <label for="shopName">店铺名称</label>
          <input 
            type="text" 
            id="shopName" 
            v-model="formData.shopName" 
            required
          />
        </div>
        
        <!-- 商家特有字段 -->
        <div v-if="formData.role === 'merchant'" class="form-group">
            <label for="shopDes">店铺描述</label>
            <input 
              type="text" 
              id="shopDes" 
              v-model="formData.shopDes" 
              required
            />
          </div>
    
    </template>
      
      <button type="submit">{{ isRegister ? '注册' : '登录' }}</button>
      
      <div class="toggle-auth">
        <span v-if="isRegister">已有账号？</span>
        <span v-else>没有账号？</span>
        <a href="#" @click.prevent="toggleAuthMode">
          {{ isRegister ? '去登录' : '去注册' }}
        </a>
      </div>
    </form>
    
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    isRegister: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['submit', 'toggle-mode'])
  
  const formData = ref({
    email: '',
    password: '',
    username: '',
    role: 'user', // 默认用户
    shopName: '',
    phoneId: ''
  })
  
  const toggleAuthMode = () => {
    emit('toggle-mode')
  }
  
  const submitForm = () => {
    emit('submit', formData.value)
  }
  </script>
  
  <style scoped>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: #333;
  }

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #409eff;
  }

  button {
    background-color: #409eff;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #66b1ff;
  }

  .toggle-auth {
    text-align: center;
    margin-top: 1rem;
    color: #606266;
  }

  .toggle-auth a {
    color: #409eff;
    text-decoration: none;
    margin-left: 0.5rem;
  }

  .toggle-auth a:hover {
    color: #66b1ff;
  }
  </style>