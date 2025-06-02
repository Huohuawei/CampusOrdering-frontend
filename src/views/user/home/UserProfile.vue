<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <!-- 简化的背景横幅 -->
      <div class="banner-bg"></div>

      <!-- 用户头像和基本信息 -->
      <div class="profile-header">
        <div class="avatar-container">
          <el-avatar :size="100" :src="user.avatar || defaultAvatar" class="avatar" />
          <div class="avatar-overlay" @click="showAvatarDialog = true">
            <i class="el-icon-camera"></i>
          </div>
        </div>
        <h2 class="username">{{ user.username }}</h2>
        <p class="email">{{ user.email }}</p>
        <div class="user-badges">
          <el-tag type="success" size="small">{{ user.role || 'USER' }}</el-tag>
          <el-tag type="info" size="small">
            <i class="el-icon-time" style="margin-right: 4px;"></i>
            {{ formattedDate }}
          </el-tag>
        </div>
      </div>

      <!-- 编辑表单 -->
      <el-form v-if="isEditing" :model="user" label-width="90px" class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="user.username" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email" prefix-icon="el-icon-message" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="user.phone" prefix-icon="el-icon-phone" />
        </el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="save" :loading="saving">
            <i class="el-icon-check"></i> 保存
          </el-button>
          <el-button @click="cancelEdit">
            <i class="el-icon-close"></i> 取消
          </el-button>
        </div>
      </el-form>

      <!-- 修改密码表单 -->
      <el-form v-if="isEditingPassword" :model="passwordForm" label-width="90px" class="profile-form">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.currentPassword" type="password" prefix-icon="el-icon-lock" show-password
            placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" prefix-icon="el-icon-key" show-password
            placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" prefix-icon="el-icon-key" show-password
            placeholder="请再次输入新密码" />
        </el-form-item>
        <div class="password-strength">
          <span>密码强度：</span>
          <div class="strength-bar">
            <div class="strength-fill" :class="passwordStrength.level"></div>
          </div>
          <span class="strength-text">{{ passwordStrength.text }}</span>
        </div>
        <div class="form-actions">
          <el-button type="primary" @click="savePassword" :loading="saving">
            <i class="el-icon-check"></i> 保存密码
          </el-button>
          <el-button @click="cancelPasswordEdit">
            <i class="el-icon-close"></i> 取消
          </el-button>
        </div>
      </el-form>

      <!-- 显示信息 -->
      <div v-else class="profile-info">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-content">
              <span class="label">手机号</span>
              <span class="value">{{ user.phone || '未填写' }}</span>
            </div>
          </div>

          <div class="info-item">
            <div class="info-content">
              <span class="label">用户角色</span>
              <span class="value">{{ user.role || 'USER' }}</span>
            </div>
          </div>

          <div class="info-item">
            <div class="info-content">
              <span class="label">注册时间</span>
              <span class="value">{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" @click="isEditing = true" class="edit-btn">
            <i class="el-icon-edit"></i> 修改资料
          </el-button>
          <el-button type="warning" @click="isEditingPassword = true" class="password-btn">
            <i class="el-icon-lock"></i> 修改密码
          </el-button>
          <el-button type="success" @click="showAvatarDialog = true" class="avatar-btn">
            <i class="el-icon-picture"></i> 更换头像
          </el-button>
          <el-button type="success" @click="handleLogout" class="avatar-btn">
            <i class="el-icon-picture"></i> 退出登录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 头像更换对话框 -->
    <el-dialog title="更换头像" v-model="showAvatarDialog" width="500px" class="avatar-dialog">
      <div class="avatar-preview">
        <el-avatar :size="80" :src="previewAvatar || user.avatar || defaultAvatar" />
      </div>
      <el-form>
        <el-form-item label="头像链接">
          <el-input v-model="tempAvatar" placeholder="粘贴头像图片链接" @input="updatePreview" prefix-icon="el-icon-picture" />
        </el-form-item>
        <el-form-item label="预设头像">
          <div class="preset-avatars">
            <el-avatar v-for="(avatar, index) in presetAvatars" :key="index" :size="50" :src="avatar"
              class="preset-avatar" @click="selectPresetAvatar(avatar)" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="updateAvatar" :loading="avatarUpdating">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserById, updateUserById } from '../../../api/user'

import { useRouter } from 'vue-router'

const router = useRouter()
// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const isEditing = ref(false)
const isEditingPassword = ref(false)
const showAvatarDialog = ref(false)
const saving = ref(false)
const avatarUpdating = ref(false)

const user = ref({
  id: 0,
  username: '',
  email: '',
  phone: '',
  avatar: '',
  role: '',
  createdAt: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const tempAvatar = ref('')
const previewAvatar = ref('')

const defaultAvatar = 'https://img2.baidu.com/it/u=3438742520,3870787236&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500'

const presetAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=1',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=2'
]

const stored = JSON.parse(localStorage.getItem('user') || '{}')
const userId = stored.id || 1

// 密码强度检测
const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword
  if (!password) return { level: 'weak', text: '请输入密码' }

  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 'weak', text: '弱' }
  if (score <= 3) return { level: 'medium', text: '中等' }
  return { level: 'strong', text: '强' }
})

