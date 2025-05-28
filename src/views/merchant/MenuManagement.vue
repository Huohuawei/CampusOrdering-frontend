<template>
  <div class="menu-management">
    <div class="header">
      <div class="header-left">
        <h1>菜单管理</h1>
        <el-tag type="info" class="ml-4">{{ merchantStore.currentMerchant?.storeName }}</el-tag>
      </div>
      <el-button type="primary" @click="showAddDishDialog">添加菜品</el-button>
    </div>

    <!-- 菜品列表 -->
    <el-table v-loading="loading" :data="dishesStore.dishes" style="width: 100%">
      <el-table-column prop="imageUrl" label="图片" width="100">
        <template #default="{ row }">
          <el-image
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
            fit="cover"
            class="dish-image"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="菜品名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="estimatedWaitTime" label="预计等待时间" width="120">
        <template #default="{ row }">
          {{ row.estimatedWaitTime }}分钟
        </template>
      </el-table-column>
      <el-table-column prop="available" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.available ? 'success' : 'info'">
            {{ row.available ? '上架中' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.available ? 'warning' : 'success'"
              @click="handleToggleAvailability(row)"
            >
              {{ row.available ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" @click="handleDelete(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑菜品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜品' : '添加菜品'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="dishForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="dishForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dishForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="dishForm.price"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="预计等待时间" prop="estimatedWaitTime">
          <el-input-number
            v-model="dishForm.estimatedWaitTime"
            :min="1"
            :max="120"
          />
          <span class="ml-2">分钟</span>
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <el-upload
            class="dish-image-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="dishForm.imageUrl" :src="dishForm.imageUrl" class="uploaded-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="image-tip">建议尺寸：800x600px，支持jpg、png格式</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useMerchantDishesStore } from '@/stores/merchant/dishes'
import { useMerchantShopStore } from '@/stores/merchant/shop'
import type { Dish } from '@/types'

const dishesStore = useMerchantDishesStore()
const merchantStore = useMerchantShopStore()

// 模拟商家数据
const mockMerchant = {
  id: 11,
  user: {
    id: 101,
    username: "test",
    password: "test",
    email: "mioikeda@gmail.com",
    phone: "52-390-8417",
    role: "MERCHANT" as const,
    avatar: "bgqoiJ72Mh",
    createdAt: "2016-09-28T10:23:31",
    updatedAt: "2025-05-23T18:10:02"
  },
  storeName: "绿色有机农场",
  storeDescription: "提供新鲜有机蔬菜、水果和农产品，直接从农场到餐桌",
  storeAddress: "北京市海淀区中关村南大街5号",
  status: "PENDING" as const,
  createdAt: "2023-01-10T08:15:22",
  updatedAt: "2025-04-27T19:39:45",
  coverImage: "https://img0.baidu.com/it/u=2554227556,3236173474&fm=253&fmt=auto&app=120&f=JPEG?w=1200&h=800",
  wechatQr: "https://example.com/qr/wechat101.png",
  alipayQr: "https://example.com/qr/alipay101.png"
}

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const dishForm = ref<Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>>({
  merchant: mockMerchant,
  name: '',
  description: '',
  price: 0,
  estimatedWaitTime: 15,
  imageUrl: '',
  available: true
})

const rules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入菜品描述', trigger: 'blur' },
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  estimatedWaitTime: [
    { required: true, message: '请输入预计等待时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 120, message: '等待时间必须在1-120分钟之间', trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '请上传菜品图片', trigger: 'change' }
  ]
}

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    await dishesStore.fetchMerchantDishes(mockMerchant.id)
  } catch (error) {
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

// 显示添加菜品对话框
const showAddDishDialog = () => {
  isEdit.value = false
  dishForm.value = {
    merchant: mockMerchant,
    name: '',
    description: '',
    price: 0,
    estimatedWaitTime: 15,
    imageUrl: '',
    available: true
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (dish: Dish) => {
  isEdit.value = true
  dishesStore.setCurrentDish(dish)
  const { id, createdAt, updatedAt, ...rest } = dish
  dishForm.value = rest
  dialogVisible.value = true
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          const currentDish = dishesStore.currentDish
          if (!currentDish) {
            ElMessage.error('当前菜品不存在')
            return
          }
          await dishesStore.updateDish(currentDish.id, dishForm.value)
          ElMessage.success('更新菜品成功')
        } else {
          await dishesStore.createDish(dishForm.value)
          ElMessage.success('添加菜品成功')
        }
        dialogVisible.value = false
        dishesStore.setCurrentDish(null)
        fetchDishes()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新菜品失败' : '添加菜品失败')
      }
    }
  })
}

// 处理删除
const handleDelete = async (dish: Dish) => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜品吗？', '提示', {
      type: 'warning'
    })
    await dishesStore.deleteDish(dish.id)
    ElMessage.success('删除菜品成功')
    fetchDishes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除菜品失败')
    }
  }
}

// 处理上下架
const handleToggleAvailability = async (dish: Dish) => {
  try {
    await dishesStore.toggleAvailability(dish.id)
    ElMessage.success(dish.available ? '上架成功' : '下架成功')
    fetchDishes()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理图片上传
const handleImageSuccess: UploadProps['onSuccess'] = (response) => {
  dishForm.value.imageUrl = response.url
}

const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

onMounted(() => {
  fetchDishes()
})
</script>

<style scoped>
.menu-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dish-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.dish-image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dish-image-uploader:hover {
  border-color: #409EFF;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.uploaded-image {
  width: 178px;
  height: 178px;
  object-fit: cover;
}

.image-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}
</style> 