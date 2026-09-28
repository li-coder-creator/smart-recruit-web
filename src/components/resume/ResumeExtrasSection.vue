<template>
  <section id="extras-section" class="form-section extras-section">
    <div class="section-heading">
      <div class="section-icon">
        <el-icon><Document /></el-icon>
      </div>
      <div>
        <h3>证书荣誉与作品链接</h3>
        <p>补充能证明能力的证书、开源仓库和个人作品。</p>
      </div>
    </div>
    <el-alert
      v-if="disabled"
      type="info"
      :closable="false"
      show-icon
      title="请先创建简历，再添加证书和作品链接。"
    />
    <div v-else class="extras-grid">
      <section class="extra-group">
        <div class="group-heading">
          <h4>证书荣誉</h4>
          <el-button type="primary" plain :icon="Plus" @click="openCertDialog">添加</el-button>
        </div>
        <div v-if="certs.length" class="extra-list">
          <article v-for="cert in certs" :key="cert.id" class="extra-item">
            <div>
              <strong>{{ cert.certName }}</strong
              ><span>{{ [cert.issuer, cert.awardDate].filter(Boolean).join(' · ') }}</span>
              <p v-if="cert.description">{{ cert.description }}</p>
            </div>
            <div class="item-actions">
              <el-tooltip content="编辑证书" placement="top"
                ><el-button
                  text
                  circle
                  :icon="EditPen"
                  aria-label="编辑证书"
                  @click="openCertDialog(cert)" /></el-tooltip
              ><el-tooltip content="删除证书" placement="top"
                ><el-button
                  text
                  circle
                  type="danger"
                  :icon="Delete"
                  aria-label="删除证书"
                  @click="deleteCert(cert)"
              /></el-tooltip>
            </div>
          </article>
        </div>
        <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加证书" />
      </section>
      <section class="extra-group">
        <div class="group-heading">
          <h4>作品链接</h4>
          <el-button type="primary" plain :icon="Plus" @click="openLinkDialog">添加</el-button>
        </div>
        <div v-if="links.length" class="extra-list">
          <article v-for="link in links" :key="link.id" class="extra-item">
            <div>
              <strong>{{ link.linkName }}</strong
              ><span>{{ link.linkType }}</span
              ><a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
              <p v-if="link.description">{{ link.description }}</p>
            </div>
            <div class="item-actions">
              <el-tooltip content="编辑作品链接" placement="top"
                ><el-button
                  text
                  circle
                  :icon="EditPen"
                  aria-label="编辑作品链接"
                  @click="openLinkDialog(link)" /></el-tooltip
              ><el-tooltip content="删除作品链接" placement="top"
                ><el-button
                  text
                  circle
                  type="danger"
                  :icon="Delete"
                  aria-label="删除作品链接"
                  @click="deleteLink(link)"
              /></el-tooltip>
            </div>
          </article>
        </div>
        <el-empty v-else :image-size="EMPTY_IMAGE_SIZE" description="暂未添加作品链接" />
      </section>
    </div>

    <el-dialog
      v-model="certDialogVisible"
      :title="certForm.id ? '编辑证书荣誉' : '添加证书荣誉'"
      width="min(92vw, 620px)"
      :close-on-click-modal="false"
      ><el-form ref="certFormRef" :model="certForm" :rules="certRules" label-position="top"
        ><div class="form-grid two-columns">
          <el-form-item label="证书名称" prop="certName" required
            ><el-input
              v-model="certForm.certName"
              maxlength="100"
              show-word-limit
              placeholder="例如：大学英语四级" /></el-form-item
          ><el-form-item label="发证机构"
            ><el-input
              v-model="certForm.issuer"
              maxlength="100"
              placeholder="例如：教育部教育考试院" /></el-form-item
          ><el-form-item label="获奖日期"
            ><el-date-picker
              v-model="certForm.awardDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期" /></el-form-item
          ><el-form-item label="排序值"
            ><el-input-number v-model="certForm.sortOrder" :min="SORT_ORDER_MIN" :controls="false"
          /></el-form-item>
        </div>
        <el-form-item label="证书说明"
          ><el-input
            v-model="certForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="填写等级、成绩或奖项说明。" /></el-form-item></el-form
      ><template #footer
        ><el-button @click="certDialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="certSaving" @click="saveCert"
          >保存</el-button
        ></template
      ></el-dialog
    >
    <el-dialog
      v-model="linkDialogVisible"
      :title="linkForm.id ? '编辑作品链接' : '添加作品链接'"
      width="min(92vw, 620px)"
      :close-on-click-modal="false"
      ><el-form ref="linkFormRef" :model="linkForm" :rules="linkRules" label-position="top"
        ><div class="form-grid two-columns">
          <el-form-item label="链接名称" prop="linkName" required
            ><el-input
              v-model="linkForm.linkName"
              maxlength="100"
              show-word-limit
              placeholder="例如：Smart Recruit 源码" /></el-form-item
          ><el-form-item label="链接类型"
            ><el-select v-model="linkForm.linkType" clearable placeholder="请选择"
              ><el-option
                v-for="type in linkTypes"
                :key="type"
                :label="type"
                :value="type" /></el-select></el-form-item
          ><el-form-item label="链接地址" prop="url" required class="full-width"
            ><el-input
              v-model="linkForm.url"
              maxlength="2048"
              placeholder="https://github.com/your-name/project" /></el-form-item
          ><el-form-item label="排序值"
            ><el-input-number v-model="linkForm.sortOrder" :min="SORT_ORDER_MIN" :controls="false"
          /></el-form-item>
        </div>
        <el-form-item label="链接说明"
          ><el-input
            v-model="linkForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="说明该作品的用途、你的职责或亮点。" /></el-form-item></el-form
      ><template #footer
        ><el-button @click="linkDialogVisible = false">取消</el-button
        ><el-button type="primary" :loading="linkSaving" @click="saveLink"
          >保存</el-button
        ></template
      ></el-dialog
    >
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Delete, Document, EditPen, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createResumeCert,
  createResumeLink,
  deleteResumeCert,
  deleteResumeLink,
  updateResumeCert,
  updateResumeLink,
} from '@/api/resume'

