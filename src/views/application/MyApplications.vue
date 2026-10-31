<template>
  <main class="application-module my-applications">
    <div class="app-breadcrumb">
      求职中心 <el-icon><ArrowRight /></el-icon><span>我的投递</span>
    </div>
    <header class="app-page-heading">
      <div>
        <h1>我的投递</h1>
        <p>每一份投递，都是新机会的开始。</p>
      </div>
      <button type="button" class="app-button green" :disabled="refreshing" @click="refreshAll">
        <el-icon :class="{ 'is-loading': refreshing }"><Refresh /></el-icon
        >{{ refreshing ? '正在刷新' : '刷新记录' }}
      </button>
    </header>
    <ApplicationOverview
      :data="overview"
      :loading="overviewLoading"
      :error="overviewError"
      :selected="filters.status"
      @select="selectStatus"
      @retry="loadOverview"
    />
    <div class="app-columns">
      <section class="app-list-panel" aria-label="投递记录">
        <div class="app-tabs" role="tablist" aria-label="按投递状态筛选" @keydown="handleTabKey">
          <button
            v-for="tab in APPLICATION_FILTERS"
            :key="tab.countKey"
            type="button"
            role="tab"
            :aria-selected="filters.status === tab.value"
            :tabindex="filters.status === tab.value ? 0 : -1"
            :class="{ active: filters.status === tab.value }"
            @click="selectStatus(tab.value)"
          >
            {{ tab.label }} <span>{{ overview?.[tab.countKey] ?? '—' }}</span>
          </button>
        </div>
        <div class="app-filters">
          <label class="app-search"
            ><el-icon aria-hidden="true"><Search /></el-icon
            ><input
              v-model="keywordInput"
              type="search"
              placeholder="搜索岗位或公司"
              aria-label="搜索岗位或公司"
              :maxlength="APPLICATION_KEYWORD_LIMIT"
              @input="scheduleSearch"
              @keydown.enter.prevent="submitSearch"
          /></label>
          <label class="app-date-select"
            ><el-icon aria-hidden="true"><Calendar /></el-icon
            ><select v-model="filters.dateRange" aria-label="投递日期范围" @change="filterChanged">
              <option
                v-for="option in APPLICATION_DATE_RANGES"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select></label
          >
          <span class="app-result-count" aria-live="polite">{{
            listLoading ? '正在读取' : `共 ${total} 条投递`
          }}</span>
        </div>
        <div v-if="listLoading" class="app-list-loading" role="status" aria-label="正在读取投递">
          <el-skeleton :rows="9" animated />
        </div>
        <div v-else-if="listError" class="app-error-box" role="alert">
          <p class="app-error">{{ listError }}</p>
          <button type="button" class="app-button green" @click="loadList">重新读取投递</button>
        </div>
        <div v-else-if="!items.length" class="app-empty">
          <el-icon aria-hidden="true"><Search /></el-icon>
          <h3>{{ total ? '这一页暂无投递' : '暂时没有匹配的投递' }}</h3>
          <p>试试其他关键词，或调整筛选条件。</p>
          <button type="button" class="app-button green" @click="resetFilters">重置筛选</button>
        </div>
        <div v-else>
          <ApplicationCard v-for="item in items" :key="item.id" :item="item" @detail="openDetail" />
        </div>
        <footer class="app-list-footer">
          <span>已展示 {{ items.length }} 条，共 {{ total }} 条</span>
          <nav class="app-pages" aria-label="投递分页">
            <button
              type="button"
              :disabled="listLoading || filters.page <= APPLICATION_DEFAULT_PAGE"
              aria-label="上一页"
              @click="changePage(filters.page - 1)"
            >
              <el-icon><ArrowLeft /></el-icon></button
            ><button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              :class="{ active: filters.page === page }"
              :aria-current="filters.page === page ? 'page' : undefined"
              :aria-label="`第${page}页`"
              :disabled="listLoading"
              @click="changePage(page)"
            >
              {{ page }}</button
            ><button
              type="button"
              :disabled="listLoading || filters.page >= pageCount"
              aria-label="下一页"
              @click="changePage(filters.page + 1)"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
          </nav>
        </footer>
        <p class="app-count-note">概览为全部历史投递，列表按当前条件展示。</p>
      </section>
      <aside class="app-sidebar">
        <NextInterview
          :data="nextInterview"
          :loading="nextLoading"
          :error="nextError"
          @retry="loadNext"
          @detail="(id) => openDetail(id, true)"
        />
        <section class="app-tip">
          <el-icon aria-hidden="true"><Document /></el-icon>
          <div>
            <h3>让每一次投递更有把握</h3>
            <p>及时更新简历，展示与你心仪岗位相关的项目与技能。</p>
            <router-link to="/layout/resume"
              >检查我的简历 <el-icon><Right /></el-icon
            ></router-link>
          </div>
        </section>
      </aside>
    </div>
    <el-drawer
      v-model="drawerOpen"
      title="投递详情"
      size="520px"
      class="my-app-drawer"
      destroy-on-close
      @closed="clearDetail"
    >
      <ApplicationDetailPanel
        v-if="drawerOpen && selectedId"
        :application-id="selectedId"
        :focus-interviews="focusInterviews"
        @changed="refreshAll"
      />
    </el-drawer>
  </main>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Document,
  Refresh,
  Right,
  Search,
} from '@element-plus/icons-vue'
import ApplicationOverview from '@/components/application/ApplicationOverview.vue'
import ApplicationCard from '@/components/application/ApplicationCard.vue'
import NextInterview from '@/components/application/NextInterview.vue'
import ApplicationDetailPanel from '@/components/application/ApplicationDetailPanel.vue'
import {
  getMyApplicationPage,
  getMyApplicationOverview,
  getMyNextInterview,
} from '@/api/application'
import {
  APPLICATION_DEFAULT_PAGE,
  APPLICATION_PAGE_SIZE,
  APPLICATION_FILTERS,
  APPLICATION_DATE_RANGES,
  APPLICATION_KEYWORD_LIMIT,
  APPLICATION_SEARCH_DELAY_MS,
  MY_APPLICATION_STATUS_META,
  INTERVIEW_MODE,
  INTERVIEW_STATUS,
} from '@/constants/application'
import {
  applicationData,
  isApplicationId,
  requireServerTime,
  localTimeEpoch,
} from '@/utils/application'
import '@/assets/application.css'

