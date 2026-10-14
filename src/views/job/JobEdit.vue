<template>
  <main class="job-editor">
    <el-button link @click="router.push('/layout/job')">← 返回岗位管理</el-button>
    <header>
      <div>
        <h1>{{ isEdit ? '编辑岗位' : '发布新岗位' }}</h1>
        <p>先保存草稿，或完善信息后发布。标注“发布必填”的内容可在草稿阶段留空。</p>
      </div>
      <el-tag v-if="isEdit && status != null" :type="JOB_STATUS_META[status]?.tagType">{{
        JOB_STATUS_META[status]?.label
      }}</el-tag>
    </header>
    <el-skeleton v-if="loading" :rows="8" animated />
    <el-result v-else-if="loadError" icon="error" title="岗位读取失败" :sub-title="loadError">
      <template #extra><el-button @click="loadForm">重新读取</el-button></template>
    </el-result>
    <div v-else class="editor-grid">
      <el-form ref="formRef" :model="form" label-position="top" :disabled="saving" @submit.prevent>
        <section v-for="section in JOB_FORM_SECTIONS" :key="section.title" class="surface">
          <h2>{{ section.title }}</h2>
          <div class="fields">
            <el-form-item
              v-for="field in section.fields"
              :key="field.key"
              :prop="field.key"
              :error="errors[field.key]"
              :class="{ wide: field.wide }"
            >
              <template #label
                >{{ field.label }}<span v-if="field.required" class="required"> *</span
                ><small v-else-if="field.publish">发布必填</small></template
              >
              <el-input-number
                v-if="field.type === 'number'"
                v-model="form[field.key]"
                :aria-label="field.label"
                :min="JOB_NUMBER_MIN"
                :max="JOB_INTEGER_MAX"
                :precision="0"
              />
              <el-select
                v-else-if="field.options"
                v-model="form[field.key]"
                :aria-label="field.label"
                filterable
                allow-create
                default-first-option
                clearable
                placeholder="选择或输入"
              >
                <el-option
                  v-for="option in optionsFor(field)"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
              <el-input
                v-else
                v-model="form[field.key]"
                :aria-label="field.label"
                :type="field.type || 'text'"
                :rows="4"
                :maxlength="field.max"
                :show-word-limit="Boolean(field.max)"
                :placeholder="
                  field.type === 'textarea' ? '建议每行填写一项' : '请输入' + field.label
                "
              />
            </el-form-item>
          </div>
        </section>
        <section class="surface">
          <h2>薪资与招聘设置</h2>
          <el-checkbox v-model="form.negotiable">薪资面议</el-checkbox>
          <p class="hint">选择面议后，保存时会清空薪资上下限。</p>
          <div class="fields">
            <el-form-item label="最低薪资" prop="salaryMin" :error="errors.salaryMin"
              ><el-input-number
                v-model="form.salaryMin"
                aria-label="最低薪资"
                :disabled="form.negotiable"
                :min="JOB_NUMBER_MIN"
                :max="JOB_INTEGER_MAX"
                :precision="0"
            /></el-form-item>
            <el-form-item label="最高薪资" prop="salaryMax" :error="errors.salaryMax"
              ><el-input-number
                v-model="form.salaryMax"
                aria-label="最高薪资"
                :disabled="form.negotiable"
                :min="JOB_NUMBER_MIN"
                :max="JOB_INTEGER_MAX"
                :precision="0"
            /></el-form-item>
            <el-form-item label="薪资单位"
              ><el-select v-model="form.salaryUnit" aria-label="薪资单位"
                ><el-option
                  v-for="unit in JOB_SALARY_UNIT_OPTIONS"
                  :key="unit.value"
                  :label="unit.label"
                  :value="unit.value" /></el-select
            ></el-form-item>
            <el-form-item label="计划截止日期" prop="deadline" :error="errors.deadline"
              ><el-date-picker
                v-model="form.deadline"
                aria-label="计划截止日期"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="可不设置"
            /></el-form-item>
          </div>
          <p v-if="isEdit" class="hint">
            保存内容后保持当前岗位状态。招聘中、暂停岗位仍须满足发布条件。
          </p>
        </section>
        <section v-if="showLegacyDescription" class="surface">
          <h2>历史岗位描述</h2>
          <p class="hint">保留原有描述，可参考它完善上面的岗位职责与任职要求。</p>
          <el-input
            v-model="form.description"
            aria-label="历史岗位描述"
            type="textarea"
            :rows="4"
          />
        </section>
        <div class="save-actions surface">
          <p v-if="saveError" role="alert" class="save-error">{{ saveError }}</p>
          <div>
            <el-button :loading="saving" @click="submit(false)">{{
              isEdit ? '保存修改' : '保存草稿'
            }}</el-button>
            <el-button
              v-if="!isEdit || status === JOB_STATUS.DRAFT"
              type="primary"
              :loading="saving"
              @click="submit(true)"
              >{{ isEdit ? '保存并发布' : '发布岗位' }}</el-button
            >
          </div>
        </div>
      </el-form>
      <aside class="surface preview">
        <h2>求职者视角预览</h2>
        <p class="hint">随填写内容同步更新</p>
        <h3>{{ form.title || '岗位名称' }}</h3>
        <strong>{{ formatJobSalary(form) }}</strong>
        <p>
          {{ form.city || '工作城市' }} · {{ form.experience || '经验待填写' }} ·
          {{ form.education || '学历待填写' }}
        </p>
        <p>{{ form.employment || '用工类型' }} · {{ form.workMode || '办公方式' }}</p>
        <p>{{ form.summary || '在这里展示岗位的一句话介绍。' }}</p>
        <h4>岗位职责</h4>
        <p class="preview-text">{{ form.responsibilities || '填写后展示岗位职责。' }}</p>
        <h4>任职要求</h4>
        <p class="preview-text">{{ form.requirements || '填写后展示任职要求。' }}</p>
        <p class="hint">
          <template v-if="!isEdit || status === JOB_STATUS.DRAFT">草稿尚未向求职者开放。</template>
          最终展示以成功保存的内容为准。
        </p>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addJob, getCompanyJobDetail, publishJobDraft, saveJobDraft, updateJob } from '@/api/job'
