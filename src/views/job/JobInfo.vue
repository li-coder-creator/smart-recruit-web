<template>
  <main class="job-detail">
    <div class="top-actions">
      <el-button link :disabled="busy" @click="router.push('/layout/job')">← 返回岗位列表</el-button
      ><el-button :disabled="busy || loading" @click="loadDetail">刷新详情</el-button>
    </div>
    <el-skeleton v-if="loading" :rows="8" animated />
    <el-result
      v-else-if="detailError"
      icon="error"
      title="岗位详情暂不可用"
      :sub-title="detailError"
      ><template #extra><el-button @click="loadDetail">重新读取</el-button></template></el-result
    >
    <div v-else-if="job" class="detail-grid" :class="{ seeker: !isCompany }">
      <article>
        <div class="surface">
          <header>
            <div>
              <h1>{{ job.title || '未命名岗位' }}</h1>
              <el-tag :type="JOB_STATUS_META[job.status]?.tagType">{{
                JOB_STATUS_META[job.status]?.label || '未知状态'
              }}</el-tag>
            </div>
            <strong class="salary">{{ formatJobSalary(job) }}</strong>
          </header>
          <p class="facts">
            {{ job.city || '城市待填写' }} · {{ job.experience || '经验待填写' }} ·
            {{ job.education || '学历待填写' }} · {{ job.employment || '用工类型待填写' }}
          </p>
          <el-button v-if="isJobSeeker && job.companyId" link @click="router.push('/layout/company/' + job.companyId + '/profile')">查看招聘企业主页</el-button>
          <div class="job-actions" v-if="isCompany">
            <el-button
              type="primary"
              :disabled="busy"
              @click="router.push({ path: '/layout/job/edit', query: { id: job.id } })"
              >编辑岗位</el-button
            >
            <el-button
              v-for="action in availableActions"
              :key="action.key"
              :type="action.danger ? 'danger' : 'default'"
              :disabled="busy"
              @click="performAction(action)"
              >{{ action.label }}</el-button
            >
          </div>
          <el-button
            v-else-if="isJobSeeker"
            type="primary"
            :disabled="busy || applied || job.status !== JOB_STATUS.ACTIVE"
            @click="openApply"
            >{{ applied ? '已投递' : '立即投递' }}</el-button
          >
          <p v-if="actionError" role="alert" class="error">{{ actionError }}</p>
          <p class="meta">
            所属团队：{{ job.team || '待分配' }} · 岗位类别：{{ job.category || '待填写' }} · 招聘
            {{ job.headcount ?? '—' }} 人
          </p>
          <p class="meta">
            更新于 {{ formatTime(job.updateTime)
            }}<template v-if="job.publishedAt">
              · 发布于 {{ formatTime(job.publishedAt) }}</template
            >
          </p>
          <section v-for="item in contentSections" :key="item.key" class="content-section">
            <h2>{{ item.label }}</h2>
            <p class="multiline">{{ job[item.key] || item.empty }}</p>
          </section>
          <section class="content-section">
            <h2>工作地点与福利</h2>
            <dl class="detail-facts">
              <div v-for="item in locationFields" :key="item.key">
                <dt>{{ item.label }}</dt>
                <dd>{{ job[item.key] || '未填写' }}</dd>
              </div>
            </dl>
          </section>
          <section v-if="job.description" class="content-section">
            <h2>历史岗位描述</h2>
            <p class="multiline">{{ job.description }}</p>
          </section>
        </div>
        <JobDetailPanel
          v-if="isCompany"
          title="操作动态"
          :state="panels.activities"
          @retry="loadPanel('activities')"
        >
          <ul v-if="panels.activities.data?.length" class="activity-list">
            <li v-for="item in panels.activities.data" :key="item.id">
              <div>
                <b>{{ item.operationText || item.operation }}</b
                ><span>{{ item.operatorName || '未填写操作者' }}</span>
              </div>
              <time>{{ formatTime(item.createTime) }}</time>
            </li>
          </ul>
          <p v-else class="muted">暂无操作记录</p>
        </JobDetailPanel>
      </article>
      <aside v-if="isCompany">
        <JobDetailPanel title="招聘进展" :state="panels.progress" @retry="loadPanel('progress')">
          <p v-if="job.status === JOB_STATUS.DRAFT" class="muted">
            尚未发布。发布后开始统计投递与面试。
          </p>
          <template v-else>
            <div class="progress-grid">
              <div>
                <strong>{{ count(panels.progress.data?.applicationCount) }}</strong
                ><span>累计投递 / 份</span>
              </div>
              <div>
                <strong>{{ count(panels.progress.data?.currentInterviewApplicationCount) }}</strong
                ><span>当前面试中 / 份</span>
              </div>
              <div>
                <strong>{{
                  panels.progress.data?.interviewConversionRate == null
                    ? '—'
                    : panels.progress.data.interviewConversionRate + '%'
                }}</strong
                ><span>面试转化率</span>
              </div>
            </div>
            <p class="pending">
              待处理新投递 <b>{{ count(panels.progress.data?.pendingApplicationCount) }}</b> 份
            </p>
            <p class="muted">
              转化率 = 累计曾进入面试的投递数 ÷ 累计投递数。无投递或历史无法核实时显示“—”。
            </p>
            <p class="muted">投递 → 筛选 → 面试 → 录用<br />流程允许向前跳过阶段。</p>
          </template>
        </JobDetailPanel>
        <JobDetailPanel title="最近投递" :state="panels.recent" @retry="loadPanel('recent')">
          <p v-if="job.status === JOB_STATUS.DRAFT" class="muted">草稿尚未开放投递。</p>
          <ul v-else-if="panels.recent.data?.length" class="recent-list">
            <li v-for="item in panels.recent.data" :key="item.applicationId">
              <el-button
                link
                type="primary"
                :disabled="busy"
                @click="
                  router.push({
                    path: '/layout/application/info',
                    query: { id: item.applicationId },
                  })
                "
                >{{ item.applicantName || '未填写姓名' }}</el-button
              >
              <span>{{ item.statusText || '未知状态' }}</span
              ><time>{{ formatTime(item.createTime) }}</time>
            </li>
          </ul>
          <p v-else class="muted">暂无投递</p>
          <p v-if="panels.recent.data?.length" class="muted">
            按投递时间倒序，展示最近 {{ PANEL_LIMIT }} 条。
          </p>
        </JobDetailPanel>
      </aside>
    </div>
    <el-dialog
      v-model="applyVisible"
      title="选择简历"
      width="min(520px, 92vw)"
      :close-on-click-modal="!applying"
      :close-on-press-escape="!applying"
      :show-close="!applying"
      @closed="resetApply"
    >
      <el-skeleton v-if="resumeLoading" :rows="3" animated />
      <div v-else-if="resumeError" role="alert">
        <p class="error">{{ resumeError }}</p>
        <el-button @click="loadResumes">重新加载简历</el-button>
      </div>
      <el-radio-group
        v-else-if="resumes.length"
        v-model="selectedResumeId"
        class="resume-options"
        :disabled="applying"
        ><el-radio v-for="resume in resumes" :key="resume.id" :value="resume.id">{{
          resume.title || '未命名简历'
        }}</el-radio></el-radio-group
      >
      <el-empty v-else description="暂无简历，请先在简历管理中创建" />
      <el-pagination
        v-if="resumeTotal > RESUME_PAGE_SIZE"
        :current-page="resumePage"
        :page-size="RESUME_PAGE_SIZE"
        :total="resumeTotal"
        layout="prev, pager, next"
        :disabled="applying || resumeLoading"
        @update:current-page="changeResumePage"
      />
      <p v-if="applyError" role="alert" class="error">{{ applyError }}</p>
      <template #footer
        ><el-button :disabled="applying" @click="applyVisible = false">取消</el-button
        ><el-button
          type="primary"
          :loading="applying"
          :disabled="resumeLoading || !!resumeError || !selectedResumeId"
          @click="submitApplication"
          >确认投递</el-button
        ></template
      >
    </el-dialog>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import JobDetailPanel from '@/components/job/JobDetailPanel.vue'
