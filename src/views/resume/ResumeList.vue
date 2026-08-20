<template>
  <div class="resume-container">

    <h2>我的简历</h2>

    <!-- 新增简历按钮 -->
    <el-button
        type="primary"
        @click="goToAddResume"
    >
        新增简历
    </el-button>

    <!-- 简历列表 -->
    <div class="resume-list">

        <el-card
            v-for="resume in resumeList"
            :key="resume.id"
            class="resume-card"
        >

            <h3>{{ resume.title }}</h3>

            <p>{{ resume.description  }}</p>

            <el-button
                type="primary"
                @click="goToEditResume(resume.id)"
            >
                编辑
            </el-button>
            <el-button
                type="danger"
                @click="handleDelete(resume.id)"
            >
                删除
            </el-button>

        </el-card>

    </div>

  </div>

</template>
<script setup>

import { ref, onMounted } from 'vue'

import {
    getResumeList,
    deleteResume
} from '@/api/resume'

import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const resumeList = ref([])

// 获取简历列表
const loadResumeList = async () => {

    try {

        const res = await getResumeList()

        if (res.data.code === 200) {

             resumeList.value = res.data.data

        }

    } catch (e) {

    console.error(e)

    ElMessage.error('获取简历列表失败')

}

}
//删除简历
const handleDelete = async (id) => {

    try {

        await ElMessageBox.confirm(
            '确定要删除这份简历吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        const res = await deleteResume(id)

        if (res.data.code === 200) {

            ElMessage.success('删除成功')

            await loadResumeList()

            return
        }

        ElMessage.error(res.data.message || '删除失败')

    } catch (e) {

        // 用户点击取消，不提示错误
        if (e !== 'cancel') {

            console.error(e)

            ElMessage.error('删除失败')

        }

    }

}
const goToAddResume = () => {

    router.push('/layout/resume/edit')

}
const goToEditResume = (id) => {

    router.push(`/layout/resume/edit?id=${id}`)

}
// 页面加载完成后执行
onMounted(() => {

    loadResumeList()

})

</script>