<template>
  <div class="job-page">
    <header class="page-head">
      <div>
        <h1>{{ isCompany ? '岗位管理' : '岗位浏览' }}</h1>
        <p>
          {{ isCompany ? '管理已发布、暂停和草稿岗位' : '寻找适合你的机会，当前仅展示招聘中岗位' }}
        </p>
      </div>
      <div v-if="isSupportedRole" class="head-actions">
        <el-button
          :icon="Refresh"
          :disabled="actionBusy || listLoading || overviewLoading"
          @click="refreshPage"
          >刷新</el-button
        >
        <el-button
          v-if="isCompany"
          type="primary"
          :icon="Plus"
          :disabled="actionBusy"
          @click="router.push('/layout/job/add')"
          >发布新岗位</el-button
        >
      </div>
    </header>

    <el-result
      v-if="!isSupportedRole"
      icon="info"
      title="暂无管理员岗位查询入口"
      sub-title="当前岗位接口面向企业与求职者。"
    />
    <template v-else>
      <section
        v-if="isCompany"
        class="surface overview"
        aria-label="招聘进展总览"
        :aria-busy="overviewLoading"
      >
        <div class="section-head">
          <div>
            <h2>招聘进展总览</h2>
            <p>当前企业已发布岗位汇总，不受下方筛选影响</p>
          </div>
          <span class="scope-label">企业总览</span>
        </div>
        <div v-if="overviewError" class="error-state" role="alert">
          <span>{{ overviewError }}</span>
          <el-button size="small" :disabled="actionBusy" @click="loadOverview">重试总览</el-button>
        </div>
        <el-skeleton v-else-if="overviewLoading" :rows="2" animated class="overview-skeleton" />
        <div v-else class="metrics">
          <div
            v-for="metric in overviewMetrics"
            :key="metric.label"
            class="metric"
            :class="{ accent: metric.accent }"
          >
            <span>{{ metric.label }}</span>
            <strong
              >{{ metric.value
              }}<small v-if="metric.value !== '—'">{{ metric.unit }}</small></strong
            >
          </div>
        </div>
        <p class="overview-note">
          统计范围：招聘中、暂停和已结束岗位，草稿不计入。“新”指当前待处理投递；面试中显示当前数量。转化率
          = 累计曾进入面试的投递数 ÷ 累计投递数；历史无法核实或无投递时显示“—”。
        </p>
      </section>

      <section class="surface management" aria-label="岗位列表" :aria-busy="listLoading">
        <div class="list-toolbar">
          <div v-if="isCompany" class="status-filters" role="group" aria-label="岗位状态筛选">
            <button
              v-for="option in JOB_FILTER_OPTIONS"
              :key="option.value"
              type="button"
              :class="{ selected: filter === option.value }"
              :aria-pressed="filter === option.value"
              :disabled="actionBusy"
              @click="changeFilter(option.value)"
            >
              {{ option.label }}
              <span>({{ displayCount(overview?.jobCounts?.[option.value.toLowerCase()]) }})</span>
            </button>
          </div>
          <h2 v-else class="browse-heading">招聘中岗位</h2>
          <form class="search-form" role="search" @submit.prevent="searchJobs">
            <el-input
              v-model="searchInput"
              clearable
              :prefix-icon="Search"
              maxlength="100"
              :disabled="actionBusy"
              aria-label="搜索岗位名称、类别、团队或城市"
              placeholder="岗位名称、类别、团队或城市"
              @clear="searchJobs"
            />
            <el-button native-type="submit" :disabled="actionBusy">搜索</el-button>
          </form>
        </div>

        <div v-if="actionError" class="error-state" role="alert">
          <span>{{ actionError }}</span>
          <el-button :disabled="actionBusy || listLoading || overviewLoading" @click="refreshPage">
            刷新核实岗位状态
          </el-button>
        </div>
        <div v-if="listError" class="list-state error-state" role="alert">
          <span>{{ listError }}</span
          ><el-button :disabled="actionBusy" @click="loadJobList">重试列表</el-button>
        </div>
        <div v-else-if="listLoading" class="list-state" role="status">
          <el-skeleton :rows="5" animated />
          <p>正在加载岗位…</p>
        </div>
        <el-empty
          v-else-if="!jobs.length"
          :description="hasQuery ? '没有匹配的岗位，试试其他关键词或状态' : '暂无岗位'"
        />
        <template v-else>
          <div class="job-table-head" :class="{ seeker: !isCompany }" aria-hidden="true">
            <span>岗位信息</span><span>状态</span><span>工作城市</span><span>经验 / 学历</span>
            <span>薪资范围</span><span>所属团队</span><span v-if="isCompany">投递 / 面试</span
            ><span>操作</span>
          </div>
          <article
            v-for="job in jobs"
            :key="job.id"
            class="job-row"
            :class="{ seeker: !isCompany }"
          >
            <div class="job-identity">
              <button
                type="button"
                class="job-title"
                :disabled="actionBusy"
                @click="goToDetail(job.id)"
              >
                {{ job.title || '未命名草稿' }}
              </button>
              <p class="job-sub">
                {{
                  [job.category, job.team, job.employment].filter(Boolean).join(' · ') ||
                  '岗位信息待完善'
                }}
              </p>
            </div>
            <div>
              <el-tag :type="JOB_STATUS_META[job.status]?.tagType ?? 'info'" effect="light">{{
                JOB_STATUS_META[job.status]?.label ?? '未知状态'
              }}</el-tag>
            </div>
            <div class="job-cell" data-label="工作城市">{{ job.city || '待填写' }}</div>
            <div class="job-cell" data-label="经验 / 学历">
              {{ job.experience || '未填写'
              }}<span class="secondary">{{ job.education || '未填写' }}</span>
            </div>
            <div class="job-cell job-pay" data-label="薪资范围">{{ formatJobSalary(job) }}</div>
            <div class="job-cell" data-label="所属团队">{{ job.team || '待分配' }}</div>
            <div v-if="isCompany" class="job-cell progress-cell" data-label="投递 / 面试">
              <span v-if="job.status === JOB_STATUS.DRAFT" class="secondary">尚未发布</span>
              <template v-else>
                <div class="application-line">
                  <span
                    ><b>{{ displayCount(job.applicationCount) }}</b> 份投递</span
                  >
                  <span
                    class="new-badge"
                    :class="{ zero: job.pendingApplicationCount === 0 }"
                    title="当前待处理投递"
                    >新 {{ displayCount(job.pendingApplicationCount) }}</span
                  >
                </div>
                <span class="secondary"
                  >{{ displayCount(job.currentInterviewApplicationCount) }} 份投递面试中</span
                >
              </template>
            </div>
            <div class="job-actions">
              <el-button link type="primary" :disabled="actionBusy" @click="goToDetail(job.id)"
                >详情</el-button
              >
              <el-button
                v-if="isCompany"
                link
                :disabled="actionBusy"
                @click="router.push({ path: '/layout/job/edit', query: { id: job.id } })"
                >编辑</el-button
              >
              <el-button
                v-if="isCompany && quickActionFor(job)"
                link
                type="warning"
                :disabled="actionBusy || listLoading"
                :loading="actionJobId === job.id"
                @click="performQuickAction(job)"
                >{{ quickActionFor(job).label }}</el-button
              >
            </div>
          </article>
        </template>

        <footer v-if="!listLoading && !listError" class="list-footer">
          <span>匹配 {{ total }} 个岗位 · 本页 {{ jobs.length }} 个</span>
          <div v-if="total > 0" class="pagination-controls">
            <label class="page-size"
              >每页
              <el-select
                :model-value="pageSize"
                :disabled="actionBusy"
                aria-label="每页岗位数量"
                @update:model-value="changePageSize"
              >
                <el-option
                  v-for="size in JOB_PAGINATION.PAGE_SIZES"
                  :key="size"
                  :label="`${size} 条`"
                  :value="size"
                />
              </el-select>
            </label>
            <el-pagination
              :current-page="page"
              :page-size="pageSize"
              :total="total"
              :disabled="actionBusy"
              :pager-count="5"
              layout="prev, pager, next"
              @update:current-page="changePage"
            />
          </div>
        </footer>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCompanyJobList, getCompanyJobOverview, getJobList, pauseJob, resumeJob } from '@/api/job'
