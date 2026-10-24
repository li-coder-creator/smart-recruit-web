<template>
  <el-dialog
    :model-value="modelValue"
    title="完善企业档案"
    width="900px"
    class="company-editor"
    :close-on-click-modal="false"
    :close-on-press-escape="!saving"
    :show-close="!saving"
    :before-close="close"
  >
    <p class="cp-note">清晰展示公司背景、工作体验和经营主体</p>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
      class="cp-alert"
    />
    <el-tabs v-model="active"
      ><el-tab-pane
        v-for="section in COMPANY_SECTIONS"
        :key="section.key"
        :label="section.title"
        :name="section.key"
        ><p class="cp-note">{{ section.hint }}</p>
        <el-form label-position="top" :disabled="saving" class="cp-form-grid" @submit.prevent="save"
          ><el-form-item
            v-for="field in section.fields"
            :key="field.key"
            :label="field.label"
            :required="field.required"
            :error="issues.find((item) => item.key === field.key)?.message"
            :class="{
              wide:
                ['textarea', 'benefits'].includes(field.type) ||
                ['address', 'registeredAddress', 'creditCode'].includes(field.key),
            }"
          >
            <el-select
              v-if="field.type === 'select'"
              v-model="form[field.key]"
              clearable
              placeholder="请选择"
              :aria-label="field.label"
              ><el-option
                v-for="option in COMPANY_OPTIONS[field.key]"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            /></el-select>
            <el-checkbox-group v-else-if="field.type === 'benefits'" v-model="form.benefits"
              ><el-checkbox
                v-for="option in COMPANY_OPTIONS.benefits"
                :key="option.value"
                :value="option.value"
                >{{ option.label }}</el-checkbox
              ></el-checkbox-group
            >
            <el-input
              v-else
              v-model="form[field.key]"
              :type="field.type"
              :rows="field.type === 'textarea' ? 4 : undefined"
              :maxlength="field.max"
              :show-word-limit="field.type === 'textarea'"
              :aria-label="field.label"
              :placeholder="
                field.type === 'url'
                  ? 'https://'
                  : field.type === 'text' || field.type === 'textarea'
                    ? `请输入${field.label}`
                    : undefined
              "
            /> </el-form-item></el-form></el-tab-pane
    ></el-tabs>
    <template #footer
      ><div class="cp-dialog-footer">
        <span class="cp-note">保存整份资料；工商字段变更将进入核验流程。</span>
        <div class="cp-actions">
          <el-button :disabled="saving" @click="close">取消</el-button
          ><el-button type="primary" :loading="saving" @click="save">保存并更新预览</el-button>
        </div>
      </div></template
    >
  </el-dialog>
</template>
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { updateCompany } from '@/api/company'
import { COMPANY_OPTIONS, COMPANY_SECTIONS } from '@/constants/company'
import { createCompanyForm, validateCompanyForm, companyError } from '@/utils/company'
const props = defineProps({
  modelValue: Boolean,
  profile: { type: Object, required: true },
  section: { type: String, default: 'basic' },
})
const emit = defineEmits(['update:modelValue', 'saved'])
const active = ref('basic'),
  form = ref({}),
  issues = ref([]),
  error = ref(''),
  saving = ref(false)
let initial = ''
const dirty = computed(() => props.modelValue && JSON.stringify(form.value) !== initial)
defineExpose({ dirty })
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value = createCompanyForm(props.profile)
      initial = JSON.stringify(form.value)
      active.value = props.section
      issues.value = []
      error.value = ''
    }
  },
  { immediate: true },
)
async function close(done) {
  if (saving.value) return
  if (dirty.value) {
    try {
      await ElMessageBox.confirm('尚有未保存的修改，确定放弃吗？', '放弃修改', {
        type: 'warning',
        confirmButtonText: '放弃修改',
        cancelButtonText: '继续编辑',
      })
    } catch {
      return
    }
  }
  if (typeof done === 'function') done()
  emit('update:modelValue', false)
}
async function save() {
  if (saving.value) return
  issues.value = validateCompanyForm(form.value)
  if (issues.value.length) {
    active.value = issues.value[0].section
    error.value = issues.value[0].message
    return
  }
  saving.value = true
  error.value = ''
  try {
    await updateCompany(form.value)
    initial = JSON.stringify(form.value)
    emit('update:modelValue', false)
    emit('saved')
  } catch (e) {
    error.value = `${companyError(e)}。你的编辑内容已保留；如有版本冲突，请关闭后重新读取，再核对修改。`
  } finally {
    saving.value = false
  }
}
const beforeUnload = (event) => {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>
