<template>

  <div class="resume-edit-container">

    <h2>编辑简历</h2>

    <el-form>

      <el-form-item label="简历名称">
        <el-input
            v-model="resumeForm.title"
            placeholder="请输入简历名称"
        />
      </el-form-item>

      <el-form-item label="简历描述">
        <el-input
            v-model="resumeForm.description"
            type="textarea"
            placeholder="请输入简历描述"
        />
      </el-form-item>

      <el-form-item>

        <el-button
            type="primary"
            @click="handleSave"
        >
            保存
        </el-button>

        <el-button @click="goBack">
            返回
        </el-button>

      </el-form-item>

    </el-form>

  </div>

</template>

<script setup>

import { reactive ,onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter,useRoute } from 'vue-router'

import {
    addResume,
    getResumeDetail,
    updateResume
} from '@/api/resume'

//router → 负责「去哪里」
// route  → 负责「我现在在哪里、URL里有什么参数」
const router = useRouter()
const route = useRoute()

const resumeForm = reactive({
    id: null,
    title: '',
    description: ''
})

// 保存简历
const handleSave = async () => {

    try {

        let res

        if (route.query.id) {

            // 编辑
            res = await updateResume(resumeForm)

        } else {

            // 新增
            res = await addResume(resumeForm)

        }

        if (res.data.code === 200) {

            ElMessage.success('保存成功')

            router.push('/resume')

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('保存失败')

    }

}
//修改简历
const loadResumeDetail = async () => {

    const id = route.query.id

    if (!id) {
        return
    }

    try {

        const res = await getResumeDetail(id)

        if (res.data.code === 200) {

            resumeForm.id = res.data.data.id
            resumeForm.title = res.data.data.title
            resumeForm.description = res.data.data.description
            

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('获取简历失败')

    }

}
//返回按钮
const goBack = () => {
    router.push('/resume')
}
onMounted(() => {

    loadResumeDetail()

})

</script>