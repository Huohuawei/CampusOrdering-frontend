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
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.profile-form {
  margin-top: 20px;
}

.avatar-uploader,
.qr-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover,
.qr-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon,
.qr-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.qr {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
