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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
