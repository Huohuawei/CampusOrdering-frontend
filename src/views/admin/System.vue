<template>
  <div class="system-container">
    <el-tabs v-model="activeTab" class="system-tabs">
      <el-tab-pane label="基本设置" name="basic">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>系统基本设置</span>
            </div>
          </template>
          <el-form
            ref="basicFormRef"
            :model="basicSettings"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="logo-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicSettings.logo" :src="basicSettings.logo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="系统描述" prop="description">
              <el-input
                v-model="basicSettings.description"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="basicSettings.contactPhone" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="basicSettings.contactEmail" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSave">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          <el-form
            ref="securityFormRef"
            :model="securitySettings"
            :rules="securityRules"
            label-width="120px"
          >
            <el-form-item label="密码策略">
              <el-checkbox-group v-model="securitySettings.passwordPolicy">
                <el-checkbox label="uppercase">必须包含大写字母</el-checkbox>
                <el-checkbox label="lowercase">必须包含小写字母</el-checkbox>
                <el-checkbox label="number">必须包含数字</el-checkbox>
                <el-checkbox label="special">必须包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="最小密码长度" prop="minPasswordLength">
              <el-input-number
                v-model="securitySettings.minPasswordLength"
                :min="6"
                :max="20"
              />
            </el-form-item>
            <el-form-item label="登录失败限制" prop="loginAttempts">
              <el-input-number
                v-model="securitySettings.loginAttempts"
                :min="3"
                :max="10"
              />
              <span class="form-tip">次后锁定账号</span>
            </el-form-item>
            <el-form-item label="账号锁定时间" prop="lockTime">
              <el-input-number
                v-model="securitySettings.lockTime"
                :min="5"
                :max="60"
              />
              <span class="form-tip">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSecuritySave">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="通知设置" name="notification">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>通知设置</span>
            </div>
          </template>
          <el-form
            ref="notificationFormRef"
            :model="notificationSettings"
            label-width="120px"
          >
            <el-form-item label="邮件通知">
              <el-switch
                v-model="notificationSettings.emailEnabled"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
            <el-form-item label="SMTP服务器" prop="smtpServer" v-if="notificationSettings.emailEnabled">
              <el-input v-model="notificationSettings.smtpServer" />
            </el-form-item>
            <el-form-item label="SMTP端口" prop="smtpPort" v-if="notificationSettings.emailEnabled">
              <el-input-number v-model="notificationSettings.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="senderEmail" v-if="notificationSettings.emailEnabled">
              <el-input v-model="notificationSettings.senderEmail" />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch
                v-model="notificationSettings.smsEnabled"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
            <el-form-item label="短信模板" v-if="notificationSettings.smsEnabled">
              <el-input
                v-model="notificationSettings.smsTemplate"
                type="textarea"
                :rows="3"
                placeholder="支持变量：{code}验证码，{time}时间"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleNotificationSave">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="系统日志" name="logs">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>系统日志</span>
              <div class="header-actions">
                <el-date-picker
                  v-model="logDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="handleLogDateChange"
                />
                <el-button type="primary" @click="handleExportLogs">导出日志</el-button>
              </div>
            </div>
          </template>
          <el-table :data="systemLogs" style="width: 100%">
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogLevelType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="message" label="内容" />
            <el-table-column prop="operator" label="操作人" width="120" />
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalLogs"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('basic')

// 基本设置
const basicFormRef = ref<FormInstance>()
const basicSettings = reactive({
  systemName: '校园点餐系统',
  logo: '',
  description: '一个便捷的校园点餐平台',
  contactPhone: '400-123-4567',
  contactEmail: 'support@example.com'
})

const basicRules = reactive<FormRules>({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
})

// 安全设置
const securityFormRef = ref<FormInstance>()
const securitySettings = reactive({
  passwordPolicy: ['uppercase', 'number'],
  minPasswordLength: 8,
  loginAttempts: 5,
  lockTime: 30
})

const securityRules = reactive<FormRules>({
  minPasswordLength: [
    { required: true, message: '请设置最小密码长度', trigger: 'blur' }
  ],
  loginAttempts: [
    { required: true, message: '请设置登录失败限制次数', trigger: 'blur' }
  ],
  lockTime: [
    { required: true, message: '请设置账号锁定时间', trigger: 'blur' }
  ]
})

// 通知设置
const notificationFormRef = ref<FormInstance>()
const notificationSettings = reactive({
  emailEnabled: true,
  smtpServer: 'smtp.example.com',
  smtpPort: 465,
  senderEmail: 'noreply@example.com',
  smsEnabled: false,
  smsTemplate: '您的验证码是：{code}，{time}分钟内有效。'
})

// 系统日志
const logDateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(100)

