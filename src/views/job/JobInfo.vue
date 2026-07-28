<template>

  <div class="job-info-container">

    <h2>岗位详情</h2>

    <!-- 岗位名称 -->
    <h3>{{ job.title }}</h3>

    <!-- 岗位描述 -->
    <p>岗位描述：{{ job.description }}</p>

    <!-- 工作城市 -->
    <p>工作城市：{{ job.city }}</p>

    <!-- 薪资 -->
    <p>
      薪资：
      {{ job.salaryMin}} -
      {{ job.salaryMax}}
    </p>

    <!-- 经验要求 -->
    <p>经验要求：{{ job.experience }}</p>

    <!-- 学历要求 -->
    <p>学历要求：{{ job.education }}</p>

    <el-button
        type="primary"
        @click="goToApply"
    >
      立即投递
    </el-button>

    <el-button
        @click="goBack"
    >
      返回
    </el-button>

  </div>
    <el-dialog
        v-model="applyDialogVisible"
        title="选择简历"
        width="500px"
    >

        <el-radio-group v-model="selectedResumeId">

            <div
                v-for="resume in resumeList"
                :key="resume.id"
            >

                <el-radio :value="resume.id">

                    {{ resume.title }}

                </el-radio>

            </div>

        </el-radio-group>

        <template #footer>

            <el-button @click="applyDialogVisible = false">
                取消
            </el-button>

            <el-button
                type="primary"
                @click="handleApply"
            >
                确认投递
            </el-button>

    </template>

</el-dialog>

</template>
<script setup>

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { getJobDetail } from '@/api/job'
import { getResumeList } from '@/api/resume'
import { applyJob } from '@/api/application'

const route = useRoute()
const router = useRouter()

// 岗位详情
const job = ref({})

// 获取岗位详情
const loadJobDetail = async () => {

    const id = route.query.id

    if (!id) {
        return
    }

    try {

        const res = await getJobDetail(id)

        if (res.data.code === 200) {

            job.value = res.data.data
        }

    } catch (e) {

        console.error(e)

    }

}
// 简历列表
const resumeList = ref([])

// 是否显示投递弹窗
const applyDialogVisible = ref(false)

// 当前选择的简历ID
const selectedResumeId = ref(null)

// 点击立即投递
const goToApply = async () => {

    try {

        const res = await getResumeList()

        if (res.data.code === 200) {

            resumeList.value = res.data.data

            applyDialogVisible.value = true
           
        }

    } catch (e) {

        console.error(e)

    }

}
// 确认投递
const handleApply = async () => {

    if (!selectedResumeId.value) {

        // 这里需要提示用户选择简历
        ElMessage.warning('请选择一份简历')
        return

    }

    try {

        const res = await applyJob({
            jobId: route.query.id,
            resumeId: selectedResumeId.value
        })

        if (res.data.code === 200) {

            ElMessage.success('投递成功')

            applyDialogVisible.value = false

            selectedResumeId.value = null

        }

    } catch (e) {

        console.error(e)

    }

}

// 返回岗位列表
const goBack = () => {

    router.push('/job')

}

// 页面加载
onMounted(() => {

    loadJobDetail()

})

</script>