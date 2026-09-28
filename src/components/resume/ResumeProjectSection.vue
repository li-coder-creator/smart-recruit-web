<template>
  <section id="project-section" class="form-section project-section">
    <div class="section-heading">
      <div class="section-icon">
        <el-icon><FolderOpened /></el-icon>
      </div>
      <div class="heading-copy">
        <h3>项目经历</h3>
        <p>突出技术方案、个人职责和可证明的项目成果。</p>
      </div>
      <el-button type="primary" plain :icon="Plus" :disabled="disabled" @click="openCreateDialog"
        >添加项目</el-button
      >
    </div>
    <el-alert
      v-if="disabled"
      type="info"
      :closable="false"
      show-icon
      title="请先创建简历，再添加项目经历。"
    />
    <div v-else-if="projects.length" class="project-list">
      <article v-for="project in projects" :key="project.id" class="project-item">
        <div class="project-main">
          <div>
            <h4>{{ project.projectName }}</h4>
            <p>{{ project.role }}</p>
          </div>
          <span>{{ formatPeriod(project) }}</span>
        </div>
        <p v-if="project.techStack" class="project-stack">{{ project.techStack }}</p>
        <p class="project-description">{{ project.description }}</p>
        <p v-if="project.responsibility" class="project-responsibility">
          职责：{{ project.responsibility }}
        </p>
        <p v-if="project.achievement" class="project-achievement">
          成果：{{ project.achievement }}
        </p>
        <div class="item-actions">
          <el-tooltip content="编辑项目经历" placement="top"
            ><el-button
              text
              circle
              :icon="EditPen"
              aria-label="编辑项目经历"
              @click="openEditDialog(project)" /></el-tooltip
          ><el-tooltip content="删除项目经历" placement="top"
            ><el-button
              text
              circle
              type="danger"
              :icon="Delete"
              aria-label="删除项目经历"
              @click="handleDelete(project)"
          /></el-tooltip>
        </div>
      </article>
    </div>
    <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加项目经历" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑项目经历' : '添加项目经历'"
      width="min(92vw, 760px)"
      :close-on-click-modal="false"
    >
      <el-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-position="top">
        <div class="form-grid two-columns">
          <el-form-item label="项目名称" prop="projectName" required
            ><el-input
              v-model="projectForm.projectName"
              maxlength="100"
              show-word-limit
              placeholder="例如：Smart Recruit 智能招聘系统"
          /></el-form-item>
          <el-form-item label="项目角色" prop="role" required
            ><el-input
              v-model="projectForm.role"
              maxlength="50"
              show-word-limit
              placeholder="例如：Java 后端开发"
          /></el-form-item>
          <el-form-item label="开始日期" prop="startDate"
            ><el-date-picker
              v-model="projectForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="结束日期" prop="endDate"
            ><el-date-picker
              v-model="projectForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="时间说明"
            ><el-input
              v-model="projectForm.periodText"
              maxlength="50"
              placeholder="例如：2025.09 - 至今"
          /></el-form-item>
          <el-form-item label="排序值" prop="sortOrder"
            ><el-input-number
              v-model="projectForm.sortOrder"
              :min="SORT_ORDER_MIN"
              :controls="false"
          /></el-form-item>
        </div>
        <el-form-item label="技术栈"
          ><el-input
            v-model="projectForm.techStack"
            maxlength="500"
            show-word-limit
            placeholder="例如：Spring Boot、MyBatis、MySQL、Redis、Vue 3"
        /></el-form-item>
        <el-form-item label="项目描述" prop="description" required
          ><el-input
            v-model="projectForm.description"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder="说明项目服务的业务场景和核心功能。"
        /></el-form-item>
        <el-form-item label="个人职责"
          ><el-input
            v-model="projectForm.responsibility"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder="写清楚你负责的具体模块、技术方案和问题解决过程。"
        /></el-form-item>
        <el-form-item label="项目成果"
          ><el-input
            v-model="projectForm.achievement"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="优先写可量化结果，例如：接口响应时间降低 30%。"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveProject">保存</el-button></template
      >
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Delete, EditPen, FolderOpened, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createResumeProject, deleteResumeProject, updateResumeProject } from '@/api/resume'

