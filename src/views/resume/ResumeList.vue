<template>
  <main class="resume-workspace-shell">
    <aside class="library-panel" aria-label="简历列表">
      <header class="library-header">
        <div class="panel-title">
          <span class="panel-title-icon"
            ><el-icon><Document /></el-icon
          ></span>
          <h2>简历管理</h2>
        </div>
        <el-tooltip content="新增简历" placement="top">
          <el-button
            class="add-resume"
            type="primary"
            :icon="Plus"
            aria-label="新增简历"
            @click="startNewResume"
          />
        </el-tooltip>
      </header>

      <div class="library-search">
        <el-input
          v-model="keyword"
          clearable
          :prefix-icon="Search"
          placeholder="搜索简历（姓名、岗位、学校等）"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <div class="library-filters" aria-label="筛选简历">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter-chip"
          :class="{ active: query.filter === filter.value }"
          @click="selectFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-loading="loading" class="resume-list">
        <button
          v-for="resume in resumeList"
          :key="resume.id"
          type="button"
          class="resume-item"
          :class="{ selected: selectedResumeId === resume.id && !creatingResume }"
          @click="selectResume(resume.id)"
        >
          <div class="resume-item-top">
            <div class="resume-item-name">
              <strong>{{ displayName(resume) }}</strong>
              <span>{{ displayPosition(resume) }}</span>
            </div>
            <el-dropdown trigger="click" @command="handleCommand($event, resume)" @click.stop>
              <el-button text circle :icon="MoreFilled" aria-label="简历操作" @click.stop />
              <template #dropdown
                ><el-dropdown-menu
                  ><el-dropdown-item command="edit" :icon="EditPen">编辑</el-dropdown-item
                  ><el-dropdown-item command="default" :disabled="resume.isDefault" :icon="Check"
                    >设为默认简历</el-dropdown-item
                  ><el-dropdown-item divided command="delete" :icon="Delete"
                    >删除简历</el-dropdown-item
                  ></el-dropdown-menu
                ></template
              >
            </el-dropdown>
          </div>
          <div class="resume-meta">
            <span>{{ displayEducation(resume) }}</span
            ><span>{{ resume.currentCity || '城市待填写' }}</span
            ><span v-if="resume.applying">1 份投递</span>
          </div>
          <div class="resume-progress">
            <span>完整度</span
            ><el-progress
              :percentage="completionRate(resume)"
              :show-text="false"
              :stroke-width="7"
            /><strong>{{ completionRate(resume) }}%</strong>
          </div>
          <div class="resume-status">
            <el-tag v-if="resume.isDefault" size="small" effect="light" type="success"
              >默认简历</el-tag
            ><el-tag v-if="resume.applying" size="small" effect="light" type="warning"
              >投递中</el-tag
            ><el-tag v-if="resume.isFavorite" size="small" effect="light">已收藏</el-tag
            ><span>更新于 {{ formatDateTime(resume.updateTime) }}</span>
          </div>
          <div class="resume-tags">
            <el-tag v-if="resume.degree" size="small" effect="plain">{{ resume.degree }}</el-tag
            ><el-tag v-if="resume.schoolName" size="small" effect="plain">{{
              resume.schoolName
            }}</el-tag
            ><el-button
              class="favorite-toggle"
              text
              circle
              :icon="resume.isFavorite ? StarFilled : Star"
              :loading="actioningId === resume.id"
              :aria-label="resume.isFavorite ? '取消收藏' : '收藏简历'"
              @click.stop="toggleFavorite(resume)"
            />
          </div>
        </button>

        <el-empty
          v-if="!loading && !resumeList.length"
          class="library-empty"
          description="还没有简历"
          ><el-button type="primary" :icon="Plus" @click="startNewResume"
            >新建简历</el-button
          ></el-empty
        >
      </div>

      <footer class="library-footer">
        <span>共 {{ total }} 份简历</span><span>当前展示 {{ resumeList.length }} 份</span>
      </footer>
    </aside>

    <ResumeEdit
      :resume-id="selectedResumeId"
      :embedded="true"
      @created="handleResumeCreated"
      @changed="loadResumePage"
    />
  </main>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Check,
  Delete,
  Document,
  EditPen,
  MoreFilled,
  Plus,
  Search,
  Star,
  StarFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ResumeEdit from '@/views/resume/ResumeEdit.vue'
import { deleteResume, getResumePage, setDefaultResume, updateResumeFavorite } from '@/api/resume'