import {
  JOB_FILTER,
  JOB_FILTER_OPTIONS,
  JOB_PAGINATION,
  JOB_STATUS,
  JOB_STATUS_META,
} from '@/constants/job'
import { useUserStore } from '@/stores/user'
import { formatJobSalary } from '@/utils/job'

const router = useRouter()
const userStore = useUserStore()
const isCompany = computed(() => userStore.role === 'COMPANY')
const isSupportedRole = computed(() => isCompany.value || userStore.role === 'JOB_SEEKER')
const jobs = ref([])
const total = ref(0)
const page = ref(JOB_PAGINATION.FIRST_PAGE)
const pageSize = ref(JOB_PAGINATION.DEFAULT_SIZE)
const filter = ref(JOB_FILTER.ALL)
const searchInput = ref('')
const keyword = ref('')
const listLoading = ref(false)
const listError = ref('')
const overview = ref(null)
const overviewLoading = ref(false)
const overviewError = ref('')
const actionJobId = ref(null)
const actionBusy = computed(() => actionJobId.value !== null)
const actionError = ref('')
const hasQuery = computed(() => Boolean(keyword.value) || filter.value !== JOB_FILTER.ALL)
let pageActive = true

const quickActions = {
  [JOB_STATUS.ACTIVE]: {
    label: '暂停',
    message: '暂停后求职者将不能继续投递，已有投递记录保留。确定暂停招聘吗？',
    run: pauseJob,
  },
  [JOB_STATUS.PAUSED]: {
    label: '恢复',
    message: '恢复后岗位将重新向求职者开放投递。确定恢复招聘吗？',
    run: resumeJob,
  },
}
const quickActionFor = (job) => quickActions[job.status] ?? null

