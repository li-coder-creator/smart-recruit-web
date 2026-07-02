<template>

  <el-container style="height:100vh">

    <el-header class="header">

      <div class="logo">

        Smart Recruit

      </div>

      <div>

        欢迎：

        {{ user.username }}

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
            default-active="1"
        >

          <el-menu-item index="1">

            首页

          </el-menu-item>

          <el-menu-item index="2">

            简历管理

          </el-menu-item>

          <el-menu-item index="3">

            岗位管理

          </el-menu-item>

          <el-menu-item index="4">

            AI 面试

          </el-menu-item>

        </el-menu>

      </el-aside>

      <el-main>

        <h2>

          欢迎来到 Smart Recruit

        </h2>

      </el-main>

    </el-container>

  </el-container>

</template>

<script setup>

import { reactive,onMounted } from "vue"

import { getUserInfo } from "@/api/user"

import { ElMessage } from "element-plus"

import { useRouter } from "vue-router"

const router=useRouter()

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