const formattedDate = computed(() => {
  if (!user.value.createdAt) return '未知'
  const d = new Date(user.value.createdAt)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const updatePreview = () => {
  previewAvatar.value = tempAvatar.value
}

const selectPresetAvatar = (avatar: string) => {
  tempAvatar.value = avatar
  previewAvatar.value = avatar
}

const cancelEdit = () => {
  isEditing.value = false
}

const cancelPasswordEdit = () => {
  isEditingPassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

onMounted(async () => {
  try {
    const res = await getUserById(userId)
    if (res && typeof res === 'object') {
      user.value = res
    } else {
      throw new Error('获取的用户数据格式不正确')
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
})

const save = async () => {
  try {
    saving.value = true
    if (!user.value.id || user.value.id === 0) {
      ElMessage.error('用户ID无效，请重新登录')
      return
    }

    let updateData = {
      id: user.value.id,
      username: user.value.username || "",
      password: "string",
      email: user.value.email || "",
      phone: user.value.phone || "",
      role: user.value.role || "USER",
      avatar: user.value.avatar || "",
      createdAt: user.value.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await updateUserById(user.value.id, updateData)
    ElMessage.success('资料已更新')
    isEditing.value = false
  } catch (err: any) {
    console.error('更新失败:', err)
    ElMessage.error('资料更新失败')
  } finally {
    saving.value = false
  }
}

const savePassword = async () => {
  try {
    if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
      ElMessage.error('请填写完整密码信息')
      return
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    if (passwordForm.value.newPassword.length < 6) {
      ElMessage.error('密码长度至少6位')
      return
    }

    saving.value = true

    let updateData = {
      id: user.value.id,
      username: user.value.username || "",
      password: passwordForm.value.newPassword,
      email: user.value.email || "",
      phone: user.value.phone || "",
      role: user.value.role || "USER",
      avatar: user.value.avatar || "",
      createdAt: user.value.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await updateUserById(user.value.id, updateData)
    ElMessage.success('密码已更新')
    isEditingPassword.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err: any) {
    console.error('密码更新失败:', err)
    ElMessage.error('密码更新失败')
  } finally {
    saving.value = false
  }
}

const updateAvatar = async () => {
  try {
    if (!tempAvatar.value || !tempAvatar.value.trim()) {
      ElMessage.warning('请选择或输入头像链接')
      return
    }

    avatarUpdating.value = true

    const updateData = {
      id: user.value.id,
      username: user.value.username || "",
      password: "string",
      email: user.value.email || "",
      phone: user.value.phone || "",
      role: user.value.role || "USER",
      avatar: tempAvatar.value,
      createdAt: user.value.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await updateUserById(user.value.id, updateData)
    user.value.avatar = tempAvatar.value
    ElMessage.success('头像已更新')
    showAvatarDialog.value = false
    tempAvatar.value = ''
    previewAvatar.value = ''
  } catch (err: any) {
    console.error('头像更新失败:', err)
    ElMessage.error('头像更新失败')
  } finally {
    avatarUpdating.value = false
  }
}
</script>

<style scoped>
.profile-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f2ff 50%, #f5f8ff 100%);
  padding: 20px;
  font-family: 'HarmonyOS Sans', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
  /* 更现代的字体 */
}

.profile-card {
  width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.banner-bg {
  background: linear-gradient(135deg, #a8d5ff 0%, #b8e0ff 100%);
  height: 100px;
}

.profile-header {
  text-align: center;
  margin-top: -50px;
  padding: 20px;
  background: white;
  position: relative;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.avatar {
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.avatar-overlay:hover {
  background: #337ecc;
  transform: scale(1.1);
}

.username {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.email {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 16px;
}

.user-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-form {
  padding: 0 30px 20px;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 14px;
}

.strength-bar {
  width: 100px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  width: 33%;
  background: #f56c6c;
}

.strength-fill.medium {
  width: 66%;
  background: #e6a23c;
}

.strength-fill.strong {
  width: 100%;
  background: #67c23a;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.profile-info {
  padding: 0 30px 30px;
}

.info-grid {
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
}

.info-content {
  flex: 1;
}

.label {
  display: block;
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 2px;
}

.value {
  display: block;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-btn,
.avatar-btn,
.password-btn {
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: 500;
  font-size: 14px;
}

.edit-btn {
  background: linear-gradient(90deg, #7ecbff 0%, #45aaff 100%);
}

.password-btn {
  background: linear-gradient(90deg, #ffe080 0%, #ffbc42 100%);
}

.avatar-btn {
  background: linear-gradient(90deg, #b6f0c1 0%, #5edc8a 100%);
}


.avatar-dialog .avatar-preview {
  text-align: center;
  margin-bottom: 20px;
}

.preset-avatars {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-avatar {
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.preset-avatar:hover {
  border-color: #409eff;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .profile-card {
    width: 100%;
    max-width: 400px;
  }

  .profile-form {
    padding: 0 20px 20px;
  }

  .profile-info {
    padding: 0 20px 20px;
  }
}
</style>