const EMPTY_IMAGE_SIZE = 72
const SORT_ORDER_MIN = 0
const DEFAULT_SORT_ORDER = 0
const PERIOD_SEPARATOR = ' - '
const props = defineProps({
  resumeId: { type: Number, default: null },
  projects: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: true },
})
const emit = defineEmits(['changed'])
const dialogVisible = ref(false)
const saving = ref(false)
const projectFormRef = ref()
const projectForm = reactive(createEmptyProject())
const projectRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  role: [{ required: true, message: '请输入项目角色', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  startDate: [{ validator: validateDateRange, trigger: 'change' }],
  endDate: [{ validator: validateDateRange, trigger: 'change' }],
}
const isEditing = computed(() => Boolean(projectForm.id))
function createEmptyProject() {
  return {
    id: null,
    projectName: '',
    role: '',
    startDate: '',
    endDate: '',
    periodText: '',
    techStack: '',
    description: '',
    responsibility: '',
    achievement: '',
    sortOrder: DEFAULT_SORT_ORDER,
  }
}
function validateDateRange(_rule, _value, callback) {
  if (projectForm.startDate && projectForm.endDate && projectForm.startDate > projectForm.endDate) {
    callback(new Error('开始日期不能晚于结束日期'))
    return
  }
  callback()
}
const openCreateDialog = () => {
  Object.assign(projectForm, createEmptyProject(), { sortOrder: props.projects.length })
  projectFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const openEditDialog = (project) => {
  Object.assign(projectForm, {
    id: project.id,
    projectName: project.projectName ?? '',
    role: project.role ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    periodText: project.periodText ?? '',
    techStack: project.techStack ?? '',
    description: project.description ?? '',
    responsibility: project.responsibility ?? '',
    achievement: project.achievement ?? '',
    sortOrder: project.sortOrder ?? DEFAULT_SORT_ORDER,
  })
  projectFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const saveProject = async () => {
  const valid = await projectFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const payload = toProjectPayload()
    if (isEditing.value) await updateResumeProject(projectForm.id, payload)
    else await createResumeProject(props.resumeId, payload)
    dialogVisible.value = false
    ElMessage.success(isEditing.value ? '项目经历已更新' : '项目经历已添加')
    emit('changed')
  } catch (error) {
    console.error('保存项目经历失败：', error)
    ElMessage.error('保存项目经历失败')
  } finally {
    saving.value = false
  }
}
const handleDelete = async (project) => {
  try {
    await ElMessageBox.confirm(`确定删除“${project.projectName}”吗？`, '删除项目经历', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeProject(project.id)
    ElMessage.success('项目经历已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除项目经历失败：', error)
      ElMessage.error('删除项目经历失败')
    }
  }
}
const toProjectPayload = () => ({
  projectName: projectForm.projectName,
  role: projectForm.role,
  startDate: projectForm.startDate || null,
  endDate: projectForm.endDate || null,
  periodText: projectForm.periodText,
  techStack: projectForm.techStack,
  description: projectForm.description,
  responsibility: projectForm.responsibility,
  achievement: projectForm.achievement,
  sortOrder: projectForm.sortOrder,
})
const formatPeriod = (project) =>
  project.periodText ||
  [project.startDate, project.endDate].filter(Boolean).join(PERIOD_SEPARATOR) ||
  '时间待补充'
</script>

<style scoped>
.project-section {
  margin-top: 18px;
}
.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
}
.heading-copy {
  min-width: 0;
  flex: 1;
}
.section-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--sr-primary-soft);
  color: var(--sr-primary-dark);
  font-size: 19px;
}
.section-heading h3 {
  margin: 0;
  color: var(--sr-ink);
  font-size: 20px;
  line-height: 1.35;
}
.section-heading p {
  margin: 4px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.5;
}
.project-list {
  display: grid;
  gap: 12px;
}
.project-item {
  position: relative;
  padding: 16px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: #fbfdfd;
}
.project-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-right: 64px;
}
.project-main h4 {
  margin: 0;
  color: var(--sr-ink);
  font-size: 16px;
  line-height: 1.4;
}
.project-main p,
.project-description,
.project-responsibility,
.project-achievement,
.project-stack {
  margin: 5px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.65;
}
.project-main span {
  flex: 0 0 auto;
  color: var(--sr-muted);
  font-size: 13px;
  white-space: nowrap;
}
.project-stack {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--sr-primary-soft);
  color: var(--sr-primary-dark);
}
.project-description {
  color: var(--sr-text);
  white-space: pre-line;
}
.project-responsibility {
  white-space: pre-line;
}
.project-achievement {
  color: var(--sr-primary-dark);
  white-space: pre-line;
}
.item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
}
.form-grid {
  display: grid;
  gap: 0 16px;
}
.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
:deep(.el-date-editor),
:deep(.el-input-number) {
  width: 100%;
}
@media (max-width: 640px) {
  .section-heading {
    flex-wrap: wrap;
  }
  .section-heading > .el-button {
    width: 100%;
  }
  .two-columns {
    grid-template-columns: 1fr;
  }
  .project-main {
    display: block;
    padding-right: 48px;
  }
  .project-main span {
    display: block;
    margin-top: 8px;
  }
}
</style>
