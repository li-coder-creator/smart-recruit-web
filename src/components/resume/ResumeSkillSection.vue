<template>
  <section id="skill-section" class="form-section skill-section">
    <div class="section-heading">
      <div class="section-icon">
        <el-icon><Star /></el-icon>
      </div>
      <div class="heading-copy">
        <h3>专业技能</h3>
        <p>用清晰的技能名称和简短说明呈现你的技术能力。</p>
      </div>
      <el-button type="primary" plain :icon="Plus" :disabled="disabled" @click="openCreateDialog"
        >添加技能</el-button
      >
    </div>
    <el-alert
      v-if="disabled"
      type="info"
      :closable="false"
      show-icon
      title="请先创建简历，再添加专业技能。"
    />
    <div v-else-if="skills.length" class="skill-list">
      <article v-for="skill in skills" :key="skill.id" class="skill-item">
        <div class="skill-name">
          <el-tag type="success" effect="light">{{ skill.skillName }}</el-tag
          ><span v-if="skill.description">{{ skill.description }}</span>
        </div>
        <div class="item-actions">
          <el-tooltip content="编辑专业技能" placement="top"
            ><el-button
              text
              circle
              :icon="EditPen"
              aria-label="编辑专业技能"
              @click="openEditDialog(skill)" /></el-tooltip
          ><el-tooltip content="删除专业技能" placement="top"
            ><el-button
              text
              circle
              type="danger"
              :icon="Delete"
              aria-label="删除专业技能"
              @click="handleDelete(skill)"
          /></el-tooltip>
        </div>
      </article>
    </div>
    <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加专业技能" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑专业技能' : '添加专业技能'"
      width="min(92vw, 620px)"
      :close-on-click-modal="false"
    >
      <el-form ref="skillFormRef" :model="skillForm" :rules="skillRules" label-position="top">
        <div class="form-grid two-columns">
          <el-form-item label="技能名称" prop="skillName" required
            ><el-input
              v-model="skillForm.skillName"
              maxlength="50"
              show-word-limit
              placeholder="例如：Spring Boot"
          /></el-form-item>
          <el-form-item label="排序值" prop="sortOrder"
            ><el-input-number v-model="skillForm.sortOrder" :min="SORT_ORDER_MIN" :controls="false"
          /></el-form-item>
        </div>
        <el-form-item label="技能说明"
          ><el-input
            v-model="skillForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="例如：能够使用 Spring Boot 完成 RESTful 接口开发和参数校验。"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveSkill">保存</el-button></template
      >
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Delete, EditPen, Plus, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createResumeSkill, deleteResumeSkill, updateResumeSkill } from '@/api/resume'

const EMPTY_IMAGE_SIZE = 72
const SORT_ORDER_MIN = 0
const DEFAULT_SORT_ORDER = 0
const props = defineProps({
  resumeId: { type: Number, default: null },
  skills: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: true },
})
const emit = defineEmits(['changed'])
const dialogVisible = ref(false)
const saving = ref(false)
const skillFormRef = ref()
const skillForm = reactive(createEmptySkill())
const skillRules = { skillName: [{ required: true, message: '请输入技能名称', trigger: 'blur' }] }
const isEditing = computed(() => Boolean(skillForm.id))
function createEmptySkill() {
  return { id: null, skillName: '', description: '', sortOrder: DEFAULT_SORT_ORDER }
}
const openCreateDialog = () => {
  Object.assign(skillForm, createEmptySkill(), { sortOrder: props.skills.length })
  skillFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const openEditDialog = (skill) => {
  Object.assign(skillForm, {
    id: skill.id,
    skillName: skill.skillName ?? '',
    description: skill.description ?? '',
    sortOrder: skill.sortOrder ?? DEFAULT_SORT_ORDER,
  })
  skillFormRef.value?.clearValidate()
  dialogVisible.value = true
}
const saveSkill = async () => {
  const valid = await skillFormRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      skillName: skillForm.skillName,
      description: skillForm.description,
      sortOrder: skillForm.sortOrder,
    }
    if (isEditing.value) await updateResumeSkill(skillForm.id, payload)
    else await createResumeSkill(props.resumeId, payload)
    dialogVisible.value = false
    ElMessage.success(isEditing.value ? '专业技能已更新' : '专业技能已添加')
    emit('changed')
  } catch (error) {
    console.error('保存专业技能失败：', error)
    ElMessage.error('保存专业技能失败')
  } finally {
    saving.value = false
  }
}
const handleDelete = async (skill) => {
  try {
    await ElMessageBox.confirm(`确定删除“${skill.skillName}”吗？`, '删除专业技能', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeSkill(skill.id)
    ElMessage.success('专业技能已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除专业技能失败：', error)
      ElMessage.error('删除专业技能失败')
    }
  }
}
</script>

<style scoped>
.skill-section {
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
.skill-list {
  display: grid;
  gap: 10px;
}
.skill-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: #fbfdfd;
}
.skill-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  min-width: 0;
}
.skill-name span {
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.55;
}
.item-actions {
  display: flex;
  flex: 0 0 auto;
}
.form-grid {
  display: grid;
  gap: 0 16px;
}
.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
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
  .skill-item {
    align-items: flex-start;
  }
  .skill-name {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
