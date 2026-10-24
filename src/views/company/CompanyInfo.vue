<template>
  <el-config-provider :locale="zhCn">
    <main class="company-page">
      <header class="cp-page-head">
        <div>
          <div class="cp-breadcrumb">企业管理 / 企业档案</div>
          <h1>{{ previewMode ? '企业主页预览' : '企业信息' }}</h1>
          <p>让真实资料与工作环境，成为候选人了解你的第一步。</p>
        </div>
        <div class="cp-actions">
          <el-button :disabled="loading || editorOpen" @click="load">刷新资料</el-button
          ><el-button
            :disabled="!preview || loading || editorOpen"
            :icon="View"
            @click="togglePreview"
            >{{ previewMode ? '返回档案管理' : '求职者预览' }}</el-button
          ><el-button
            v-if="!previewMode"
            type="primary"
            :disabled="!profile || loading"
            :icon="EditPen"
            @click="openEditor('basic')"
            >编辑档案</el-button
          >
        </div>
      </header>
      <el-skeleton v-if="loading" :rows="12" animated />
      <el-result v-else-if="error" icon="error" title="企业资料暂不可用" :sub-title="error"
        ><template #extra><el-button @click="load">重新读取</el-button></template></el-result
      >
      <template v-else-if="profile && preview">
        <template v-if="previewMode"
          ><p class="cp-note">
            这是已保存资料的本人预览。{{
              profile.status !== 'APPROVED' ? '企业尚未通过入驻审核，求职者当前不可查看。' : ''
            }}
          </p>
          <CompanyPublicContent
            :company="preview"
            :jobs="jobs"
            :jobs-error="jobsError"
            :jobs-loading="jobsLoading"
            :page="jobsPage"
            :total="jobsTotal"
            @page="loadJobs"
        /></template>
        <div v-else class="cp-layout">
          <div class="cp-stack">
            <section class="cp-panel cp-identity">
              <div class="cp-avatar cp-avatar-large">
                <img
                  v-if="safeWebsite(profile.logo) && !logoFailed"
                  :src="safeWebsite(profile.logo)"
                  alt="企业 Logo"
                  @error="logoFailed = true"
                /><template v-else>{{ profile.name?.slice(0, 1) || '企' }}</template>
              </div>
              <div class="cp-identity-copy">
                <div class="cp-title-line">
                  <h2>{{ profile.name || '企业名称待完善' }}</h2>
                  <el-tag :type="profile.status === 'APPROVED' ? 'success' : 'warning'">{{
                    COMPANY_ADMISSION[profile.status] || '未知准入状态'
                  }}</el-tag>
                </div>
                <p>
                  <el-icon><Location /></el-icon> {{ profile.city || '城市待完善' }}
                </p>
                <p class="cp-prose cp-summary">{{ profile.description || '企业介绍待完善' }}</p>
                <div class="cp-tags">
                  <span
                    v-for="key in ['industry', 'employeeSize', 'financingStage']"
                    :key="key"
                    class="cp-chip"
                    >{{ companyLabel(key, profile[key]) }}</span
                  >
                </div>
              </div>
            </section>
            <el-alert
              v-if="profile.missingRequiredFields?.length"
              :title="'待完善：' + profile.missingRequiredFields.map(companyFieldLabel).join('、')"
              type="warning"
              :closable="false"
              show-icon
            />
            <CompanyTrust :company="profile" editable @edit="openEditor" /><CompanyDetails
              :company="profile"
              editable
              @edit="openEditor"
            />
            <CompanyFileManager
              :photos="preview.photos || []"
              @changed="refreshAfterFile"
            /><CompanyReviewHistory :revision="revision" />
          </div>
          <CompanyPreviewCard :company="preview" @preview="togglePreview" />
        </div>
      </template>
      <CompanyEditor
        v-if="profile"
        ref="editor"
        v-model="editorOpen"
        :profile="profile"
        :section="editorSection"
        @saved="saved"
      />
    </main>
  </el-config-provider>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, EditPen, Location } from '@element-plus/icons-vue'
import CompanyDetails from '@/components/company/CompanyDetails.vue'
import CompanyTrust from '@/components/company/CompanyTrust.vue'
import CompanyEditor from '@/components/company/CompanyEditor.vue'
import CompanyFileManager from '@/components/company/CompanyFileManager.vue'
import CompanyPreviewCard from '@/components/company/CompanyPreviewCard.vue'
import CompanyPublicContent from '@/components/company/CompanyPublicContent.vue'
import CompanyReviewHistory from '@/components/company/CompanyReviewHistory.vue'
import { getMyCompany, getCompanyPreview } from '@/api/company'
import { getCompanyJobList } from '@/api/job'
import { COMPANY_ADMISSION, COMPANY_PAGE } from '@/constants/company'
import { JOB_FILTER } from '@/constants/job'
import { companyError, companyFieldLabel, companyLabel, safeWebsite } from '@/utils/company'
import '@/assets/company.css'
const route = useRoute(),
  router = useRouter()
const profile = ref(null),
  preview = ref(null),
  loading = ref(false),
  error = ref(''),
  previewMode = ref(false),
  logoFailed = ref(false)
const editorOpen = ref(false),
  editorSection = ref('basic'),
  editor = ref(null),
  revision = ref(0)
const jobs = ref([]),
  jobsPage = ref(COMPANY_PAGE.FIRST),
  jobsTotal = ref(0),
  jobsLoading = ref(false),
  jobsError = ref('')
let generation = 0
async function load() {
  if (editorOpen.value) return
  loading.value = true
  error.value = ''
  try {
    const [a, b] = await Promise.all([getMyCompany(), getCompanyPreview()])
    profile.value = a.data.data
    preview.value = b.data.data
    revision.value++
    logoFailed.value = false
  } catch (e) {
    error.value = companyError(e)
  } finally {
    loading.value = false
  }
}
function openEditor(section = 'basic') {
  editorSection.value = section
  editorOpen.value = true
}
async function saved() {
  ElMessage.success('企业资料已保存')
  await load()
}
async function refreshAfterFile() {
  try {
    const [a, b] = await Promise.all([getMyCompany(), getCompanyPreview()])
    profile.value = a.data.data
    preview.value = b.data.data
    revision.value++
  } catch (e) {
    ElMessage.error('操作已结束，资料刷新失败：' + companyError(e))
  }
}
async function loadJobs(page = COMPANY_PAGE.FIRST) {
  const current = ++generation
  jobsPage.value = page
  jobsLoading.value = true
  jobsError.value = ''
  jobs.value = []
  try {
    const response = await getCompanyJobList({
      page,
      size: COMPANY_PAGE.JOB_PREVIEW_SIZE,
      filter: JOB_FILTER.ACTIVE,
    })
    if (current === generation) {
      jobs.value = response.data.data.items
      jobsTotal.value = response.data.data.total
    }
  } catch (e) {
    if (current === generation) jobsError.value = companyError(e)
  } finally {
    if (current === generation) jobsLoading.value = false
  }
}
function togglePreview() {
  previewMode.value = !previewMode.value
  if (previewMode.value) loadJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onMounted(async () => {
  await load()
  if (profile.value && route.query.edit === '1') {
    openEditor()
    const query = { ...route.query }
    delete query.edit
    await router.replace({ query })
  }
})
onBeforeRouteLeave(async () => {
  if (!editor.value?.dirty) return true
  try {
    await ElMessageBox.confirm('尚有未保存的企业资料，确定离开？', '离开页面', {
      type: 'warning',
      confirmButtonText: '放弃并离开',
      cancelButtonText: '继续编辑',
    })
    return true
  } catch {
    return false
  }
})
</script>
