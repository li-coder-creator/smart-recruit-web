<template>
  <section id="education-section" class="form-section education-section">
    <div class="section-heading">
      <div class="section-icon">
        <el-icon><School /></el-icon>
      </div>
      <div class="heading-copy">
        <h3>教育经历</h3>
        <p>按时间倒序维护学校、专业和成绩信息。</p>
      </div>
      <el-button type="primary" plain :icon="Plus" :disabled="disabled" @click="openCreateDialog"
        >添加经历</el-button
      >
    </div>

    <el-alert
      v-if="disabled"
      type="info"
      :closable="false"
      show-icon
      title="请先创建简历，再添加教育经历。"
    />
    <div v-else-if="educations.length" class="education-list">
      <article v-for="education in educations" :key="education.id" class="education-item">
        <div class="education-main">
          <div>
            <h4>{{ education.schoolName }}</h4>
            <p>{{ education.major }} · {{ education.degree }}</p>
          </div>
          <span class="education-period">{{ formatPeriod(education) }}</span>
        </div>
        <p v-if="education.gpa || education.rankInfo" class="education-extra">
          {{
            [education.gpa && `GPA ${education.gpa}`, education.rankInfo]
              .filter(Boolean)
              .join(' · ')
          }}
        </p>
        <p v-if="education.description" class="education-description">
          {{ education.description }}
        </p>
        <div class="item-actions">
          <el-tooltip content="编辑教育经历" placement="top"
            ><el-button
              text
              circle
              :icon="EditPen"
              aria-label="编辑教育经历"
              @click="openEditDialog(education)"
          /></el-tooltip>
          <el-tooltip content="删除教育经历" placement="top"
            ><el-button
              text
              circle
              type="danger"
              :icon="Delete"
              aria-label="删除教育经历"
              @click="handleDelete(education)"
          /></el-tooltip>
        </div>
      </article>
    </div>
    <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加教育经历" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑教育经历' : '添加教育经历'"
      width="min(92vw, 720px)"
      :close-on-click-modal="false"
    >
      <el-form
        ref="educationFormRef"
        :model="educationForm"
        :rules="educationRules"
        label-position="top"
      >
        <div class="form-grid two-columns">
          <el-form-item label="学校名称" prop="schoolName" required
            ><el-input
              v-model="educationForm.schoolName"
              maxlength="100"
              show-word-limit
              placeholder="例如：东莞理工学院"
          /></el-form-item>
          <el-form-item label="学历" prop="degree" required
            ><el-select v-model="educationForm.degree" placeholder="请选择学历"
              ><el-option
                v-for="option in degreeOptions"
                :key="option"
                :label="option"
                :value="option" /></el-select
          ></el-form-item>
          <el-form-item label="专业" prop="major" required
            ><el-input
              v-model="educationForm.major"
              maxlength="100"
              show-word-limit
              placeholder="例如：计算机科学与技术"
          /></el-form-item>
          <el-form-item label="排序值" prop="sortOrder"
            ><el-input-number
              v-model="educationForm.sortOrder"
              :min="SORT_ORDER_MIN"
              :controls="false"
          /></el-form-item>
          <el-form-item label="开始日期" prop="startDate"
            ><el-date-picker
              v-model="educationForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="结束日期" prop="endDate"
            ><el-date-picker
              v-model="educationForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="GPA"
            ><el-input v-model="educationForm.gpa" maxlength="20" placeholder="例如：3.8/4.0"
          /></el-form-item>
          <el-form-item label="排名信息"
            ><el-input
              v-model="educationForm.rankInfo"
              maxlength="50"
              placeholder="例如：专业前 15%"
          /></el-form-item>
        </div>
        <el-form-item label="教育描述"
          ><el-input
            v-model="educationForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="填写主修课程、社团活动或技术成果。"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveEducation"
          >保存</el-button
        ></template
      >
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Delete, EditPen, Plus, School } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createResumeEducation, deleteResumeEducation, updateResumeEducation } from '@/api/resume'

const EMPTY_IMAGE_SIZE = 72
const SORT_ORDER_MIN = 0
const DEFAULT_SORT_ORDER = 0
const PERIOD_SEPARATOR = ' - '