// null 表示未知，0 表示已确认没有；页面必须保留这个区别。
const displayCount = (value) => (value == null ? '—' : value.toLocaleString())
const overviewMetrics = computed(() => [
  { label: '招聘中岗位', value: displayCount(overview.value?.jobCounts?.active), unit: '个' },
  {
    label: '待处理新投递',
    value: displayCount(overview.value?.pendingApplicationCount),
    unit: '份',
    accent: true,
  },
  { label: '累计投递', value: displayCount(overview.value?.applicationCount), unit: '份' },
  {
    label: '当前面试中',
    value: displayCount(overview.value?.currentInterviewApplicationCount),
    unit: '份',
  },
  {
    label: '面试转化率',
    value:
      overview.value?.interviewConversionRate == null
        ? '—'
        : `${overview.value.interviewConversionRate}%`,
    accent: true,
  },
])

// 快速切换筛选时，请求可能乱序返回；仅最近一次请求有权更新页面。
let listRequestId = 0
let overviewRequestId = 0
const loadJobList = async () => {
  if (!isSupportedRole.value) return
  const requestId = ++listRequestId
  listLoading.value = true
  listError.value = ''
  jobs.value = []
  const params = { page: page.value, size: pageSize.value, keyword: keyword.value || undefined }
  try {
    const response = isCompany.value
      ? await getCompanyJobList({ ...params, filter: filter.value })
      : await getJobList(params)
    if (requestId !== listRequestId) return
    const result = response.data.data
    if (!Array.isArray(result?.items) || !Number.isSafeInteger(result.total) || result.total < 0) {
      throw new Error('岗位分页响应格式异常，请重试')
    }
    total.value = result.total
    // 数据被其他人删除后，当前页可能超出末页，重新查询合法页码。
    const lastPage = Math.max(JOB_PAGINATION.FIRST_PAGE, Math.ceil(result.total / pageSize.value))
    if (page.value > lastPage) {
      page.value = lastPage
      await loadJobList()
      return
    }
    jobs.value = result.items
  } catch (error) {
    if (requestId === listRequestId) {
      total.value = 0
      listError.value = error.message || '岗位加载失败，请重试'
    }
  } finally {
    if (requestId === listRequestId) listLoading.value = false
  }
}

const loadOverview = async () => {
  if (!isCompany.value) return
  const requestId = ++overviewRequestId
  overviewLoading.value = true
  overviewError.value = ''
  overview.value = null
  try {
    const response = await getCompanyJobOverview()
    if (requestId !== overviewRequestId) return
    if (!response.data.data?.jobCounts) throw new Error('招聘总览响应格式异常，请重试')
    overview.value = response.data.data
  } catch (error) {
    if (requestId === overviewRequestId)
      overviewError.value = error.message || '招聘总览加载失败，请重试'
  } finally {
    if (requestId === overviewRequestId) overviewLoading.value = false
  }
}

