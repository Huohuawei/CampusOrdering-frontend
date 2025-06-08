<template>
  <div class="profile">
    <h2>商家信息</h2>

    <el-card class="profile-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="profile-form"
      >
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="form.storeName" />
        </el-form-item>

        <el-form-item label="店铺简介" prop="storeDescription">
          <el-input
            v-model="form.storeDescription"
            type="textarea"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="店铺地址" prop="storeAddress">
          <el-input v-model="form.storeAddress" />
        </el-form-item>

        <el-form-item label="营业时间" prop="businessHours">
          <el-time-picker
            v-model="form.businessHours"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="店铺封面" prop="coverImage">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="微信收款码" prop="wechatQr">
          <el-upload
            class="qr-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleWechatQrSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="form.wechatQr" :src="form.wechatQr" class="qr" />
            <el-icon v-else class="qr-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="支付宝收款码" prop="alipayQr">
          <el-upload
            class="qr-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAlipayQrSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="form.alipayQr" :src="form.alipayQr" class="qr" />
            <el-icon v-else class="qr-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import type { Merchant } from '@/types'

const shopStore = useMerchantShopStore()
const formRef = ref<FormInstance>()

const form = ref({
  storeName: '',
  storeDescription: '',
  storeAddress: '',
  businessHours: [] as [Date, Date],
  phone: '',
  coverImage: '',
  wechatQr: '',
  alipayQr: ''
})

const rules: FormRules = {
  storeName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  storeDescription: [
    { required: true, message: '请输入店铺简介', trigger: 'blur' },
    { max: 500, message: '不能超过 500 个字符', trigger: 'blur' }
  ],
  storeAddress: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  businessHours: [
    { required: true, message: '请选择营业时间', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取商家信息
const fetchMerchantInfo = async () => {
  try {
    const merchant = await shopStore.getCurrentMerchant()
    if (merchant) {
      form.value = {
        storeName: merchant.storeName,
        storeDescription: merchant.storeDescription,
        storeAddress: merchant.storeAddress,
        businessHours: [
          new Date(`2000-01-01 ${merchant.businessHours.split('-')[0]}`),
          new Date(`2000-01-01 ${merchant.businessHours.split('-')[1]}`)
        ],
        phone: merchant.phone,
        coverImage: merchant.coverImage,
        wechatQr: merchant.wechatQr,
        alipayQr: merchant.alipayQr
      }
    }
  } catch (error) {
    ElMessage.error('获取商家信息失败')
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const [start, end] = form.value.businessHours
        const businessHours = `${start.getHours()}:${start.getMinutes()}-${end.getHours()}:${end.getMinutes()}`
        
        await shopStore.updateMerchant({
          ...form.value,
          businessHours
        })
        
        ElMessage.success('保存成功')
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
  })
}

// 处理图片上传
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
  }

  return isImage && isLt2M
}

const handleCoverSuccess = (response: any) => {
  form.value.coverImage = response.url
}

const handleWechatQrSuccess = (response: any) => {
  form.value.wechatQr = response.url
}

const handleAlipayQrSuccess = (response: any) => {
  form.value.alipayQr = response.url
}

onMounted(() => {
  fetchMerchantInfo()
})
</script>

<style scoped>
.profile {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.profile h2 {
  color: #004d80;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 25px;
  text-align: center;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
  transition: all 0.3s;
}

.profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 77, 128, 0.15);
}

.profile-form {
  margin-top: 20px;
  padding: 20px;
}

:deep(.el-form-item__label) {
  color: #004d80;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid rgba(0, 77, 128, 0.2);
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: #004d80;
  box-shadow: 0 0 0 1px rgba(0, 77, 128, 0.2);
}

:deep(.el-input__wrapper:focus-within),
:deep(.el-textarea__inner:focus) {
  border-color: #004d80;
  box-shadow: 0 0 0 1px rgba(0, 77, 128, 0.3);
}

:deep(.el-time-picker) {
  width: 100%;
}

.avatar-uploader,
.qr-uploader {
  border: 2px dashed rgba(0, 77, 128, 0.2);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.avatar-uploader:hover,
.qr-uploader:hover {
  border-color: #004d80;
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
}

.avatar {
  width: 178px;
  height: 178px;
  object-fit: cover;
  border-radius: 8px;
}

.qr {
  width: 178px;
  height: 178px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
}

.avatar-uploader-icon,
.qr-uploader-icon {
  font-size: 28px;
  color: #004d80;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border: 1px solid rgba(0, 77, 128, 0.2);
  color: #004d80;
  font-weight: 500;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
  background: linear-gradient(135deg, #b0d1e8 0%, #a0c8e0 100%);
}

:deep(.el-button:active) {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile {
    padding: 15px;
  }
  
  .profile h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .profile-form {
    padding: 15px;
  }
  
  .avatar-uploader,
  .qr-uploader {
    width: 150px;
    height: 150px;
  }
  
  .avatar,
  .qr,
  .avatar-uploader-icon,
  .qr-uploader-icon {
    width: 150px;
    height: 150px;
    line-height: 150px;
  }
}
</style>