const props = defineProps({
  resumeId: { type: Number, default: null },
  educations: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: true },
})
const emit = defineEmits(['changed'])
const degreeOptions = ['大专', '本科', '硕士研究生', '博士研究生']
const dialogVisible = ref(false)
const saving = ref(false)
const educationFormRef = ref()
const educationForm = reactive(createEmptyEducation())
const educationRules = {
  schoolName: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  degree: [{ required: true, message: '请选择学历', trigger: 'change' }],
  major: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  startDate: [{ validator: validateDateRange, trigger: 'change' }],
  endDate: [{ validator: validateDateRange, trigger: 'change' }],
}
const isEditing = computed(() => Boolean(educationForm.id))

function createEmptyEducation() {
  return {
    id: null,
    schoolName: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
    gpa: '',
    rankInfo: '',
    description: '',
    sortOrder: DEFAULT_SORT_ORDER,
  }
}

function validateDateRange(_rule, _value, callback) {
  if (
    educationForm.startDate &&
    educationForm.endDate &&
    educationForm.startDate > educationForm.endDate
  ) {
    callback(new Error('开始日期不能晚于结束日期'))
    return
  }
  callback()
}

const openCreateDialog = () => {
  Object.assign(educationForm, createEmptyEducation(), { sortOrder: props.educations.length })
  educationFormRef.value?.clearValidate()
  dialogVisible.value = true
}

const openEditDialog = (education) => {
  Object.assign(educationForm, {
    id: education.id,
    schoolName: education.schoolName ?? '',
    degree: education.degree ?? '',
    major: education.major ?? '',
    startDate: education.startDate ?? '',
    endDate: education.endDate ?? '',
    gpa: education.gpa ?? '',
    rankInfo: education.rankInfo ?? '',
    description: education.description ?? '',
    sortOrder: education.sortOrder ?? DEFAULT_SORT_ORDER,
  })
  educationFormRef.value?.clearValidate()
  dialogVisible.value = true
}

const saveEducation = async () => {
  const valid = await educationFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const payload = toEducationPayload()
    if (isEditing.value) await updateResumeEducation(educationForm.id, payload)
    else await createResumeEducation(props.resumeId, payload)
    dialogVisible.value = false
    ElMessage.success(isEditing.value ? '教育经历已更新' : '教育经历已添加')
    emit('changed')
  } catch (error) {
    console.error('保存教育经历失败：', error)
    ElMessage.error('保存教育经历失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (education) => {
  try {
    await ElMessageBox.confirm(`确定删除“${education.schoolName}”吗？`, '删除教育经历', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeEducation(education.id)
    ElMessage.success('教育经历已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除教育经历失败：', error)
      ElMessage.error('删除教育经历失败')
    }
  }
}

const toEducationPayload = () => ({
  schoolName: educationForm.schoolName,
  degree: educationForm.degree,
  major: educationForm.major,
  startDate: educationForm.startDate || null,
  endDate: educationForm.endDate || null,
  gpa: educationForm.gpa,
  rankInfo: educationForm.rankInfo,
  description: educationForm.description,
  sortOrder: educationForm.sortOrder,
})
const formatPeriod = (education) => {
  const dates = [education.startDate, education.endDate].filter(Boolean)
  return dates.length ? dates.join(PERIOD_SEPARATOR) : '时间待补充'
}
</script>

<style scoped>
.education-section {
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
.education-list {
  display: grid;
  gap: 12px;
}
.education-item {
  position: relative;
  padding: 16px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: #fbfdfd;
}
.education-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-right: 64px;
}
.education-main h4 {
  margin: 0;
  color: var(--sr-ink);
  font-size: 16px;
  line-height: 1.4;
}
.education-main p,
.education-extra,
.education-description {
  margin: 5px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.55;
}
.education-period {
  flex: 0 0 auto;
  color: var(--sr-muted);
  font-size: 13px;
  white-space: nowrap;
}
.education-description {
  color: var(--sr-text);
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
:deep(.el-select),
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
  .education-main {
    display: block;
    padding-right: 48px;
  }
  .education-period {
    display: block;
    margin-top: 8px;
  }
}
</style>
