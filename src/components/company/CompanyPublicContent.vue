<template>
  <div>
    <section class="cp-panel cp-identity">
      <div class="cp-avatar cp-avatar-large">{{ company.name?.slice(0, 1) || '企' }}</div>
      <div class="cp-identity-copy">
        <h1>{{ company.name || '企业名称待完善' }}</h1>
        <div class="cp-tags">
          <span
            v-for="key in ['industry', 'financingStage', 'employeeSize']"
            :key="key"
            class="cp-chip"
            >{{ companyLabel(key, company[key]) }}</span
          >
        </div>
        <p>
          <el-icon><Location /></el-icon> {{ company.city || '城市待完善' }}
        </p>
      </div>
    </section>
    <div class="cp-layout cp-public-layout">
      <div class="cp-stack">
        <section class="cp-panel">
          <h2>关于我们</h2>
          <p class="cp-prose">{{ company.description || '企业介绍待完善' }}</p>
          <hr />
          <strong>办公地点</strong>
          <p>{{ company.address || '办公地址待完善' }}</p>
        </section>
        <CompanyDetails :company="company" />
        <section class="cp-panel">
          <header class="cp-section-head">
            <h2>工作环境</h2>
            <span class="cp-note">{{ company.photoCount ?? 0 }} 张照片 · 企业提供</span>
          </header>
          <div v-if="company.photos?.length" class="cp-gallery">
            <CompanyPhoto v-for="photo in company.photos" :key="photo.id" :photo="photo" />
          </div>
          <p v-else class="cp-empty">企业暂未展示办公照片</p>
        </section>
      </div>
      <aside class="cp-stack">
        <CompanyTrust :company="company" compact />
        <section class="cp-panel">
          <header class="cp-section-head">
            <h2>正在招聘</h2>
            <el-icon><Suitcase /></el-icon>
          </header>
          <el-alert v-if="jobsError" :title="jobsError" type="error" :closable="false" />
          <div v-loading="jobsLoading">
            <button
              v-for="job in jobs"
              :key="job.id"
              type="button"
              class="cp-job"
              @click="openJob(job.id)"
            >
              <strong>{{ job.title }}</strong
              ><span
                >{{ job.city || '城市待填写' }} · {{ job.experience || '经验待填写' }} ·
                {{ job.education || '学历待填写' }}</span
              ><b>{{ formatJobSalary(job) }}</b>
            </button>
            <p v-if="!jobsLoading && !jobsError && !jobs.length" class="cp-empty">暂无在招岗位</p>
          </div>
          <el-button v-if="jobsError" @click="$emit('page', page)">重新读取岗位</el-button>
          <div v-if="total" class="cp-pagination">
            <el-pagination
              size="small"
              :current-page="page"
              :page-size="pageSize"
              :total="total"
              layout="total, prev, next"
              @current-change="$emit('page', $event)"
            />
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { Location, Suitcase } from '@element-plus/icons-vue'
import CompanyDetails from './CompanyDetails.vue'
import CompanyPhoto from './CompanyPhoto.vue'
import CompanyTrust from './CompanyTrust.vue'
import { companyLabel } from '@/utils/company'
import { formatJobSalary } from '@/utils/job'
import { COMPANY_PAGE } from '@/constants/company'
defineProps({
  company: { type: Object, required: true },
  jobs: { type: Array, default: () => [] },
  jobsError: { type: String, default: '' },
  jobsLoading: Boolean,
  total: { type: Number, default: 0 },
  page: { type: Number, default: COMPANY_PAGE.FIRST },
  pageSize: { type: Number, default: COMPANY_PAGE.JOB_PREVIEW_SIZE },
})
defineEmits(['page'])
const router = useRouter()
const openJob = (id) => router.push({ path: '/layout/job/info', query: { id } })
</script>
