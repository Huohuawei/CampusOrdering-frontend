<template>
  <div class="reviews-container">
    <h2>评价管理</h2>
    
    <!-- 评价列表 -->
    <el-table :data="reviews" style="width: 100%">
      <el-table-column prop="id" label="评价ID" width="80" />
      <el-table-column prop="orderId" label="订单号" width="120" />
      <el-table-column prop="rating" label="评分" width="100">
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" />
      <el-table-column prop="createdAt" label="评价时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleReply(row)">
            回复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评价"
      width="500px"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMerchantReviewsStore } from '@/stores/merchant/reviews'
import type { Review } from '@/types'

const reviewsStore = useMerchantReviewsStore()
const reviews = ref<Review[]>([])
const replyDialogVisible = ref(false)
const replyForm = ref({
  reviewId: 0,
  content: ''
})

// 获取评价列表
const fetchReviews = async () => {
  try {
    await reviewsStore.fetchAllReviews()
    reviews.value = reviewsStore.reviews
  } catch (error) {
    ElMessage.error('获取评价列表失败')
  }
}

// 处理回复
const handleReply = (review: Review) => {
  replyForm.value = {
    reviewId: review.id,
    content: ''
  }
  replyDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
  try {
    await reviewsStore.updateReview(replyForm.value.reviewId, {
      comment: replyForm.value.content
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    fetchReviews() // 刷新列表
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.reviews-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

.reviews-container h2 {
  color: #004d80;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 25px;
  text-align: center;
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

/* 评分样式 */
:deep(.el-rate) {
  --el-rate-icon-size: 20px;
  --el-rate-icon-margin: 4px;
}

:deep(.el-rate__icon) {
  color: #e6a23c;
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border: 1px solid rgba(0, 77, 128, 0.2);
  color: #004d80;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
  background: linear-gradient(135deg, #b0d1e8 0%, #a0c8e0 100%);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* 对话框样式 */
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

/* 表单样式 */
:deep(.el-form-item__label) {
  color: #004d80;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid rgba(0, 77, 128, 0.2);
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-textarea__inner:hover) {
  border-color: #004d80;
  box-shadow: 0 0 0 1px rgba(0, 77, 128, 0.2);
}

:deep(.el-textarea__inner:focus) {
  border-color: #004d80;
  box-shadow: 0 0 0 1px rgba(0, 77, 128, 0.3);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reviews-container {
    padding: 15px;
  }
  
  .reviews-container h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  :deep(.el-rate) {
    --el-rate-icon-size: 16px;
    --el-rate-icon-margin: 2px;
  }
}
</style>