import {
  getCompanyJobDetail,
  getJobDetail,
  getJobRecruitmentProgress,
  getJobRecentApplications,
  getJobActivities,
  publishJobDraft,
  pauseJob,
  resumeJob,
  endJob,
  deleteJob,
} from '@/api/job'
import { getResumePage } from '@/api/resume'
import { applyJob } from '@/api/application'
import { useUserStore } from '@/stores/user'
import { JOB_STATUS, JOB_STATUS_META, JOB_PAGINATION } from '@/constants/job'
import { formatJobSalary } from '@/utils/job'

const PANEL_LIMIT = 5
const RESUME_PAGE_SIZE = JOB_PAGINATION.DEFAULT_SIZE
const actions = [
  {
    key: 'publish',
    label: '发布岗位',
    states: [JOB_STATUS.DRAFT],
    run: publishJobDraft,
    message: '确认发布当前已保存的岗位内容？发布后求职者可以查看并投递。',
  },
  {
    key: 'pause',
    label: '暂停招聘',
    states: [JOB_STATUS.ACTIVE],
    run: pauseJob,
    message: '确认暂停招聘？暂停后不再接受新的投递，已有投递保留。',
  },
  {
    key: 'resume',
    label: '恢复招聘',
    states: [JOB_STATUS.PAUSED],
    run: resumeJob,
    message: '确认恢复招聘？',
  },
  {
    key: 'end',
    label: '结束招聘',
    states: [JOB_STATUS.ACTIVE, JOB_STATUS.PAUSED],
    run: endJob,
    danger: true,
    message: '确认结束招聘？结束后不能恢复招聘，已有投递保留。',
  },
  {
    key: 'delete',
    label: '删除草稿',
    states: [JOB_STATUS.DRAFT],
    run: deleteJob,
    danger: true,
    message: '确认删除此草稿？删除后无法恢复。',
  },
]
const contentSections = [
  { key: 'summary', label: '岗位介绍', empty: '暂无介绍' },
  { key: 'responsibilities', label: '岗位职责', empty: '待完善岗位职责' },
  { key: 'requirements', label: '任职要求', empty: '待完善任职要求' },
  { key: 'requiredSkills', label: '必备技能', empty: '待填写' },
  { key: 'bonus', label: '加分项', empty: '暂无加分项' },
  { key: 'preferredSkills', label: '加分技能', empty: '暂无加分技能' },
]
const locationFields = [
  { key: 'city', label: '工作城市' },
  { key: 'workMode', label: '办公方式' },
  { key: 'address', label: '详细地址' },
  { key: 'benefits', label: '福利亮点' },
  { key: 'deadline', label: '计划截止日期' },
]
const router = useRouter(),
  route = useRoute(),
  userStore = useUserStore()
