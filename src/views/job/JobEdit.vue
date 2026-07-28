<template>

  <div class="job-edit-container">

    <h2>发布 / 编辑岗位</h2>

    <el-form>

      <el-form-item label="岗位名称">

        <el-input
            v-model="jobForm.title"
            placeholder="请输入岗位名称"
        />

      </el-form-item>


      <el-form-item label="岗位描述">

        <el-input
            v-model="jobForm.description"
            type="textarea"
            placeholder="请输入岗位描述"
        />

      </el-form-item>


      <el-form-item label="最低薪资">

        <el-input
            v-model="jobForm.salaryMin"
            placeholder="请输入最低薪资"
        />

      </el-form-item>


      <el-form-item label="最高薪资">

        <el-input
            v-model="jobForm.salaryMax"
            placeholder="请输入最高薪资"
        />

      </el-form-item>


      <el-form-item label="工作城市">

        <el-input
            v-model="jobForm.city"
            placeholder="请输入工作城市"
        />

      </el-form-item>


      <el-form-item label="经验要求">

        <el-input
            v-model="jobForm.experience"
            placeholder="例如：1-3年"
        />

      </el-form-item>


      <el-form-item label="学历要求">

        <el-input
            v-model="jobForm.education"
            placeholder="例如：本科"
        />

      </el-form-item>
       <el-form-item label="岗位状态">

        <el-input
            v-model="jobForm.status"
            placeholder="例如:1：招聘中，0：暂停招聘"
        />

      </el-form-item>


      <el-form-item>

        <el-button
            type="primary"
            @click="handleSave"
        >
            保存
        </el-button>

        <el-button
            @click="goBack"
        >
            返回
        </el-button>

      </el-form-item>

    </el-form>

  </div>

</template>
<script setup>
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

import {
    addJob,
    getJobDetail,
    updateJob
} from '@/api/job'

const router = useRouter()
const route = useRoute()
const jobForm = reactive({

    id: null,

    title: '',

    description: '',

    salaryMin: null,

    salaryMax: null,

    city: '',

    experience: '',

    education: '',

    status: ''

})
const handleSave = async () => {

    try {

        let res

        if (route.query.id) {

            // 编辑
            res = await updateJob(jobForm)

        } else {

            // 新增
            res = await addJob(jobForm)

        }

        if (res.data.code === 200) {

            ElMessage.success('保存成功')

            router.push('/job')

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('保存失败')

    }

}
// 加载岗位详情，用于编辑页面回显
const loadJobDetail = async () => {

    const id = route.query.id

    // 没有 id，说明是新增岗位
    if (!id) {
        return
    }

    try {

        const res = await getJobDetail(id)

        if (res.data.code === 200) {

            jobForm.id = res.data.data.id

            jobForm.title = res.data.data.title

            jobForm.description = res.data.data.description

            jobForm.salaryMin = res.data.data.salaryMin

            jobForm.salaryMax = res.data.data.salaryMax

            jobForm.city = res.data.data.city

            jobForm.experience = res.data.data.experience

            jobForm.education = res.data.data.education

            jobForm.status=res.data.data.status

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('获取岗位失败')

    }

}

const goBack = () => {
    router.push('/job')
}
// 页面加载完成后执行
onMounted(() => {

    loadJobDetail()

})

</script>