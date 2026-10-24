<template>
  <div class="company-photo" v-loading="loading">
    <el-image
      v-if="url"
      :src="url"
      :alt="photo.originalFilename || '办公环境照片'"
      fit="cover"
      :preview-src-list="[url]"
      preview-teleported
    />
    <button v-else-if="error" class="photo-error" type="button" @click="load">
      照片暂不可用，点击重试
    </button>
    <span v-else class="photo-placeholder">读取照片…</span>
  </div>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { getCompanyPhotoFile } from '@/api/company'
const props = defineProps({ photo: { type: Object, required: true } })
const url = ref(''),
  error = ref(false),
  loading = ref(false)
let controller
function clear() {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
}
async function load() {
  controller?.abort()
  const current = new AbortController()
  controller = current
  clear()
  error.value = false
  loading.value = true
  try {
    const blob = await getCompanyPhotoFile(props.photo.id, { signal: current.signal })
    if (!current.signal.aborted) url.value = URL.createObjectURL(blob)
  } catch {
    if (!current.signal.aborted) error.value = true
  } finally {
    if (!current.signal.aborted) loading.value = false
  }
}
watch(() => props.photo.id, load, { immediate: true })
onBeforeUnmount(() => {
  controller?.abort()
  clear()
})
</script>
<style scoped>
.company-photo {
  position: relative;
  min-height: 130px;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #f1f5f7;
}
.el-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 130px;
}
.photo-error,
.photo-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 130px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  color: #8290a2;
  font-size: 12px;
}
.photo-error {
  border: 0;
  background: none;
  cursor: pointer;
}
</style>