const EMPTY_IMAGE_SIZE = 64
const SORT_ORDER_MIN = 0
const DEFAULT_SORT_ORDER = 0
const URL_PATTERN = /^https?:\/\/\S+$/
const props = defineProps({
  resumeId: { type: Number, default: null },
  certs: { type: Array, default: () => [] },
  links: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: true },
})
const emit = defineEmits(['changed'])
const linkTypes = ['GitHub', 'Gitee', '个人作品集', '在线演示', '其他']
const certDialogVisible = ref(false)
const linkDialogVisible = ref(false)
const certSaving = ref(false)
const linkSaving = ref(false)
const certFormRef = ref()
const linkFormRef = ref()
const certForm = reactive(emptyCert())
const linkForm = reactive(emptyLink())
const certRules = { certName: [{ required: true, message: '请输入证书名称', trigger: 'blur' }] }
const linkRules = {
  linkName: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { pattern: URL_PATTERN, message: '链接必须以 http:// 或 https:// 开头', trigger: 'blur' },
  ],
}
function emptyCert() {
  return {
    id: null,
    certName: '',
    issuer: '',
    awardDate: '',
    description: '',
    sortOrder: DEFAULT_SORT_ORDER,
  }
}
function emptyLink() {
  return {
    id: null,
    linkName: '',
    linkType: '',
    url: '',
    description: '',
    sortOrder: DEFAULT_SORT_ORDER,
  }
}
const openCertDialog = (cert) => {
  Object.assign(
    certForm,
    cert
      ? {
          id: cert.id,
          certName: cert.certName ?? '',
          issuer: cert.issuer ?? '',
          awardDate: cert.awardDate ?? '',
          description: cert.description ?? '',
          sortOrder: cert.sortOrder ?? DEFAULT_SORT_ORDER,
        }
      : emptyCert(),
    cert ? {} : { sortOrder: props.certs.length },
  )
  certFormRef.value?.clearValidate()
  certDialogVisible.value = true
}
const openLinkDialog = (link) => {
  Object.assign(
    linkForm,
    link
      ? {
          id: link.id,
          linkName: link.linkName ?? '',
          linkType: link.linkType ?? '',
          url: link.url ?? '',
          description: link.description ?? '',
          sortOrder: link.sortOrder ?? DEFAULT_SORT_ORDER,
        }
      : emptyLink(),
    link ? {} : { sortOrder: props.links.length },
  )
  linkFormRef.value?.clearValidate()
  linkDialogVisible.value = true
}
const saveCert = async () => {
  const valid = await certFormRef.value.validate().catch(() => false)
  if (!valid) return
  certSaving.value = true
  try {
    const payload = {
      certName: certForm.certName,
      issuer: certForm.issuer,
      awardDate: certForm.awardDate || null,
      description: certForm.description,
      sortOrder: certForm.sortOrder,
    }
    if (certForm.id) await updateResumeCert(certForm.id, payload)
    else await createResumeCert(props.resumeId, payload)
    certDialogVisible.value = false
    ElMessage.success('证书荣誉已保存')
    emit('changed')
  } catch (error) {
    console.error('保存证书失败：', error)
    ElMessage.error('保存证书失败')
  } finally {
    certSaving.value = false
  }
}
const saveLink = async () => {
  const valid = await linkFormRef.value.validate().catch(() => false)
  if (!valid) return
  linkSaving.value = true
  try {
    const payload = {
      linkName: linkForm.linkName,
      linkType: linkForm.linkType,
      url: linkForm.url,
      description: linkForm.description,
      sortOrder: linkForm.sortOrder,
    }
    if (linkForm.id) await updateResumeLink(linkForm.id, payload)
    else await createResumeLink(props.resumeId, payload)
    linkDialogVisible.value = false
    ElMessage.success('作品链接已保存')
    emit('changed')
  } catch (error) {
    console.error('保存作品链接失败：', error)
    ElMessage.error('保存作品链接失败')
  } finally {
    linkSaving.value = false
  }
}
const deleteCert = async (cert) => {
  try {
    await ElMessageBox.confirm(`确定删除“${cert.certName}”吗？`, '删除证书荣誉', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeCert(cert.id)
    ElMessage.success('证书荣誉已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除证书失败：', error)
      ElMessage.error('删除证书失败')
    }
  }
}
const deleteLink = async (link) => {
  try {
    await ElMessageBox.confirm(`确定删除“${link.linkName}”吗？`, '删除作品链接', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResumeLink(link.id)
    ElMessage.success('作品链接已删除')
    emit('changed')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除作品链接失败：', error)
      ElMessage.error('删除作品链接失败')
    }
  }
}
</script>

