<template>

  <div class="company-edit-container">

    <el-card>

      <template #header>

        <div class="header">

          <span>编辑企业信息</span>

        </div>

      </template>


      <el-form
        :model="companyForm"
        label-width="100px"
        class="company-form"
      >

        <!-- 企业名称 -->

        <el-form-item label="企业名称">

          <el-input
            v-model="companyForm.name"
            placeholder="请输入企业名称"
            clearable
          />

        </el-form-item>


        <!-- 企业简介 -->

        <el-form-item label="企业简介">

          <el-input
            v-model="companyForm.description"
            type="textarea"
            :rows="5"
            placeholder="请输入企业简介"
            maxlength="500"
            show-word-limit
          />

        </el-form-item>


        <!-- 企业 Logo -->

        <el-form-item label="企业Logo">

          <el-input
            v-model="companyForm.logo"
            placeholder="请输入Logo地址"
            clearable
          />

        </el-form-item>


        <!-- 所在城市 -->

        <el-form-item label="所在城市">

          <el-input
            v-model="companyForm.city"
            placeholder="请输入所在城市"
            clearable
          />

        </el-form-item>


        <!-- 企业地址 -->

        <el-form-item label="企业地址">

          <el-input
            v-model="companyForm.address"
            placeholder="请输入企业详细地址"
            clearable
          />

        </el-form-item>


        <!-- 按钮 -->

        <el-form-item>

          <el-button
            type="primary"
            :loading="loading"
            @click="handleSave"
          >
            保存修改
          </el-button>

          <el-button
            @click="goBack"
          >
            返回
          </el-button>

        </el-form-item>

      </el-form>

    </el-card>

  </div>

</template>


<script setup>

import { reactive, ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import { ElMessage } from 'element-plus'

import {
  getMyCompany,
  updateCompany
} from '@/api/company'


const router = useRouter()

const loading = ref(false)


// 企业表单
const companyForm = reactive({

  name: '',

  description: '',

  logo: '',

  city: '',

  address: ''

})


// =========================
// 查询企业信息
// =========================

const loadCompany = async () => {

  try {

    const res = await getMyCompany()

    if (res.data.code === 200) {

      const company = res.data.data

      companyForm.name = company.name || ''

      companyForm.description = company.description || ''

      companyForm.logo = company.logo || ''

      companyForm.city = company.city || ''

      companyForm.address = company.address || ''

    } else {

      ElMessage.error(
        res.data.message || '获取企业信息失败'
      )

    }

  } catch (e) {

    console.error(e)

    ElMessage.error('获取企业信息失败')

  }

}


// =========================
// 保存修改
// =========================

const handleSave = async () => {

  // 企业名称不能为空
  if (!companyForm.name.trim()) {

    ElMessage.warning('企业名称不能为空')

    return

  }

  loading.value = true

  try {

    const res = await updateCompany({

      name: companyForm.name,

      description: companyForm.description,

      logo: companyForm.logo,

      city: companyForm.city,

      address: companyForm.address

    })

    if (res.data.code === 200) {

      ElMessage.success('企业信息修改成功')

      router.push('/layout/company/info')

    } else {

      ElMessage.error(
        res.data.message || '修改失败'
      )

    }

  } catch (e) {

    console.error(e)

    ElMessage.error(
      e.response?.data?.message || '修改失败'
    )

  } finally {

    loading.value = false

  }

}


// =========================
// 返回
// =========================

const goBack = () => {

  router.push('/layout/company/info')

}


onMounted(() => {

  loadCompany()

})

</script>


<style scoped>

.company-edit-container {

  padding: 10px;

}


.header {

  font-size: 18px;

  font-weight: 600;

}


.company-form {

  max-width: 700px;

}

</style>