const systemLogs = ref([
  {
    timestamp: '2024-03-15 10:00:00',
    level: 'INFO',
    module: '用户管理',
    message: '用户登录成功',
    operator: 'admin'
  },
  {
    timestamp: '2024-03-15 09:55:00',
    level: 'WARNING',
    module: '系统安全',
    message: '检测到异常登录尝试',
    operator: 'system'
  },
  {
    timestamp: '2024-03-15 09:50:00',
    level: 'ERROR',
    module: '订单系统',
    message: '订单支付失败',
    operator: 'user123'
  }
])

// Logo上传相关
const handleLogoSuccess = (response: any) => {
  basicSettings.logo = response.url
  ElMessage.success('Logo上传成功')
}

const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 保存基本设置
const handleBasicSave = async () => {
  if (!basicFormRef.value) return
  
  await basicFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API保存设置
      ElMessage.success('基本设置保存成功')
    }
  })
}

// 保存安全设置
const handleSecuritySave = async () => {
  if (!securityFormRef.value) return
  
  await securityFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API保存设置
      ElMessage.success('安全设置保存成功')
    }
  })
}

// 保存通知设置
const handleNotificationSave = async () => {
  if (!notificationFormRef.value) return
  
  await notificationFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API保存设置
      ElMessage.success('通知设置保存成功')
    }
  })
}

// 处理日志日期变化
const handleLogDateChange = () => {
  // TODO: 根据日期范围重新获取日志
  console.log('日志日期范围变化:', logDateRange.value)
}

// 导出日志
const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取日志级别对应的标签类型
const getLogLevelType = (level: string) => {
  const typeMap: Record<string, string> = {
    'INFO': 'success',
    'WARNING': 'warning',
    'ERROR': 'danger'
  }
  return typeMap[level] || 'info'
}
</script>

<style scoped>
.system-container {
  padding: 20px;
}

.system-tabs {
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  border: 1px solid rgba(0, 92, 75, 0.1);
  padding: 20px;
}

.system-tabs :deep(.el-tabs__header) {
  margin-bottom: 25px;
}

.system-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: rgba(0, 92, 75, 0.1);
}

.system-tabs :deep(.el-tabs__item) {
  color: #666;
  font-size: 16px;
  padding: 0 25px;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s;
}

.system-tabs :deep(.el-tabs__item.is-active) {
  color: #005c4b;
  font-weight: 600;
}

.system-tabs :deep(.el-tabs__item:hover) {
  color: #005c4b;
}

.system-tabs :deep(.el-tabs__active-bar) {
  background-color: #005c4b;
  height: 3px;
  border-radius: 3px;
}

.setting-card {
  border-radius: 15px;
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  transition: all 0.3s;
  margin-bottom: 20px;
}

.setting-card:hover {
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.setting-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #f8faf9 0%, #e6f0ec 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  color: #005c4b;
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.setting-card :deep(.el-form) {
  padding: 20px;
}

.setting-card :deep(.el-form-item__label) {
  color: #005c4b;
  font-weight: 500;
}

.setting-card :deep(.el-input__wrapper),
.setting-card :deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 92, 75, 0.1);
  transition: all 0.3s;
}

.setting-card :deep(.el-input__wrapper:hover),
.setting-card :deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.15);
}

.setting-card :deep(.el-input__inner) {
  color: #005c4b;
}

.setting-card :deep(.el-button) {
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 500;
  transition: all 0.3s;
}

.setting-card :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.15);
}

/* Logo上传样式 */
.logo-uploader {
  border: 2px dashed rgba(0, 92, 75, 0.2);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.logo-uploader:hover {
  border-color: #005c4b;
  background: #f8faf9;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #90c3b5;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.logo {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}

/* 系统日志表格样式 */
.setting-card :deep(.el-table) {
  --el-table-border-color: rgba(0, 92, 75, 0.1);
  --el-table-header-bg-color: #f8faf9;
  --el-table-row-hover-bg-color: #e6f0ec;
}

.setting-card :deep(.el-table th) {
  background-color: #f8faf9;
  color: #005c4b;
  font-weight: 600;
}

.setting-card :deep(.el-table td) {
  color: #666;
}

.setting-card :deep(.el-tag) {
  border-radius: 12px;
  padding: 0 12px;
  height: 24px;
  line-height: 24px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-button-bg-color: #f8faf9;
  --el-pagination-hover-color: #005c4b;
}

.pagination-container :deep(.el-pagination .el-pagination__total) {
  color: #005c4b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-container {
    padding: 10px;
  }

  .system-tabs {
    padding: 15px;
  }

  .system-tabs :deep(.el-tabs__item) {
    padding: 0 15px;
    font-size: 14px;
  }

  .setting-card :deep(.el-form) {
    padding: 15px;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-actions :deep(.el-date-editor) {
    width: 100%;
  }

  .setting-card :deep(.el-button) {
    padding: 10px 20px;
  }
}
</style> 