import { JOB_STATUS, JOB_STATUS_META, JOB_SALARY_UNIT_OPTIONS } from '@/constants/job'
import { formatJobSalary } from '@/utils/job'
import {
  createJobForm,
  JOB_FORM_SECTIONS,
  JOB_INTEGER_MAX,
  JOB_NUMBER_MIN,
  normalizeJobForm,
  validateJobForm,
} from '@/utils/jobForm'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.path.endsWith('/edit'))
const form = reactive(createJobForm())
const formRef = ref()
const status = ref(null)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const errors = ref({})
const showLegacyDescription = ref(false)
const baseline = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== baseline.value)
const optionsFor = (field) => [...new Set([...field.options, form[field.key]].filter(Boolean))]
let loadSequence = 0

const loadForm = async () => {
  const sequence = ++loadSequence
  loading.value = true
  loadError.value = ''
  saveError.value = ''
  errors.value = {}
  status.value = null
  showLegacyDescription.value = false
  Object.assign(form, createJobForm())
  baseline.value = JSON.stringify(form)
  try {
    if (isEdit.value) {
      const id = route.query.id
      if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id))
        throw new Error('岗位编号无效，请返回岗位管理重新选择')
      const response = await getCompanyJobDetail(id)
      if (sequence !== loadSequence) return
      const detail = response.data.data
      if (!detail || String(detail.id) !== id || !JOB_STATUS_META[detail.status])
        throw new Error('岗位详情格式异常')
      // 仅回填可编辑内容，状态单独保存，不进入请求体。
      for (const key of Object.keys(form)) if (detail[key] !== undefined) form[key] = detail[key]
      status.value = detail.status
      showLegacyDescription.value = Boolean(detail.description)
    }
    baseline.value = JSON.stringify(form)
  } catch (error) {
    if (sequence === loadSequence) loadError.value = error.message || '读取失败，请重试'
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

const submit = async (publish) => {
  if (saving.value || loading.value || loadError.value) return
  saveError.value = ''
  const payload = normalizeJobForm(form)
  const requirePublishedContent =
    publish || [JOB_STATUS.ACTIVE, JOB_STATUS.PAUSED].includes(status.value)
  errors.value = validateJobForm(payload, requirePublishedContent)
  if (Object.keys(errors.value).length) {
    await nextTick()
    formRef.value?.scrollToField(Object.keys(errors.value)[0])
    saveError.value = '请检查表单中的提示后再保存'
    return
  }
  saving.value = true
  let contentSaved = false
  try {
    if (isEdit.value) {
      await updateJob(route.query.id, payload)
      contentSaved = true
      baseline.value = JSON.stringify(form)
      // 两个独立接口：内容保存成功后，再请求状态变化。
      if (publish) await publishJobDraft(route.query.id)
    } else if (publish) await addJob(payload)
    else await saveJobDraft(payload)
    baseline.value = JSON.stringify(form)
    ElMessage.success(publish ? '岗位已发布' : '岗位已保存')
    saving.value = false
    await router.push('/layout/job')
  } catch (error) {
    saveError.value =
      (contentSaved && publish ? '内容已保存，发布未成功：' : '') +
      (error.message || '操作未确认成功，请先核实岗位状态')
  } finally {
    saving.value = false
  }
}

const confirmLeave = async (to) => {
  // 登录过期跳转优先于保存中和未保存内容的离开保护。
  if (to.path === '/login') return true
  if (saving.value) return false
  if (!dirty.value) return true
  try {
    await ElMessageBox.confirm('填写的内容尚未保存，确定离开吗？', '离开编辑', {
      confirmButtonText: '离开',
      cancelButtonText: '继续编辑',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}
const beforeUnload = (event) => {
  if (dirty.value || saving.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onBeforeRouteLeave(confirmLeave)
onBeforeRouteUpdate(confirmLeave)
watch(() => route.fullPath, loadForm, { immediate: true })
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => {
  loadSequence++
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.job-editor {
  max-width: 1240px;
  margin: 0 auto 40px;
  color: #34475d;
  --el-color-primary: #0aa88d;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 20px 0 26px;
}
h1 {
  margin: 0;
  font-size: 28px;
  color: #20384c;
}
header p,
.hint {
  color: #718497;
  font-size: 13px;
  line-height: 1.7;
}
.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.surface {
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e0e9ee;
  border-radius: 10px;
  background: #fff;
}
h2 {
  margin: 0 0 22px;
  font-size: 18px;
  color: #20384c;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 22px;
}
.wide {
  grid-column: 1 / -1;
}
.required,
.save-error {
  color: #c45656;
}
small {
  font-size: 11px;
  color: #718497;
  margin-left: 8px;
}
.fields :deep(.el-input-number),
.fields :deep(.el-date-editor),
.fields :deep(.el-select) {
  width: 100%;
}
.preview {
  position: sticky;
  top: 94px;
  overflow-wrap: anywhere;
}
.preview h3 {
  font-size: 20px;
  color: #20384c;
}
.preview strong {
  color: #078f76;
  font-size: 19px;
}
.preview p {
  font-size: 13px;
  line-height: 1.8;
}
.preview-text {
  white-space: pre-wrap;
  max-height: 220px;
  overflow: auto;
}
.save-actions > div {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.save-actions :deep(.el-button) {
  margin: 0;
}
@media (max-width: 950px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
  .preview {
    position: static;
  }
}
@media (max-width: 560px) {
  .fields {
    grid-template-columns: 1fr;
  }
  .surface {
    padding: 18px;
  }
  h1 {
    font-size: 24px;
  }
  header {
    align-items: flex-start;
  }
}
</style>
