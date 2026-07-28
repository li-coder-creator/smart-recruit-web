<template>

  <div class="job-container">

    <h2>岗位管理</h2>

    <!-- 发布岗位 -->
    <el-button
        type="primary"
        @click="goToAddJob"
    >
        发布岗位
    </el-button>

    <!-- 岗位列表 -->
    <div class="job-list">

      <el-card
          v-for="job in jobList"
          :key="job.id"
          class="job-card"
      >

        <h3>{{job.title}}</h3>

        <p>城市：{{ job.city }}</p>

        <p>
          薪资：
          {{ job.salaryMin }} - {{job.salaryMax}}
        </p>

        <p>经验：{{ job.experience }}</p>

        <p>学历：{{ job.education }}</p>

        <!-- 编辑 -->
        <el-button
            type="primary"
            @click="goToEditJob(job.id)"
        >
            编辑
        </el-button>

        <!-- 删除 -->
        <el-button
            type="danger"
            @click="handleDelete(job.id)"
        >
            删除
        </el-button>
        <el-button
            type="primary"
            @click="goToJobInfo(job.id)"
        >
            查看详情
        </el-button>

      </el-card>

    </div>

  </div>

</template>
<script setup>

import { ref, onMounted } from 'vue'

import {
    getJobList,
    deleteJob
} from '@/api/job'

import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const jobList = ref([])

// 查询岗位列表
const loadJobList = async () => {

    try {

        const res = await getJobList()

        if (res.data.code === 200) {

            jobList.value = res.data.data

        }

    } catch (e) {

        console.error(e)

    }

}

// 删除岗位
const handleDelete = async (id) => {

    try {

        const res = await deleteJob(id)

        if (res.data.code === 200) {

            ElMessage.success('删除成功')

            await loadJobList()

        }

    } catch (e) {

        console.error(e)

    }

}

// 跳转到新增岗位
const goToAddJob = () => {

    router.push('/job/add')

}

// 跳转到编辑岗位
const goToEditJob = (id) => {

    router.push(`/job/edit?id=${id}`)

}
// 跳转到岗位详情
const goToJobInfo = (id) => {

    router.push(`/job/info?id=${id}`)

}

// 页面加载
onMounted(() => {

    loadJobList()

})

</script>