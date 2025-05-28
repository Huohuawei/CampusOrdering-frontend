<template>
  <div class="shop-management">
    <div class="header">
      <h1>店铺管理</h1>
      <el-button type="primary" @click="handleEdit" v-if="!isEditing">
        编辑信息
      </el-button>
      <div v-else>
        <el-button type="success" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>

    <el-card v-loading="loading" class="shop-info">
      <template #header>
        <div class="card-header">
          <span>店铺基本信息</span>
          <el-tag :type="getStatusType(merchantStore.currentMerchant?.status)">
            {{ getStatusText(merchantStore.currentMerchant?.status) }}
          </el-tag>
        </div>
      </template>

      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="!isEditing"
      >
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="form.storeName" />
        </el-form-item>

        <el-form-item label="店铺描述" prop="storeDescription">
          <el-input 
            v-model="form.storeDescription" 
            type="textarea" 
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="店铺地址" prop="storeAddress">
          <el-input v-model="form.storeAddress" />
        </el-form-item>

        <el-form-item label="店铺封面" prop="coverImage">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleCoverUpload"
            accept="image/*"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="微信收款码" prop="wechatQr">
          <el-upload
            class="qr-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleWechatQrUpload"
            accept="image/*"
          >
            <img v-if="form.wechatQr" :src="form.wechatQr" class="qr-image" />
            <el-icon v-else class="qr-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="支付宝收款码" prop="alipayQr">
          <el-upload
            class="qr-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleAlipayQrUpload"
            accept="image/*"
          >
            <img v-if="form.alipayQr" :src="form.alipayQr" class="qr-image" />
            <el-icon v-else class="qr-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import type { FormInstance, UploadProps } from 'element-plus'
import type { Merchant } from '@/types'

const merchantStore = useMerchantShopStore()
const loading = ref(false)
const isEditing = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  storeName: '',
  storeDescription: '',
  storeAddress: '',
  coverImage: '',
  wechatQr: '',
  alipayQr: ''
})

// 表单验证规则
const rules = {
  storeName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  storeDescription: [
    { required: true, message: '请输入店铺描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  storeAddress: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  coverImage: [
    { required: true, message: '请上传店铺封面图', trigger: 'change' }
  ],
  wechatQr: [
    { required: true, message: '请上传微信收款码', trigger: 'change' }
  ],
  alipayQr: [
    { required: true, message: '请上传支付宝收款码', trigger: 'change' }
  ]
}

// 获取商家状态类型
const getStatusType = (status?: Merchant['status']) => {
  const statusMap: Record<Merchant['status'], string> = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
  return status ? statusMap[status] : 'info'
}

// 获取商家状态文本
const getStatusText = (status?: Merchant['status']) => {
  const statusMap: Record<Merchant['status'], string> = {
    'PENDING': '审核中',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return status ? statusMap[status] : '未知'
}

// 图片上传前的验证
const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
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

// 处理店铺封面上传
const handleCoverUpload = async (options: any) => {
  try {
    // TODO: 实现图片上传逻辑
    const imageUrl = await uploadImage(options.file)
    form.coverImage = imageUrl
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 处理微信收款码上传
const handleWechatQrUpload = async (options: any) => {
  try {
    // TODO: 实现图片上传逻辑
    const imageUrl = await uploadImage(options.file)
    form.wechatQr = imageUrl
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 处理支付宝收款码上传
const handleAlipayQrUpload = async (options: any) => {
  try {
    // TODO: 实现图片上传逻辑
    const imageUrl = await uploadImage(options.file)
    form.alipayQr = imageUrl
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 模拟图片上传
const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
}

// 开始编辑
const handleEdit = () => {
  isEditing.value = true
  // 复制当前商家信息到表单
  const merchant = merchantStore.currentMerchant
  if (merchant) {
    Object.assign(form, {
      storeName: merchant.storeName,
      storeDescription: merchant.storeDescription,
      storeAddress: merchant.storeAddress,
      coverImage: merchant.coverImage,
      wechatQr: merchant.wechatQr,
      alipayQr: merchant.alipayQr
    })
  }
}

// 保存编辑
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (!merchantStore.currentMerchant?.id) {
      throw new Error('当前商家信息不存在')
    }

    await merchantStore.updateMerchant({
      ...merchantStore.currentMerchant,
      ...form
    })

    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消编辑吗？未保存的更改将会丢失', '提示', {
      type: 'warning'
    })
    isEditing.value = false
  } catch {
    // 用户取消操作
  }
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await merchantStore.getCurrentMerchant()
    // 初始化表单数据
    const merchant = merchantStore.currentMerchant
    if (merchant) {
      Object.assign(form, {
        storeName: merchant.storeName,
        storeDescription: merchant.storeDescription,
        storeAddress: merchant.storeAddress,
        coverImage: merchant.coverImage,
        wechatQr: merchant.wechatQr,
        alipayQr: merchant.alipayQr
      })
    }
  } catch (error) {
    ElMessage.error('获取商家信息失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.shop-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.shop-info {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-uploader,
.qr-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader:hover,
.qr-uploader:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon,
.qr-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.qr-image {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style> 