<style scoped>
.extras-section {
  margin-top: 18px;
}
.section-heading,
.group-heading,
.extra-item {
  display: flex;
}
.section-heading {
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
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
.section-heading h3,
.group-heading h4 {
  margin: 0;
  color: var(--sr-ink);
}
.section-heading h3 {
  font-size: 20px;
  line-height: 1.35;
}
.section-heading p {
  margin: 4px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.5;
}
.extras-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.extra-group {
  min-width: 0;
}
.group-heading {
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--sr-line);
}
.group-heading h4 {
  font-size: 16px;
}
.extra-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}
.extra-item {
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: #fbfdfd;
}
.extra-item > div:first-child {
  min-width: 0;
}
.extra-item strong,
.extra-item span,
.extra-item a {
  display: block;
}
.extra-item strong {
  color: var(--sr-ink);
  font-size: 14px;
}
.extra-item span,
.extra-item p {
  margin: 4px 0 0;
  color: var(--sr-muted);
  font-size: 13px;
  line-height: 1.55;
}
.extra-item a {
  overflow: hidden;
  margin-top: 4px;
  color: var(--sr-primary-dark);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.full-width {
  grid-column: 1 / -1;
}
:deep(.el-date-editor),
:deep(.el-input-number),
:deep(.el-select) {
  width: 100%;
}
@media (max-width: 760px) {
  .extras-grid,
  .two-columns {
    grid-template-columns: 1fr;
  }
}
</style>