const isCompany = computed(() => userStore.role === 'COMPANY')
const isJobSeeker = computed(() => userStore.role === 'JOB_SEEKER')
const job = ref(null),
  loading = ref(false),
  detailError = ref(''),
  actionError = ref(''),
  acting = ref(false)
const applying = ref(false),
  applied = ref(false)
const busy = computed(() => acting.value || applying.value)
const availableActions = computed(() =>
  actions.filter((action) => action.states.includes(job.value?.status)),
)
const panels = reactive(
  Object.fromEntries(
    ['progress', 'recent', 'activities'].map((key) => [
      key,
      { loading: false, error: '', data: null },
    ]),
  ),
)
const panelApis = {
  progress: getJobRecruitmentProgress,
  recent: getJobRecentApplications,
  activities: getJobActivities,
}
const count = (value) => (value == null ? '—' : value.toLocaleString())
const formatTime = (value) => (value ? value.replace('T', ' ') : '—')
let detailSequence = 0

const loadPanel = async (key) => {
  if (!job.value || !isCompany.value || panels[key].loading) return
  const sequence = detailSequence,
    id = job.value.id,
    panel = panels[key]
  panel.loading = true
  panel.error = ''
  panel.data = null
  try {
    const response = await panelApis[key](id, { limit: PANEL_LIMIT })
    if (sequence !== detailSequence) return
    const data = response.data.data
    if (key === 'progress' ? !data || String(data.jobId) !== String(id) : !Array.isArray(data))
      throw new Error('响应格式异常')
    panel.data = data
  } catch (error) {
    if (sequence === detailSequence) panel.error = error.message || '加载失败'
  } finally {
    if (sequence === detailSequence) panel.loading = false
  }
}
const loadDetail = async () => {
  const sequence = ++detailSequence
  loading.value = true
  detailError.value = ''
  job.value = null
  applied.value = false
  applyVisible.value = false
  resetApply()
  for (const panel of Object.values(panels))
    Object.assign(panel, { loading: false, error: '', data: null })
  try {
    if (!isCompany.value && !isJobSeeker.value) throw new Error('当前角色暂无岗位详情接口')
    const id = route.query.id
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) throw new Error('岗位编号无效')
    const response = await (isCompany.value ? getCompanyJobDetail(id) : getJobDetail(id))
    if (sequence !== detailSequence) return
    if (!response.data.data || String(response.data.data.id) !== id)
      throw new Error('岗位详情响应格式异常')
    job.value = response.data.data
    // 详情先展示，三个辅助面板分别加载和重试。
    loading.value = false
    if (isCompany.value) await Promise.all(Object.keys(panels).map(loadPanel))
  } catch (error) {
    if (sequence === detailSequence) detailError.value = error.message || '详情加载失败'
  } finally {
    if (sequence === detailSequence) loading.value = false
  }
}
const performAction = async (action) => {
  if (busy.value || !job.value || !availableActions.value.includes(action)) return
  const id = job.value.id
  acting.value = true
  actionError.value = ''
  try {
    try {
      await ElMessageBox.confirm(action.message, action.label, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: action.danger ? 'warning' : 'info',
      })
    } catch {
      return
    }
    await action.run(id)
    ElMessage.success(action.label + '成功')
    if (action.key === 'delete') {
      acting.value = false
      await router.push('/layout/job')
    } else await loadDetail()
  } catch (error) {
    actionError.value = error.message || '操作结果未确认，请刷新详情核实'
  } finally {
    acting.value = false
  }
}

