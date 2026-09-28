<template>
  <section id="experience-section" class="form-section experience-section">
    <div class="section-heading">
      <div class="section-icon">
        <el-icon><OfficeBuilding /></el-icon>
      </div>
      <div class="heading-copy">
        <h3>实习经历</h3>
        <p>记录岗位职责和可量化的工作成果。</p>
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
      title="请先创建简历，再添加实习经历。"
    />
    <div v-else-if="experiences.length" class="experience-list">
      <article v-for="experience in experiences" :key="experience.id" class="experience-item">
        <div class="experience-main">
          <div>
            <h4>{{ experience.companyName }}</h4>
            <p>{{ experience.position }}</p>
          </div>
          <span>{{ formatPeriod(experience) }}</span>
        </div>
        <p v-if="experience.description" class="experience-description">
          {{ experience.description }}
        </p>
        <p v-if="experience.achievement" class="experience-achievement">
          成果：{{ experience.achievement }}
        </p>
        <div class="item-actions">
          <el-tooltip content="编辑实习经历" placement="top"
            ><el-button
              text
              circle
              :icon="EditPen"
              aria-label="编辑实习经历"
              @click="openEditDialog(experience)"
          /></el-tooltip>
          <el-tooltip content="删除实习经历" placement="top"
            ><el-button
              text
              circle
              type="danger"
              :icon="Delete"
              aria-label="删除实习经历"
              @click="handleDelete(experience)"
          /></el-tooltip>
        </div>
      </article>
    </div>
    <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加实习经历" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑实习经历' : '添加实习经历'"
      width="min(92vw, 720px)"
      :close-on-click-modal="false"
    >
      <el-form
        ref="experienceFormRef"
        :model="experienceForm"
        :rules="experienceRules"
        label-position="top"
      >
        <div class="form-grid two-columns">
          <el-form-item label="公司名称" prop="companyName" required
            ><el-input
              v-model="experienceForm.companyName"
              maxlength="100"
              show-word-limit
              placeholder="例如：某某科技有限公司"
          /></el-form-item>
          <el-form-item label="职位" prop="position" required
            ><el-input
              v-model="experienceForm.position"
              maxlength="50"
              show-word-limit
              placeholder="例如：Java 后端开发实习生"
          /></el-form-item>
          <el-form-item label="开始日期" prop="startDate"
            ><el-date-picker
              v-model="experienceForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="结束日期" prop="endDate"
            ><el-date-picker
              v-model="experienceForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          /></el-form-item>
          <el-form-item label="时间说明"
            ><el-input
              v-model="experienceForm.periodText"
              maxlength="50"
              placeholder="例如：2025.07 - 至今"
          /></el-form-item>
          <el-form-item label="排序值" prop="sortOrder"
            ><el-input-number
              v-model="experienceForm.sortOrder"
              :min="SORT_ORDER_MIN"
              :controls="false"
          /></el-form-item>
        </div>
        <el-form-item label="主要职责"
          ><el-input
            v-model="experienceForm.description"
            type="textarea"
            :rows="5"
            maxlength="2000"
            show-word-limit
            placeholder="描述你负责的模块、实现过程和协作方式。"
        /></el-form-item>
        <el-form-item label="工作成果"
          ><el-input
            v-model="experienceForm.achievement"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder="尽量用数据说明成果，例如：将接口响应时间降低 30%。"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveExperience"
          >保存</el-button
        ></template
      >
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Delete, EditPen, OfficeBuilding, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createResumeExperience,
  deleteResumeExperience,
  updateResumeExperience,
} from '@/api/resume'

const EMPTY_IMAGE_SIZE = 72
const SORT_ORDER_MIN = 0
const DEFAULT_SORT_ORDER = 0
const PERIOD_SEPARATOR = ' - '
const props = defineProps({
  resumeId: { type: Number, default: null },
  experiences: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: true },
})
const emit = defineEmits(['changed'])
const dialogVisible = ref(false)
const saving = ref(false)
const experienceFormRef = ref()
const experienceForm = reactive(createEmptyExperience())
const experienceRules = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  startDate: [{ validator: validateDateRange, trigger: 'change' }],
  endDate: [{ validator: validateDateRange, trigger: 'change' }],
}
const isEditing = computed(() => Boolean(experienceForm.id))

function createEmptyExperience() {
  return {
    id: null,
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    periodText: '',
    description: '',
    achievement: '',
    sortOrder: DEFAULT_SORT_ORDER,
  }
}
function validateDateRange(_rule, _value, callback) {
  if (
    experienceForm.startDate &&
    experienceForm.endDate &&
    experienceForm.startDate > experienceForm.endDate
  ) {
    callback(new Error('开始日期不能晚于结束日期'))
    return
  }
  callback()
}
const openCreateDialog = () => {
  Object.assign(experienceForm, createEmptyExperience(), { sortOrder: props.experiences.length })
  experienceFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const openEditDialog = (experience) => {
  Object.assign(experienceForm, {
    id: experience.id,
    companyName: experience.companyName ?? '',
    position: experience.position ?? '',
    startDate: experience.startDate ?? '',
    endDate: experience.endDate ?? '',
    periodText: experience.periodText ?? '',
    description: experience.description ?? '',
    achievement: experience.achievement ?? '',
    sortOrder: experience.sortOrder ?? DEFAULT_SORT_ORDER,
  })
  experienceFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const saveExperience = async () => {
  const valid = await experienceFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const payload = toExperiencePayload()
    if (isEditing.value) await updateResumeExperience(experienceForm.id, payload)
    else await createResumeExperience(props.resumeId, payload)
    dialogVisible.value = false
    ElMessage.success(isEditing.value ? '实习经历已更新' : '实习经历已添加')
    emit('changed')
  } catch (error) {
    console.error('保存实习经历失败：', error)
    ElMessage.error('保存实习经历失败')
  } finally {
    saving.value = false
  }
}
const handleDelete = async (experience) => {
  try {
    await ElMessageBox.confirm(`确定删除“${experience.companyName}”吗？`, '删除实习经历', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeExperience(experience.id)
    ElMessage.success('实习经历已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除实习经历失败：', error)
      ElMessage.error('删除实习经历失败')
    }
  }
}
const toExperiencePayload = () => ({
  companyName: experienceForm.companyName,
  position: experienceForm.position,
  startDate: experienceForm.startDate || null,
  endDate: experienceForm.endDate || null,
  periodText: experienceForm.periodText,
  description: experienceForm.description,
  achievement: experienceForm.achievement,
  sortOrder: experienceForm.sortOrder,
})
const formatPeriod = (experience) =>
  experience.periodText ||
  [experience.startDate, experience.endDate].filter(Boolean).join(PERIOD_SEPARATOR) ||
  '时间待补充'
</script>

<style scoped>
.experience-section {
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
.experience-list {
  display: grid;
  gap: 12px;
}
.experience-item {
  position: relative;
  padding: 16px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: #fbfdfd;
}
.experience-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-right: 64px;
}
.experience-main h4 {
  margin: 0;
  color: var(--sr-ink);
  font-size: 16px;
  line-height: 1.4;
}
.experience-main p,
.experience-description,
.experience-achievement {
  margin: 5px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.65;
}
.experience-main span {
  flex: 0 0 auto;
  color: var(--sr-muted);
  font-size: 13px;
  white-space: nowrap;
}
.experience-description {
  color: var(--sr-text);
  white-space: pre-line;
}
.experience-achievement {
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
  .experience-main {
    display: block;
    padding-right: 48px;
  }
  .experience-main span {
    display: block;
    margin-top: 8px;
  }
}
</style>