const filters = reactive({
  page: APPLICATION_DEFAULT_PAGE,
  pageSize: APPLICATION_PAGE_SIZE,
  status: null,
  keyword: '',
  dateRange: APPLICATION_DATE_RANGES[0].value,
})
const keywordInput = ref(''),
  items = ref([]),
  total = ref(0),
  listLoading = ref(false),
  listError = ref('')
const overview = ref(null),
  overviewLoading = ref(false),
  overviewError = ref('')
const nextInterview = ref(null),
  nextLoading = ref(false),
  nextError = ref(''),
  refreshing = ref(false)
const drawerOpen = ref(false),
  selectedId = ref(null),
  focusInterviews = ref(false)
const VISIBLE_PAGE_BUTTONS = 5
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / filters.pageSize)))
const visiblePages = computed(() => {
  const start = Math.max(
    1,
    Math.min(
      filters.page - Math.floor(VISIBLE_PAGE_BUTTONS / 2),
      pageCount.value - VISIBLE_PAGE_BUTTONS + 1,
    ),
  )
  return Array.from(
    { length: Math.min(VISIBLE_PAGE_BUTTONS, pageCount.value) },
    (_, index) => start + index,
  )
})
let listSequence = 0,
  overviewSequence = 0,
  nextSequence = 0,
  searchTimer,
  listController,
  overviewController,
  nextController
