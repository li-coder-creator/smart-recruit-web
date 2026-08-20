<template>

  <div class="application-info-container">

    <h2>投递详情</h2>

    <p>
    投递编号：{{ application.id }}
    </p>

    <p v-if="userStore.role === 'COMPANY'">
    求职者：{{ application.username }}
    </p>

    <p>
    岗位：{{ application.jobTitle }}
    </p>

    <p>
    公司：{{ application.companyName }}
    </p>

    <p>
    简历：{{ application.resumeTitle }}
    </p>

    <p>
    当前状态：{{ application.statusText }}
    </p>


   <!-- 企业才能修改投递状态 -->
    <el-form-item
        v-if="userStore.role === 'COMPANY'"
        label="修改状态"
    >

    <el-select
        v-model="selectedStatus"
        placeholder="请选择投递状态"
        style="width: 200px"
    >

        <el-option
            label="待处理"
            :value="0"
        />

        <el-option
            label="已查看"
            :value="1"
        />

        <el-option
            label="面试"
            :value="2"
        />

        <el-option
            label="已录用"
            :value="3"
        />

        <el-option
            label="已拒绝"
            :value="4"
        />

    </el-select>

  <el-button
      type="primary"
      @click="handleUpdateStatus"
      style="margin-left: 10px"
  >
    更新状态
  </el-button>

</el-form-item>

    <!-- 投递时间 -->
    <p>
      投递时间：{{ application.createTime }}
    </p>

    <!-- 更新时间 -->
    <p>
      更新时间：{{ application.updateTime }}
    </p>

    <el-button
        @click="goBack"
    >
      返回
    </el-button>

  </div>

</template>

<script setup>

import { ref,  onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

import {
    getApplicationDetail,
    updateApplicationStatus
} from '@/api/application'

const userStore = useUserStore()

const route = useRoute()
const router = useRouter()

// 投递详情
const application = ref({})

// 当前选择的状态
const selectedStatus = ref(null)

// 获取投递详情
const loadApplicationDetail = async () => {

    const id = route.query.id

    if (!id) {
        return
    }

    try {

        const res = await getApplicationDetail(id)

        if (res.data.code === 200) {

            application.value = res.data.data

            // 默认选择当前状态
            selectedStatus.value = res.data.data.status

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('获取投递详情失败')

    }

}

// 修改投递状态
const handleUpdateStatus = async () => {

    if (userStore.role !== 'COMPANY') {
    return
}
    if (selectedStatus.value === null) {

        ElMessage.warning('请选择投递状态')

        return

    }

    try {

        const id = route.query.id

        const res = await updateApplicationStatus(id, {
            status: selectedStatus.value
        })

        if (res.data.code === 200) {

            ElMessage.success('状态更新成功')

            // 重新获取详情
            await loadApplicationDetail()

        } else {

            ElMessage.error(res.data.message || '状态更新失败')

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('状态更新失败')

    }

}

// 返回投递列表
const goBack = () => {

    router.push('/layout/application')

}

// 页面加载
onMounted(() => {

    loadApplicationDetail()

})

</script>