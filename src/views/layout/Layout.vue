<template>

  <el-container style="height:100vh">

    <el-header class="header">

      <div class="logo">

        Smart Recruit

      </div>

      <div>

          <el-button
          type="primary"
          size="small"
          @click="goToUserInfo"
        >
            个人中心
        </el-button>

        <el-button
            type="danger"
            size="small"
            @click="logout"
        >
            退出登录
        </el-button>

      </div>

    </el-header>

    <el-container>

      <el-aside width="220px">

        <el-menu
           router
           :default-active="activeMenu"
        >

          <el-menu-item index="/layout/home">

            首页

          </el-menu-item>

          <el-menu-item
              index="/layout/resume"
          >
              简历管理
          </el-menu-item>

          <el-menu-item 
              index="/layout/job"
          >
            岗位管理

          </el-menu-item>

          <el-menu-item 
              index="/layout/application"
          >

            收到的简历

          </el-menu-item>

        </el-menu>

      </el-aside>

     <el-main>

        <router-view />

     </el-main>

    </el-container>

  </el-container>

</template>

<script setup>

import { reactive,onMounted ,computed} from "vue"

import { getUserInfo } from "@/api/user"

import { ElMessage } from "element-plus"

import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {

  return route.path

})

const user=reactive({

    username:""

})

const loadUser=async()=>{

    try{

        const res=await getUserInfo()

        user.username=res.data.data.username

    }catch(e){

        ElMessage.error("获取用户失败")

    }

}

const logout=()=>{

    localStorage.removeItem("token")

    router.push("/login")

}

onMounted(()=>{

    loadUser()

})

const goToUserInfo = () => {
    router.push('/layout/user/info')
}

</script>

<style scoped>

.header{

    background:#409EFF;

    color:white;

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.logo{

    font-size:22px;

    font-weight:bold;

}

</style>