const refreshPage = () => {
  actionError.value = ''
  return Promise.all([loadJobList(), loadOverview()])
}
const performQuickAction = async (job) => {
  const action = quickActionFor(job)
  if (!isCompany.value || actionBusy.value || listLoading.value || !action) return
  // 从确认弹窗开始锁定，防止重复请求和操作期间切换筛选或页面。
  actionJobId.value = job.id
  actionError.value = ''
  try {
    try {
      await ElMessageBox.confirm(action.message, `${action.label}：${job.title || '未命名岗位'}`, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
    if (!pageActive) return
    await action.run(job.id)
    if (!pageActive) return
    ElMessage.success(`${action.label}招聘成功`)
    // 不提前修改本地状态；保留筛选和页码，由分页查询处理末页变化。
    await refreshPage()
  } catch (error) {
    if (pageActive)
      actionError.value = error.message || '操作结果未确认，请刷新核实岗位状态后再操作'
  } finally {
    actionJobId.value = null
  }
}
const searchJobs = () => {
  if (actionBusy.value) return
  keyword.value = searchInput.value.trim()
  page.value = JOB_PAGINATION.FIRST_PAGE
  return loadJobList()
}
const changeFilter = (value) => {
  if (actionBusy.value) return
  if (filter.value === value) return
  filter.value = value
  page.value = JOB_PAGINATION.FIRST_PAGE
  return loadJobList()
}
const changePage = (value) => {
  if (actionBusy.value) return
  page.value = value
  return loadJobList()
}
const changePageSize = (value) => {
  if (actionBusy.value) return
  pageSize.value = value
  page.value = JOB_PAGINATION.FIRST_PAGE
  return loadJobList()
}
const goToDetail = (id) => router.push({ path: '/layout/job/info', query: { id } })

onBeforeRouteLeave((to) => !actionBusy.value || to.path === '/login')
onBeforeRouteUpdate(() => !actionBusy.value)
onMounted(refreshPage)
onBeforeUnmount(() => {
  pageActive = false
  // 页面离开后，未完成的响应不能继续修改状态。
  listRequestId++
  overviewRequestId++
})
</script>

<style scoped>
.job-page {
  max-width: 1360px;
  margin: 8px auto 36px;
  color: #34475d;
  --el-color-primary: #0aa88d;
  --el-color-primary-light-3: #54c2af;
  --el-color-primary-light-9: #eefaf6;
}
.page-head,
.head-actions,
.section-head,
.list-toolbar,
.list-footer,
.pagination-controls,
.search-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.page-head {
  margin-bottom: 24px;
}
h1 {
  margin: 0;
  font-size: 28px;
  color: #20384c;
}
.page-head p {
  margin: 8px 0 0;
  color: #718497;
  font-size: 14px;
}
h2 {
  margin: 0;
  font-size: 17px;
  color: #20384c;
}
.head-actions :deep(.el-button) {
  margin: 0;
}
.surface {
  border: 1px solid #e0e9ee;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 5px 20px #284d6410;
}
.overview {
  padding: 22px 24px 16px;
  margin-bottom: 20px;
}
.section-head p,
.scope-label {
  color: #7c8e9f;
  font-size: 12px;
}
.section-head p {
  margin: 6px 0 0;
}
.scope-label {
  white-space: nowrap;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-top: 18px;
  padding: 18px 0;
  border-top: 1px solid #e7eef2;
}
.metric {
  padding: 0 20px;
  border-right: 1px solid #e7eef2;
}
.metric:first-child {
  padding-left: 0;
}
.metric:last-child {
  border: 0;
}
.metric > span {
  display: block;
  color: #718497;
  font-size: 12px;
  margin-bottom: 8px;
}
.metric strong {
  color: #20384c;
  font-size: 28px;
  overflow-wrap: anywhere;
}
.metric.accent strong {
  color: #078f76;
}
.metric small {
  margin-left: 5px;
  font-size: 12px;
  color: #718497;
  font-weight: 400;
}
.overview-note {
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid #edf1f4;
  font-size: 12px;
  color: #7c8e9f;
  line-height: 1.7;
}
.overview-skeleton {
  padding: 24px 0;
}
.management {
  overflow: hidden;
}
.list-toolbar {
  padding: 0 22px;
  min-height: 72px;
  border-bottom: 1px solid #e7eef2;
  flex-wrap: wrap;
}
.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}
.status-filters button {
  min-height: 72px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  color: #677b8f;
  font-size: 13px;
  cursor: pointer;
  padding: 0 2px;
}
.status-filters button.selected {
  color: #078f76;
  border-bottom-color: #0aa88d;
  font-weight: 700;
}
.status-filters button span {
  font-size: 12px;
}
.search-form {
  width: 360px;
  max-width: 100%;
  margin: 12px 0;
  gap: 8px;
}
.search-form :deep(.el-input) {
  min-width: 0;
}
.browse-heading {
  padding: 16px 0;
}
.job-table-head,
.job-row {
  display: grid;
  grid-template-columns: minmax(185px, 2fr) 90px 75px 105px minmax(125px, 1.1fr) 80px 150px 125px;
  gap: 14px;
  align-items: center;
  padding: 18px 22px;
}
.job-table-head.seeker,
.job-row.seeker {
  grid-template-columns: minmax(185px, 2fr) 90px 75px 105px minmax(125px, 1.1fr) 80px 70px;
}
.job-table-head {
  background: #f8fafb;
  padding-top: 14px;
  padding-bottom: 14px;
  color: #8799a9;
  font-size: 12px;
}
.job-row {
  min-height: 106px;
  box-sizing: border-box;
  border-bottom: 1px solid #edf1f4;
}
.job-row:hover {
  background: #fcfefd;
}
.job-identity,
.job-cell {
  min-width: 0;
  overflow-wrap: anywhere;
}
.job-title {
  border: 0;
  padding: 0;
  background: none;
  color: #20384c;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  line-height: 1.5;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.job-title:hover {
  color: #078f76;
}
.job-sub {
  color: #8294a5;
  font-size: 12px;
  line-height: 1.6;
  margin: 7px 0 0;
}
.job-cell {
  color: #536b80;
  font-size: 13px;
  line-height: 1.6;
}
.secondary {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  color: #8294a5;
}
.job-pay {
  color: #078f76;
  font-weight: 700;
}
.application-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.new-badge {
  background: #e3f7ef;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  color: #078f68;
  white-space: nowrap;
}
.new-badge.zero {
  background: #f2f5f7;
  color: #7c8e9f;
}
.job-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}
.job-actions :deep(.el-button) {
  margin: 0;
}
.status-filters button:disabled,
.job-title:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.list-state {
  padding: 32px 24px;
  color: #718497;
}
.list-state p {
  margin-bottom: 0;
}
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  color: #b04e47;
  padding-top: 24px;
  padding-bottom: 24px;
}
.list-footer {
  padding: 18px 22px;
  font-size: 12px;
  color: #718497;
  flex-wrap: wrap;
}
.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.page-size :deep(.el-select) {
  width: 88px;
}
button:focus-visible {
  outline: 2px solid #0aa88d;
  outline-offset: 3px;
}
@media (max-width: 1200px) {
  .job-table-head,
  .job-table-head.seeker {
    display: none;
  }
  .job-row,
  .job-row.seeker {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .job-identity {
    grid-column: 1 / -1;
  }
  .job-cell::before {
    content: attr(data-label);
    display: block;
    font-size: 11px;
    color: #8294a5;
    font-weight: 400;
    margin-bottom: 4px;
  }
  .job-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
@media (max-width: 720px) {
  .page-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }
  h1 {
    font-size: 24px;
  }
  .overview {
    padding: 18px;
  }
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .metric,
  .metric:first-child {
    padding: 0;
    border: 0;
  }
  .metric strong {
    font-size: 25px;
  }
  .scope-label {
    display: none;
  }
  .list-toolbar {
    padding: 0 16px;
    gap: 0;
  }
  .status-filters {
    gap: 14px;
  }
  .status-filters button {
    min-height: 52px;
  }
  .search-form {
    width: 100%;
  }
  .job-row,
  .job-row.seeker {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 18px;
  }
  .list-footer {
    padding: 16px;
  }
  .pagination-controls {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
