<template>
  <div class="cp-stack">
    <section class="cp-panel">
      <header class="cp-section-head">
        <div>
          <h2>资质材料</h2>
          <p>营业执照与行业资质原件仅供平台审核</p>
        </div>
        <div class="cp-actions">
          <el-select
            v-model="qualificationType"
            aria-label="资质类型"
            style="width: 140px"
            :disabled="busy"
            ><el-option
              v-for="item in COMPANY_OPTIONS.qualificationType"
              :key="item.value"
              :label="item.label"
              :value="item.value" /></el-select
          ><el-button :disabled="busy || loading" @click="qualificationInput.click()" :icon="Upload"
            >上传资质</el-button
          >
        </div>
      </header>
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        show-icon
        class="cp-alert"
      />
      <div v-loading="loading">
        <div v-for="item in qualifications" :key="item.id" class="cp-file-row">
          <div class="cp-trust-icon gold">
            <el-icon><Document /></el-icon>
          </div>
          <div class="cp-file-copy">
            <strong>{{ item.originalFilename }}</strong
            ><span
              >{{ companyLabel('qualificationType', item.qualificationType) }} ·
              {{ companyTime(item.createTime) }}</span
            >
          </div>
          <el-tag
            :type="
              item.reviewStatus === 'APPROVED'
                ? 'success'
                : item.reviewStatus === 'REJECTED'
                  ? 'danger'
                  : 'warning'
            "
            >{{ COMPANY_REVIEW[item.reviewStatus] || '未知状态' }}</el-tag
          >
          <div class="cp-actions">
            <el-button link :disabled="busy" @click="download(item)">下载</el-button
            ><el-button link type="danger" :disabled="busy" @click="remove(item)">移除</el-button>
          </div>
        </div>
        <p v-if="!loading && !qualifications.length" class="cp-empty">
          暂无资质材料，请选择类型后上传。
        </p>
      </div>
      <p class="cp-note">
        支持 JPG / PNG / PDF，单份不超过 10 MiB。新材料为待审核，上传不会自动通过核验。
      </p>
    </section>
    <section class="cp-panel">
      <header class="cp-section-head">
        <div>
          <h2>办公环境</h2>
          <p>真实工作场景，让求职者提前感受团队氛围</p>
        </div>
        <span class="cp-note">{{ photos.length }} / {{ COMPANY_FILE.MAX_PHOTOS }}</span>
      </header>
      <div class="cp-gallery">
        <div v-for="photo in photos" :key="photo.id" class="cp-photo-tile">
          <CompanyPhoto :photo="photo" /><button
            class="cp-photo-delete"
            :disabled="busy"
            type="button"
            :aria-label="`删除照片 ${photo.originalFilename}`"
            @click="removePhoto(photo)"
          >
            <el-icon><Delete /></el-icon>
          </button>
        </div>
        <button
          v-if="photos.length < COMPANY_FILE.MAX_PHOTOS"
          type="button"
          class="cp-upload-tile"
          :disabled="busy || loading"
          @click="photoInput.click()"
        >
          <el-icon><Plus /></el-icon><strong>{{ busy ? '处理中…' : '添加照片' }}</strong>
        </button>
      </div>
      <p v-if="!photos.length" class="cp-note">暂未展示办公照片。</p>
      <p class="cp-note">支持 JPG / PNG，单张不超过 3 MiB，最多 6 张。</p>
    </section>
    <input
      ref="photoInput"
      type="file"
      :accept="COMPANY_FILE.PHOTO_ACCEPT"
      multiple
      hidden
      @change="uploadPhotos"
    />
    <input
      ref="qualificationInput"
      type="file"
      :accept="COMPANY_FILE.QUALIFICATION_ACCEPT"
      hidden
      @change="uploadQualification"
    />
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Document, Plus, Delete } from '@element-plus/icons-vue'
import CompanyPhoto from './CompanyPhoto.vue'
import {
  getCompanyQualifications,
  uploadCompanyQualification,
  removeCompanyQualification,
  getCompanyQualificationFile,
  uploadCompanyPhoto,
  deleteCompanyPhoto,
} from '@/api/company'
import { COMPANY_OPTIONS, COMPANY_FILE, COMPANY_REVIEW } from '@/constants/company'
import { companyError, companyLabel, companyTime, validateCompanyFile } from '@/utils/company'
import { downloadCompanyFile } from '@/utils/companyFile'
const props = defineProps({ photos: { type: Array, default: () => [] } })
const emit = defineEmits(['changed'])
const qualifications = ref([]),
  qualificationType = ref('BUSINESS_LICENSE'),
  photoInput = ref(null),
  qualificationInput = ref(null),
  busy = ref(false),
  loading = ref(false),
  error = ref('')
async function load() {
  loading.value = true
  try {
    qualifications.value = (await getCompanyQualifications()).data.data
  } catch (e) {
    error.value = companyError(e)
  } finally {
    loading.value = false
  }
}
// 所有写入串行执行并刷新真实数据，部分上传失败也会同步已成功的部分。
async function mutate(action) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await action()
    ElMessage.success('操作成功')
  } catch (e) {
    error.value = companyError(e)
  } finally {
    await load()
    emit('changed')
    busy.value = false
  }
}
async function uploadPhotos(event) {
  const files = [...(event.target.files || [])]
  event.target.value = ''
  if (!files.length || busy.value) return
  if (files.length + props.photos.length > COMPANY_FILE.MAX_PHOTOS) {
    error.value = '照片总数不能超过 6 张'
    return
  }
  const invalid = files.map((file) => validateCompanyFile(file, true)).find(Boolean)
  if (invalid) {
    error.value = invalid
    return
  }
  await mutate(async () => {
    for (const file of files) await uploadCompanyPhoto(file)
  })
}
async function uploadQualification(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || busy.value) return
  const invalid = validateCompanyFile(file)
  if (invalid) {
    error.value = invalid
    return
  }
  const type = qualificationType.value
  await mutate(() => uploadCompanyQualification(file, type))
}
async function remove(item) {
  try {
    await ElMessageBox.confirm('移除后本人无法下载，平台仍保留审核证据。确定移除？', '移除资质', {
      type: 'warning',
      confirmButtonText: '确认移除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await mutate(() => removeCompanyQualification(item.id))
}
async function removePhoto(item) {
  try {
    await ElMessageBox.confirm('删除后企业主页不再展示此照片，确定删除？', '删除照片', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await mutate(() => deleteCompanyPhoto(item.id))
}
async function download(item) {
  if (busy.value) return
  busy.value = true
  try {
    await downloadCompanyFile(() => getCompanyQualificationFile(item.id), item.originalFilename)
  } catch (e) {
    error.value = companyError(e)
  } finally {
    busy.value = false
  }
}
onMounted(load)
</script>
