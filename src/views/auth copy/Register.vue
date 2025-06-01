<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="auth-header">
        <h1>校园点餐系统</h1>
        <p class="subtitle">美味校园，一键开启</p>
      </div>

      <AuthForm :is-register="true" @submit="handleRegister" @toggle-mode="switchToLogin" />

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthForm from './AuthForm.vue'

const router = useRouter()
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
        
        // 回滚用户注册(实际项目中可能需要调用删除用户API)
        // await fetch(`http://localhost:8080/api/users/${createdUser.id}`, {
        //   method: 'DELETE'
        // })
        
        throw new Error(errorMessage)
      }

      const createdMerchant = await merchantResponse.json()
      console.log('商家信息创建成功:', createdMerchant)
    }

    // 5. 注册成功处理
    const successMessage = formData.role === 'merchant' 
      ? '商家注册成功，请等待管理员审核' 
      : '用户注册成功，请登录'
    
    alert(successMessage)
    router.push('/login')

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
  display: flex;
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(44, 62, 80, 0.2) 100%),
    url('../src/assets/logo1.jpg') no-repeat center center;
  background-size: cover;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 2.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  font-size: 1rem;
  margin-bottom: 0;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.auth-footer a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-wrapper {
    padding: 1rem;
  }

  .auth-container {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>