const cancelled = (error) => error.code === 'ERR_CANCELED'
const loadList = async () => {
  listController?.abort()
  listController = new AbortController()
  const sequence = ++listSequence
  listLoading.value = true
  listError.value = ''
  items.value = []
  total.value = 0
  const params = { page: filters.page, pageSize: filters.pageSize, dateRange: filters.dateRange }
  if (filters.status !== null) params.status = filters.status
  if (filters.keyword) params.keyword = filters.keyword
  try {
    const data = applicationData(
      await getMyApplicationPage(params, { signal: listController.signal }),
    )
    if (sequence !== listSequence) return
    if (
      !data ||
      !Number.isSafeInteger(data.total) ||
      data.total < 0 ||
      !Array.isArray(data.items) ||
      data.items.some(
        (item) => !isApplicationId(item.id) || !MY_APPLICATION_STATUS_META[item.status],
      )
    )
      throw new Error('投递列表响应异常，请重新读取')
    items.value = data.items
    total.value = data.total
  } catch (error) {
    if (sequence === listSequence && !cancelled(error))
      listError.value = error.message || '投递读取失败，请稍后重试'
  } finally {
    if (sequence === listSequence) listLoading.value = false
  }
}
const loadOverview = async () => {
  overviewController?.abort()
  overviewController = new AbortController()
  const sequence = ++overviewSequence
  overviewLoading.value = true
  overviewError.value = ''
  overview.value = null
  try {
    const data = applicationData(
      await getMyApplicationOverview({ signal: overviewController.signal }),
    )
    if (sequence !== overviewSequence) return
    if (
      !data ||
      APPLICATION_FILTERS.some(
        (item) => !Number.isSafeInteger(data[item.countKey]) || data[item.countKey] < 0,
      )
    )
      throw new Error('概览响应异常，请重新读取')
    overview.value = data
  } catch (error) {
    if (sequence === overviewSequence && !cancelled(error))
      overviewError.value = error.message || '概览读取失败'
  } finally {
    if (sequence === overviewSequence) overviewLoading.value = false
  }
}
const loadNext = async () => {
  nextController?.abort()
  nextController = new AbortController()
  const sequence = ++nextSequence
  nextLoading.value = true
  nextError.value = ''
  nextInterview.value = null
  try {
    const data = applicationData(await getMyNextInterview({ signal: nextController.signal }))
    if (sequence !== nextSequence) return
    requireServerTime(data)
    if (
      !Object.hasOwn(data, 'interview') ||
      (data.interview &&
        (!isApplicationId(data.interview.id) ||
          !isApplicationId(data.interview.applicationId) ||
          data.interview.status !== INTERVIEW_STATUS.SCHEDULED ||
          !Object.values(INTERVIEW_MODE).includes(data.interview.mode) ||
          !Number.isFinite(localTimeEpoch(data.interview.startTime)) ||
          !Number.isFinite(localTimeEpoch(data.interview.endTime)) ||
          localTimeEpoch(data.interview.endTime) <= localTimeEpoch(data.interview.startTime)))
    )
      throw new Error('面试安排响应异常，请重新读取')
    nextInterview.value = data
  } catch (error) {
    if (sequence === nextSequence && !cancelled(error))
      nextError.value = error.message || '面试读取失败'
  } finally {
    if (sequence === nextSequence) nextLoading.value = false
  }
}
const refreshAll = async () => {
  window.clearTimeout(searchTimer)
  const keyword = keywordInput.value.trim()
  if (keyword !== filters.keyword) filters.page = APPLICATION_DEFAULT_PAGE
  filters.keyword = keyword
  refreshing.value = true
  await Promise.allSettled([loadList(), loadOverview(), loadNext()])
  refreshing.value = false
}
const filterChanged = () => {
  filters.page = APPLICATION_DEFAULT_PAGE
  loadList()
}
const selectStatus = (status) => {
  filters.status = status
  submitSearch()
}
const submitSearch = () => {
  window.clearTimeout(searchTimer)
  filters.keyword = keywordInput.value.trim()
  filterChanged()
}
const scheduleSearch = () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(submitSearch, APPLICATION_SEARCH_DELAY_MS)
}
const changePage = (page) => {
  if (page < 1 || page > pageCount.value || page === filters.page) return
  filters.page = page
  loadList()
}
const resetFilters = () => {
  keywordInput.value = ''
  filters.keyword = ''
  filters.status = null
  filters.dateRange = APPLICATION_DATE_RANGES[0].value
  submitSearch()
}
const openDetail = (id, interviews = false) => {
  if (!isApplicationId(id)) return
  selectedId.value = id
  focusInterviews.value = interviews
  drawerOpen.value = true
}
const clearDetail = () => {
  if (!drawerOpen.value) selectedId.value = null
}
const handleTabKey = (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  const buttons = [...event.currentTarget.querySelectorAll('[role="tab"]')],
    index = buttons.indexOf(document.activeElement)
  if (index < 0) return
  event.preventDefault()
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
  buttons[next].focus()
  selectStatus(APPLICATION_FILTERS[next].value)
}
onMounted(refreshAll)
onBeforeUnmount(() => {
  listSequence++
  overviewSequence++
  nextSequence++
  window.clearTimeout(searchTimer)
  listController?.abort()
  overviewController?.abort()
  nextController?.abort()
})
</script>
<style scoped>
.my-applications {
  max-width: 1290px;
  margin: 0 auto 28px;
}
.app-breadcrumb {
  display: flex;
  align-items: center;
  gap: 13px;
  color: var(--app-muted);
  font-size: 12px;
}
.app-breadcrumb span {
  color: #43576d;
}
.app-breadcrumb .el-icon {
  font-size: 12px;
}
.app-page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 24px 0 22px;
}
.app-page-heading h1 {
  font-size: 30px;
  line-height: 1.4;
  margin: 0 0 5px;
  font-weight: 750;
  letter-spacing: -0.8px;
}
.app-page-heading p {
  font-size: 14px;
  color: var(--app-muted);
  margin: 0;
}
.app-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;
}
.app-list-panel {
  min-width: 0;
  border-radius: 14px;
  padding: 0 22px;
  background: white;
}
.app-tabs {
  display: flex;
  gap: 18px;
  border-bottom: 1px solid var(--app-line);
  height: 64px;
  overflow-x: auto;
  scrollbar-width: thin;
}
.app-tabs button {
  background: none;
  border: 0;
  border-bottom: 3px solid transparent;
  padding: 0 10px;
  white-space: nowrap;
  font-size: 14px;
  color: var(--app-ink);
}
.app-tabs button span {
  font-size: 12px;
  color: #8494a5;
  margin-left: 5px;
}
.app-tabs button.active {
  color: var(--app-green);
  border-color: var(--app-green);
  font-weight: 650;
}
.app-tabs button.active span {
  color: var(--app-green);
}
.app-filters {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px 0 20px;
  border-bottom: 1px solid var(--app-line);
}
.app-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 110px;
  max-width: 443px;
  border: 1px solid #dce6ed;
  border-radius: 7px;
  background: #fbfcfd;
  padding: 8px 12px;
  color: var(--app-muted);
}
.app-search input {
  border: 0;
  background: none;
  min-width: 0;
  width: 100%;
  font-size: 13px;
  outline: none;
  color: var(--app-ink);
}
.app-search input::placeholder {
  color: #8695a5;
}
.app-search:focus-within {
  border-color: var(--app-green);
  box-shadow: 0 0 0 3px #00a7790c;
}
.app-date-select {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dce6ed;
  border-radius: 7px;
  padding: 8px 11px;
}
.app-date-select select {
  max-width: 110px;
  font-size: 13px;
  background: none;
  border: 0;
  outline: 0;
  color: #465b71;
}
.app-result-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--app-muted);
  white-space: nowrap;
}
.app-list-loading {
  padding: 35px 0;
}
.app-list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  color: var(--app-muted);
  font-size: 12px;
}
.app-pages {
  display: flex;
  gap: 7px;
}
.app-pages button {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border: 1px solid #dfe8ee;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  color: #637b8e;
  padding: 0;
}
.app-pages button.active {
  color: white;
  background: var(--app-green);
  border-color: var(--app-green);
}
.app-count-note {
  font-size: 11px;
  color: #8798a7;
  margin: 0;
  padding-bottom: 17px;
}
.app-sidebar {
  display: grid;
  gap: 22px;
}
.app-tip {
  background: #effbf7;
  border: 1px solid #e4f5ef;
  border-radius: 14px;
  padding: 23px;
  display: flex;
  gap: 16px;
}
.app-tip > .el-icon {
  font-size: 26px;
  color: var(--app-green);
  margin-top: 3px;
  flex-shrink: 0;
}
.app-tip h3 {
  font-size: 16px;
  margin: 0 0 10px;
  line-height: 1.6;
}
.app-tip p {
  font-size: 13px;
  line-height: 1.9;
  color: #708596;
  margin: 0 0 18px;
}
.app-tip a {
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--app-green);
}
:global(.content-main:has(.my-applications)) {
  background: #f3f8fb;
}
@media (max-width: 1000px) {
  .app-columns {
    grid-template-columns: minmax(0, 1fr) 270px;
  }
  .app-list-panel {
    padding: 0 18px;
  }
  .app-tabs {
    gap: 5px;
  }
  .app-filters {
    gap: 9px;
    flex-wrap: wrap;
  }
  .app-result-count {
    flex-basis: 100%;
    margin: 0;
    text-align: right;
  }
  .app-search {
    max-width: none;
  }
}
@media (max-width: 800px) {
  .app-columns {
    grid-template-columns: 1fr;
  }
  .app-sidebar {
    grid-template-columns: 1fr 1fr;
  }
  .app-page-heading h1 {
    font-size: 27px;
  }
  .app-page-heading {
    margin-top: 20px;
  }
  .app-tabs {
    gap: 17px;
  }
}
@media (max-width: 600px) {
  .app-sidebar {
    grid-template-columns: 1fr;
  }
  .app-page-heading {
    gap: 10px;
  }
  .app-page-heading h1 {
    font-size: 25px;
  }
  .app-page-heading p {
    font-size: 12px;
    max-width: 180px;
  }
  .app-page-heading .app-button {
    padding: 8px 10px;
    white-space: nowrap;
    font-size: 12px !important;
  }
  .app-list-panel {
    padding: 0 16px;
  }
  .app-tabs {
    gap: 7px;
    height: 58px;
  }
  .app-tabs button {
    padding: 0 7px;
    font-size: 13px;
  }
  .app-search {
    flex-basis: 100%;
    max-width: none;
  }
  .app-date-select {
    margin-top: 2px;
  }
  .app-result-count {
    flex-basis: auto;
    margin-left: auto;
  }
  .app-list-footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 18px 0;
  }
  .app-count-note {
    font-size: 10px;
  }
  .app-breadcrumb {
    font-size: 11px;
  }
}
</style>
