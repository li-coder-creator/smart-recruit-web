<template>

  <div class="application-container">

    <h2>收到的简历</h2>

    <!-- 投递列表 -->
    <div class="application-list">

      <el-card
          v-for="application in applicationList"
          :key="application.id"
          class="application-card"
      >

        <h3>
          投递编号：{{ application.id }}
        </h3>

        <p>
          求职者ID：
          {{ application.userId }}
        </p>

        <p>
          岗位ID：
          {{ application.jobId }}
        </p>

        <p>
          简历ID：
          {{ application.resumeId }}
        </p>

        <p>
          投递状态：
          {{ getStatusText(application.status) }}
        </p>

        <p>
          投递时间：
          {{ application.createTime }}
        </p>

        <el-button
            type="primary"
            @click="goToApplicationDetail(application.id)"
        >
          查看详情
        </el-button>

      </el-card>

    </div>

  </div>

</template>


<script setup>

import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import { getApplicationList } from '@/api/application'


const router = useRouter()


// 投递列表
const applicationList = ref([])


// 获取投递列表
const loadApplicationList = async () => {

    try {

        const res = await getApplicationList()

        if (res.data.code === 200) {

            applicationList.value = res.data.data

        }

    } catch (e) {

        console.error(e)

    }

}


// 状态文字转换
const getStatusText = (status) => {

    const statusMap = {

        0: '待处理',

        1: '已查看',

        2: '面试',

        3: '录用',

        4: '拒绝'

    }

    return statusMap[status] || '未知状态'

}


// 查看投递详情
const goToApplicationDetail = (id) => {

    router.push(`/application/info?id=${id}`)

}


// 页面加载
onMounted(() => {

    loadApplicationList()

})

</script>