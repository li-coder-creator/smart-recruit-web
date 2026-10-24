<template>
  <el-config-provider :locale="zhCn">
    <main class="company-page">
      <header class="cp-page-head">
        <div>
          <div class="cp-breadcrumb">岗位浏览 / 企业主页</div>
          <h1>企业主页</h1>
        </div>
        <div class="cp-actions">
          <el-button @click="router.push('/layout/job')">返回岗位浏览</el-button
          ><el-button :disabled="loading" @click="load">刷新主页</el-button>
        </div>
      </header>
      <el-skeleton v-if="loading" :rows="12" animated /><el-result
        v-else-if="error"
        icon="warning"
        title="企业主页暂不可用"
        :sub-title="error"
        ><template #extra><el-button @click="load">重新读取</el-button></template></el-result
      ><CompanyPublicContent
        v-else-if="company"
        :company="company"
        :jobs="jobs"
        :jobs-error="jobsError"
        :jobs-loading="jobsLoading"
        :page="page"
        :total="total"
        @page="loadJobs"
      />
    </main>
  </el-config-provider>
</template>
<script setup>
import { ref, watch } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useRoute, useRouter } from 'vue-router'
import CompanyPublicContent from '@/components/company/CompanyPublicContent.vue'
import { getPublicCompany, getPublicCompanyJobs } from '@/api/company'
import { COMPANY_PAGE } from '@/constants/company'
import { companyError } from '@/utils/company'
import '@/assets/company.css'
const route = useRoute(),
  router = useRouter()
const company = ref(null),
  loading = ref(false),
  error = ref(''),
  jobs = ref([]),
  total = ref(0),
  page = ref(COMPANY_PAGE.FIRST),
  jobsLoading = ref(false),
  jobsError = ref('')
let profileGeneration = 0,
  jobGeneration = 0
async function load() {
  const current = ++profileGeneration,
    id = route.params.id
  ++jobGeneration
  company.value = null
  jobs.value = []
  total.value = 0
  loading.value = true
  error.value = ''
  if (!/^\d+$/.test(String(id)) || Number(id) <= 0) {
    error.value = '企业 ID 不正确'
    loading.value = false
    return
  }
  try {
    const response = await getPublicCompany(id)
    if (current === profileGeneration) {
      company.value = response.data.data
      loadJobs(COMPANY_PAGE.FIRST)
    }
  } catch (e) {
    if (current === profileGeneration) error.value = companyError(e)
  } finally {
    if (current === profileGeneration) loading.value = false
  }
}
async function loadJobs(value = COMPANY_PAGE.FIRST) {
  const current = ++jobGeneration,
    id = route.params.id
  page.value = value
  jobsLoading.value = true
  jobsError.value = ''
  jobs.value = []
  try {
    const response = await getPublicCompanyJobs(id, {
      page: value,
      pageSize: COMPANY_PAGE.JOB_PREVIEW_SIZE,
    })
    if (current === jobGeneration) {
      jobs.value = response.data.data.items
      total.value = response.data.data.total
    }
  } catch (e) {
    if (current === jobGeneration) jobsError.value = companyError(e)
  } finally {
    if (current === jobGeneration) jobsLoading.value = false
  }
}
watch(() => route.params.id, load, { immediate: true })
</script>
