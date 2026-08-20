<template>

  <div class="company-info-container">

    <el-card>

      <template #header>
        <div class="header">
          <span>企业信息</span>

          <el-button
            type="primary"
            @click="handleEdit"
          >
            编辑信息
          </el-button>
        </div>
      </template>


      <el-descriptions
        :column="1"
        border
      >

        <el-descriptions-item label="企业名称">
          {{ company.name || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="企业简介">
          {{ company.description || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="所在城市">
          {{ company.city || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="企业地址">
          {{ company.address || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="认证状态">
          {{ statusText }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间">
          {{ company.createTime || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="更新时间">
          {{ company.updateTime || '-' }}
        </el-descriptions-item>

      </el-descriptions>

    </el-card>

  </div>

</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import {
  getMyCompany
} from '@/api/company'


const router = useRouter()

const company = ref({})


/**
 * 企业状态文字
 *
 * 后端返回的是：
 * PENDING
 * APPROVED
 * REJECTED
 */
const statusText = computed(() => {

  const status = company.value.status

  const statusMap = {

    PENDING: '待审核',

    APPROVED: '已认证',

    REJECTED: '已拒绝'

  }

  return statusMap[status] || '-'

})


/**
 * 查询企业信息
 */
const loadCompany = async () => {

  try {

    const res = await getMyCompany()

    if (res.data.code === 200) {

      company.value = res.data.data

    } else {

      ElMessage.error(
        res.data.message || '获取企业信息失败'
      )

    }

  } catch (e) {

    console.error(e)

    ElMessage.error('获取企业信息失败')

  }

}


/**
 * 编辑企业信息
 */
const handleEdit = () => {

  router.push('/layout/company/edit')

}


onMounted(() => {

  loadCompany()

})

</script>


<style scoped>

.company-info-container {

  padding: 10px;

}

.header {

  display: flex;

  justify-content: space-between;

  align-items: center;

}

</style>