const DEFAULT_PAGE_SIZE = 100
const EMPTY_COMPLETION_RATE = 0
const DATE_DISPLAY_LENGTH = 10
const ALL_FILTER = 'ALL'
const FAVORITE_FILTER = 'FAVORITE'
const APPLYING_FILTER = 'APPLYING'
const INCOMPLETE_FILTER = 'INCOMPLETE'
const filters = [
  { label: '全部', value: ALL_FILTER },
  { label: '投递中', value: APPLYING_FILTER },
  { label: '收藏', value: FAVORITE_FILTER },
  { label: '待完善', value: INCOMPLETE_FILTER },
]

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const loading = ref(false)
const actioningId = ref(null)
const resumeList = ref([])
const total = ref(0)
const selectedResumeId = ref(null)
const creatingResume = ref(false)
const query = reactive({ pageNum: 1, pageSize: DEFAULT_PAGE_SIZE, keyword: '', filter: ALL_FILTER })

const loadResumePage = async () => {
  loading.value = true
  try {
    const response = await getResumePage({ ...query })
    const pageData = response.data.data
    resumeList.value = pageData?.items ?? []
    total.value = pageData?.total ?? 0

    const routeId = Number(route.query.id)
    const requestedResume = resumeList.value.find((resume) => resume.id === routeId)
    const currentSelection = resumeList.value.find((resume) => resume.id === selectedResumeId.value)
    const nextResume =
      requestedResume ||
      currentSelection ||
      resumeList.value.find((resume) => resume.isDefault) ||
      resumeList.value[0]

    if (!creatingResume.value && nextResume && selectedResumeId.value !== nextResume.id) {
      selectedResumeId.value = nextResume.id
      syncRoute(nextResume.id)
    } else if (!resumeList.value.length && !creatingResume.value) {
      selectedResumeId.value = null
    }
  } catch (error) {
    console.error('获取简历列表失败：', error)
    ElMessage.error('获取简历列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  query.keyword = keyword.value.trim()
  query.pageNum = 1
  await loadResumePage()
}

const selectFilter = async (filter) => {
  query.filter = filter
  query.pageNum = 1
  await loadResumePage()
}

const selectResume = async (resumeId) => {
  creatingResume.value = false
  selectedResumeId.value = resumeId
  await syncRoute(resumeId)
}

const startNewResume = async () => {
  creatingResume.value = true
  selectedResumeId.value = null
  await router.replace({ path: '/layout/resume' })
}

const handleResumeCreated = async (resumeId) => {
  creatingResume.value = false
  selectedResumeId.value = resumeId
  await syncRoute(resumeId)
  await loadResumePage()
}

const syncRoute = (resumeId) =>
  router.replace({ path: '/layout/resume', query: resumeId ? { id: resumeId } : {} })

const handleCommand = async (command, resume) => {
  if (command === 'edit') {
    await selectResume(resume.id)
  } else if (command === 'default') {
    await updateResumeAction(resume, setDefaultResume, '已设为默认简历', '设置默认简历失败')
  } else if (command === 'delete') {
    await handleDelete(resume)
  }
}

const updateResumeAction = async (resume, action, successMessage, failureMessage) => {
  actioningId.value = resume.id
  try {
    await action(resume.id)
    ElMessage.success(successMessage)
    await loadResumePage()
  } catch (error) {
    console.error(`${failureMessage}：`, error)
    ElMessage.error(failureMessage)
  } finally {
    actioningId.value = null
  }
}

const toggleFavorite = (resume) =>
  updateResumeAction(
    resume,
    (id) => updateResumeFavorite(id, !resume.isFavorite),
    resume.isFavorite ? '已取消收藏' : '已收藏简历',
    '收藏状态更新失败',
  )

const handleDelete = async (resume) => {
  try {
    await ElMessageBox.confirm(`确定删除“${displayName(resume)}”吗？此操作不可恢复。`, '删除简历', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResume(resume.id)
    ElMessage.success('简历已删除')
    if (selectedResumeId.value === resume.id) {
      creatingResume.value = false
      selectedResumeId.value = null
    }
    await loadResumePage()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除简历失败：', error)
      ElMessage.error('删除简历失败')
    }
  }
}

const displayName = (resume) => resume.realName || resume.title || '未命名简历'
const displayPosition = (resume) => resume.expectedPosition || resume.headline || '暂未填写目标岗位'
const displayEducation = (resume) =>
  [resume.schoolName, resume.degree].filter(Boolean).join(' · ') || '教育信息待填写'
const completionRate = (resume) => resume.completionRate ?? EMPTY_COMPLETION_RATE
const formatDateTime = (value) => (value ? String(value).slice(0, DATE_DISPLAY_LENGTH) : '暂未更新')

watch(
  () => route.query.id,
  (id) => {
    const resumeId = Number(id)
    if (Number.isInteger(resumeId) && resumeId > 0 && resumeId !== selectedResumeId.value) {
      creatingResume.value = false
      selectedResumeId.value = resumeId
    }
  },
)

onMounted(loadResumePage)
</script>

<style scoped>
.resume-workspace-shell {
  --primary: #12b886;
  --primary-dark: #0f9f7a;
  --primary-soft: #e8fbf5;
  --ink: #17233d;
  --text: #334155;
  --muted: #64748b;
  --line: #dfe9f1;
  --line-soft: #edf4f7;
  display: grid;
  align-items: stretch;
  grid-template-columns: 300px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 14px;
  width: min(100%, 1440px);
  height: max(600px, calc(100vh - 116px));
  min-height: 600px;
  margin: 0 auto;
}
.library-panel {
  align-self: stretch;
  position: static;
  grid-row: 1;
  margin-block: 0;
  display: flex;
  max-height: none;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 35, 52, 0.06);
}
.library-header,
.library-search,
.library-filters,
.library-footer {
  flex: 0 0 auto;
}
.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--line-soft);
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.panel-title-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--primary-dark);
}
.panel-title h2 {
  margin: 0;
  color: var(--ink);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}
