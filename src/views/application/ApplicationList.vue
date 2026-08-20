<template>

  <div class="application-container">

   <h2>{{ pageTitle }}</h2>

    <!-- 投递列表 -->
    <div class="application-list">

      <el-card
          v-for="application in applicationList"
          :key="application.id"
          class="application-card"
      >

        <h3>
        {{ application.jobTitle }}
        </h3>

        <p v-if="userStore.role === 'COMPANY'">
          求职者：{{ application.username }}
        </p>

        <p>
          公司：{{ application.companyName }}
        </p>

        <p>
          简历：{{ application.resumeTitle }}
        </p>

        <p>
          投递状态：{{ application.statusText }}
        </p>

        <p>
          投递时间：{{ application.createTime }}
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

import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

import {  getApplicationList,getJobseekerApplication  } from '@/api/application'
const userStore = useUserStore()

const isCompany = computed(() => {
    return userStore.role === 'COMPANY'
})

const pageTitle = computed(() => {
    return isCompany.value ? '收到的简历' : '我的投递'
})

const router = useRouter()


// 投递列表
const applicationList = ref([])


// 获取投递列表
const loadApplicationList = async () => {

    try {

        let res

        if (userStore.role === 'JOB_SEEKER') {

            // 求职者：查询我的投递
            res = await getJobseekerApplication()

        } else if (userStore.role === 'COMPANY') {

            // 企业：查询收到的投递
            res = await getApplicationList()

        } else {

            return

        }

        if (res.data.code === 200) {

            applicationList.value = res.data.data

        }

    } catch (e) {

        console.error(e)

    }

}


// 查看投递详情
const goToApplicationDetail = (id) => {

    router.push(`/layout/application/info?id=${id}`)

}


// 页面加载
onMounted(() => {

    loadApplicationList()

})

</script>