const applyVisible = ref(false),
  resumes = ref([]),
  resumeTotal = ref(0),
  resumePage = ref(JOB_PAGINATION.FIRST_PAGE)
const selectedResumeId = ref(null),
  resumeLoading = ref(false),
  resumeError = ref(''),
  applyError = ref('')
let resumeSequence = 0
const resetApply = () => {
  resumeSequence++
  resumes.value = []
  resumeTotal.value = 0
  selectedResumeId.value = null
  resumeLoading.value = false
  resumeError.value = ''
  applyError.value = ''
}
const loadResumes = async () => {
  const sequence = ++resumeSequence
  resumeLoading.value = true
  resumeError.value = ''
  selectedResumeId.value = null
  try {
    const response = await getResumePage({ pageNum: resumePage.value, pageSize: RESUME_PAGE_SIZE })
    if (sequence !== resumeSequence) return
    const data = response.data.data
    if (!Array.isArray(data?.items) || !Number.isSafeInteger(data.total) || data.total < 0)
      throw new Error('简历分页响应格式异常')
    resumes.value = data.items
    resumeTotal.value = data.total
  } catch (error) {
    if (sequence === resumeSequence) resumeError.value = error.message || '简历加载失败'
  } finally {
    if (sequence === resumeSequence) resumeLoading.value = false
  }
}
const changeResumePage = (value) => {
  resumePage.value = value
  return loadResumes()
}
const openApply = () => {
  if (busy.value || !job.value) return
  resetApply()
  resumePage.value = JOB_PAGINATION.FIRST_PAGE
  applyVisible.value = true
  return loadResumes()
}
const submitApplication = async () => {
  if (busy.value || !selectedResumeId.value || resumeLoading.value || resumeError.value) return
  applying.value = true
  applyError.value = ''
  try {
    await applyJob({ jobId: job.value.id, resumeId: selectedResumeId.value })
    applied.value = true
    applyVisible.value = false
    ElMessage.success('投递成功')
  } catch (error) {
    applyError.value = error.message || '投递结果未确认，请到我的投递中核实'
  } finally {
    applying.value = false
  }
}
// 公共拦截器收到 401 时，允许离开当前操作并进入登录页。
onBeforeRouteLeave((to) => !busy.value || to.path === '/login')
onBeforeRouteUpdate(() => !busy.value)
watch(
  () => route.fullPath,
  () => {
    actionError.value = ''
    loadDetail()
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  detailSequence++
  resumeSequence++
})
</script>

