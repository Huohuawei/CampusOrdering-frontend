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
      class="dish-dialog"
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
          <el-input
            v-model="dishForm.imageUrl"
            placeholder="请输入图片URL地址"
          />
          <div class="image-preview" v-if="dishForm.imageUrl">
            <el-image
              :src="dishForm.imageUrl"
              fit="cover"
              class="preview-image"
            />
          </div>
          <div class="image-tip">请输入图片URL地址，建议尺寸：800x600px</div>
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
import type { Dish, Merchant } from '@/types'

const dishesStore = useMerchantDishesStore()
const merchantStore = useMerchantShopStore()

// 移除模拟商家数据
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const dishForm = ref<Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>>({
  merchant: merchantStore.currentMerchant as Merchant,
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
    { pattern: /^https?:\/\/.+/, message: '请输入有效的图片URL地址', trigger: 'blur' }
  ]
}

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    if (!merchantStore.currentMerchant?.id) {
      throw new Error('当前商家信息不存在')
    }
    await dishesStore.fetchMerchantDishes(merchantStore.currentMerchant.id)
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
    merchant: merchantStore.currentMerchant as Merchant,
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

onMounted(async () => {
  try {
    // 获取当前商家信息
    await merchantStore.getCurrentMerchant()
    // 获取菜品列表
    await fetchDishes()
  } catch (error) {
    ElMessage.error('初始化失败')
  }
})
</script>

<style scoped>
.menu-management {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  color: #004d80;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.ml-4 {
  margin-left: 15px;
}

/* 表格样式 */
:deep(.el-table) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%) !important;
  color: #004d80;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 77, 128, 0.1);
}

:deep(.el-table tr:hover > td) {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%) !important;
}

.dish-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 77, 128, 0.2);
}

/* 按钮组样式 */
:deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
}

/* 对话框样式 */
:deep(.dish-dialog) {
  width: 600px;
}

:deep(.el-dialog) {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 77, 128, 0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
}

:deep(.el-dialog__title) {
  color: #004d80;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 25px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid rgba(0, 77, 128, 0.1);
}

/* 图片预览样式 */
.image-preview {
  margin-top: 10px;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 77, 128, 0.2);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-tip {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .menu-management {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .dish-image {
    width: 60px;
    height: 60px;
  }
  
  :deep(.el-button-group) {
    flex-wrap: wrap;
  }
}
</style> 