.add-resume {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 7px;
  border-color: var(--primary);
  background: var(--primary);
}
.add-resume:hover,
.add-resume:focus {
  border-color: var(--primary-dark);
  background: var(--primary-dark);
}
.add-resume :deep(.el-icon) {
  font-size: 15px;
}
.library-search {
  margin: 14px 14px 10px;
}
.library-search :deep(.el-input__wrapper) {
  min-height: 38px;
  background: #fbfdff;
  box-shadow: 0 0 0 1px var(--line) inset;
}
.library-filters {
  display: flex;
  gap: 7px;
  padding: 2px 14px 12px;
  overflow-x: auto;
}
.filter-chip {
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #f3f7fa;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.filter-chip.active {
  border-color: #b8ecdd;
  background: var(--primary-soft);
  color: var(--primary-dark);
}
.resume-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex: 1 1 auto;
  align-content: start;
  gap: 9px;
  min-width: 0;
  min-height: 0;
  padding: 0 11px 14px;
  overflow-x: hidden;
  overflow-y: auto;
}
#app .resume-workspace-shell .resume-list {
  grid-template-columns: minmax(0, 1fr);
  gap: 9px;
}
.resume-item {
  display: grid;
  gap: 9px;
  width: 100%;
  min-width: 0;
  padding: 13px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.resume-item:hover,
.resume-item.selected {
  border-color: rgba(18, 184, 134, 0.58);
  box-shadow: 0 12px 28px rgba(18, 184, 134, 0.12);
  transform: translateY(-1px);
}
.resume-item.selected {
  background: linear-gradient(110deg, #fff, #f6fffc);
}
.resume-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.resume-item-name {
  display: grid;
  min-width: 0;
  gap: 3px;
}
.resume-item-name strong {
  overflow: hidden;
  color: var(--ink);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resume-item-name > span {
  overflow: hidden;
  color: var(--text);
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resume-meta {
  display: block;
  overflow: hidden;
  gap: 4px 7px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resume-meta span {
  display: inline;
}
.resume-meta span + span::before {
  margin-right: 7px;
  color: #b7c3ce;
  content: '·';
}
.resume-progress {
  display: grid;
  grid-template-columns: auto minmax(20px, 1fr) auto;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}
.resume-progress strong {
  color: var(--muted);
  font-size: 11px;
}
.resume-progress :deep(.el-progress-bar__outer) {
  background: #e8eef4;
}
.resume-progress :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, var(--primary-dark), #6ed7bd);
}
.resume-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 22px;
  color: var(--muted);
  font-size: 10px;
}
.resume-status > span {
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resume-status :deep(.el-tag),
.resume-tags :deep(.el-tag) {
  max-width: 100%;
  border-radius: 999px;
  font-size: 10px;
}
.resume-tags {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.resume-tags :deep(.el-tag) {
  border-color: #b8ecdd;
  background: #effbf7;
  color: var(--primary-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.favorite-toggle {
  margin-left: auto;
  flex: 0 0 auto;
  color: #94a3b8;
}
.library-empty {
  padding: 20px 4px;
}
.library-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding: 12px 14px 15px;
  border-top: 1px solid var(--line-soft);
  color: var(--muted);
  font-size: 11px;
}
@media (max-width: 1180px) {
  .resume-workspace-shell {
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 12px;
  }
}
@media (max-width: 860px) {
  .resume-workspace-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    height: auto;
    min-height: 0;
    gap: 12px;
  }
  .library-panel {
    position: static;
    max-height: none;
    min-height: 0;
    overflow: visible;
  }
  .resume-list {
    flex: 0 1 auto;
    grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
    overflow: visible;
  }
  .library-footer {
    margin-top: 0;
  }
}
</style>