<style scoped>
.job-detail {
  max-width: 1240px;
  margin: 0 auto 36px;
  color: #34475d;
  --el-color-primary: #0aa88d;
}
.top-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: start;
}
.detail-grid.seeker {
  grid-template-columns: 1fr;
  max-width: 960px;
  margin: auto;
}
.surface {
  background: white;
  border: 1px solid #e0e9ee;
  border-radius: 10px;
  padding: 28px;
  margin-bottom: 20px;
  overflow-wrap: anywhere;
}
header,
header > div {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
header {
  justify-content: space-between;
}
h1 {
  font-size: 26px;
  margin: 0;
  color: #20384c;
}
h2 {
  font-size: 18px;
  margin: 0 0 16px;
  color: #20384c;
}
.salary {
  color: #078f76;
  font-size: 21px;
}
.facts,
.meta,
.muted {
  color: #718497;
  font-size: 13px;
  line-height: 1.8;
}
.job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}
.job-actions :deep(.el-button) {
  margin: 0;
}
.content-section {
  border-top: 1px solid #edf1f4;
  margin-top: 24px;
  padding-top: 24px;
}
.multiline {
  white-space: pre-wrap;
  line-height: 1.9;
  font-size: 14px;
}
.detail-facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
dt {
  color: #718497;
  font-size: 12px;
}
dd {
  margin: 7px 0 0;
  font-size: 14px;
}
.progress-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.progress-grid strong {
  display: block;
  color: #078f76;
  font-size: 24px;
  overflow-wrap: anywhere;
}
.progress-grid span {
  font-size: 11px;
  color: #718497;
}
.pending {
  background: #eefaf6;
  padding: 12px;
  font-size: 13px;
  border-radius: 6px;
}
.activity-list,
.recent-list {
  padding: 0;
  list-style: none;
  margin: 0;
}
.activity-list li {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #edf1f4;
  font-size: 13px;
}
.activity-list span {
  margin-left: 14px;
  color: #718497;
}
time {
  color: #8294a5;
  font-size: 12px;
}
.recent-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid #edf1f4;
  font-size: 13px;
}
.recent-list time {
  grid-column: 1/-1;
}
.recent-list :deep(.el-button) {
  justify-content: flex-start;
  white-space: normal;
  height: auto;
  text-align: left;
}
.resume-options {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
}
.resume-options :deep(.el-radio__label) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.error {
  color: #b04e47;
  line-height: 1.7;
}
@media (max-width: 950px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .surface {
    padding: 22px;
  }
}
@media (max-width: 560px) {
  .detail-facts {
    grid-template-columns: 1fr;
  }
  h1 {
    font-size: 23px;
  }
  .activity-list li {
    flex-direction: column;
  }
}
</style>
