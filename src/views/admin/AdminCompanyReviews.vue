<template>
  <el-config-provider :locale="zhCn">
    <main class="company-page">
      <header class="cp-page-head">
        <div>
          <div class="cp-breadcrumb">管理员 / 企业审核</div>
          <h1>工商与资质审核</h1>
          <p>审核提交快照，保留每次核验的依据与意见。</p>
        </div>
        <el-button @click="router.push('/layout/admin/company')">返回企业准入管理</el-button>
      </header>
      <section class="cp-panel">
        <el-tabs v-model="type" @tab-change="reset"
          ><el-tab-pane label="工商资料核验" name="registration" /><el-tab-pane
            label="资质材料审核"
            name="qualification"
        /></el-tabs>
        <div class="cp-review-filters">
          <el-select v-model="status" aria-label="审核状态" @change="reset"
            ><el-option
              v-for="(label, value) in COMPANY_REVIEW"
              :key="value"
              :label="label"
              :value="value" /></el-select
          ><el-select
            v-if="type === 'qualification'"
            v-model="qualificationType"
            clearable
            placeholder="全部材料类型"
            aria-label="材料类型"
            @change="reset"
            ><el-option
              v-for="item in COMPANY_OPTIONS.qualificationType"
              :key="item.value"
              :label="item.label"
              :value="item.value" /></el-select
          ><el-button :disabled="loading" @click="load">刷新队列</el-button>
        </div>
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          show-icon
          class="cp-alert"
        />
        <el-table v-loading="loading" :data="items" empty-text="当前筛选下暂无审核记录"
          ><el-table-column prop="companyName" label="企业" min-width="180" /><el-table-column
            v-if="type === 'registration'"
            prop="registrationVersion"
            label="工商版本"
            width="100"
          /><el-table-column v-else label="材料" min-width="220"
            ><template #default="{ row }"
              >{{ row.originalFilename }}
              <el-tag v-if="row.removed" type="info" size="small">已移除</el-tag>
              <p class="cp-note">
                {{ companyLabel('qualificationType', row.qualificationType) }}
              </p></template
            ></el-table-column
          ><el-table-column label="审核状态" width="130"
            ><template #default="{ row }"
              ><el-tag :type="reviewTag(row.reviewStatus)">{{
                COMPANY_REVIEW[row.reviewStatus] || '未知状态'
              }}</el-tag></template
            ></el-table-column
          ><el-table-column label="提交时间" min-width="180"
            ><template #default="{ row }">{{
              companyTime(row.submittedAt)
            }}</template></el-table-column
          ><el-table-column label="操作" width="120"
            ><template #default="{ row }"
              ><el-button link @click="openDetail(row.id)">查看详情</el-button></template
            ></el-table-column
          ></el-table
        >
        <div class="cp-pagination">
          <el-pagination
            :current-page="page"
            :page-size="COMPANY_PAGE.SIZE"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="changePage"
          />
        </div>
      </section>
      <el-dialog
        v-model="detailOpen"
        title="审核详情"
        width="780px"
        class="company-editor cp-review-detail"
        :close-on-click-modal="false"
        :close-on-press-escape="!submitting"
        :show-close="!submitting"
      >
        <el-skeleton v-if="detailLoading" :rows="8" animated /><el-alert
          v-if="detailError"
          :title="detailError"
          type="error"
          :closable="false"
          show-icon
        />
        <template v-if="detail && !detailLoading"
          ><h3>{{ detail.companyName }}</h3>
          <el-tag :type="reviewTag(detail.reviewStatus)">{{
            COMPANY_REVIEW[detail.reviewStatus] || '未知状态'
          }}</el-tag
          ><el-alert
            v-if="!detail.reviewable"
            title="当前记录不可审批：可能已处理、已移除，或已不是当前工商版本。"
            type="info"
            :closable="false"
          />
          <el-descriptions :column="1" border
            ><el-descriptions-item label="提交时间">{{
              companyTime(detail.submittedAt)
            }}</el-descriptions-item
            ><el-descriptions-item label="审核时间">{{
              companyTime(detail.reviewedAt)
            }}</el-descriptions-item
            ><el-descriptions-item v-if="detailType === 'registration'" label="工商版本"
              >提交 {{ detail.registrationVersion }} / 当前
              {{ detail.currentRegistrationVersion }}</el-descriptions-item
            ><el-descriptions-item v-if="detailType === 'qualification'" label="原件状态">{{
              detail.removed ? '企业已移除，平台保留历史原件' : '未移除'
            }}</el-descriptions-item
            ><el-descriptions-item label="审核意见">{{
              detail.reviewComment || '—'
            }}</el-descriptions-item></el-descriptions
          >
          <h4>提交时快照</h4>
          <el-descriptions :column="1" border
            ><el-descriptions-item
              v-for="(value, key) in detail.snapshot || {}"
              :key="key"
              :label="snapshotLabel(key)"
              >{{ snapshotValue(key, value) }}</el-descriptions-item
            ></el-descriptions
          >
          <el-button
            v-if="detailType === 'qualification'"
            :disabled="downloading || submitting"
            :loading="downloading"
            @click="downloadOriginal"
            >下载审核原件</el-button
          >
          <template v-if="detail.reviewable"
            ><h4>审核决定</h4>
            <el-radio-group v-model="decision" :disabled="submitting"
              ><el-radio :value="REVIEW_DECISION.APPROVE">通过</el-radio
              ><el-radio :value="REVIEW_DECISION.REJECT">驳回</el-radio></el-radio-group
            ><el-input
              v-model="comment"
              type="textarea"
              :rows="4"
              :maxlength="REVIEW_COMMENT_MAX"
              show-word-limit
              :disabled="submitting"
              :placeholder="
                decision === REVIEW_DECISION.REJECT ? '请填写驳回原因（必填）' : '审核意见（选填）'
              "
              aria-label="审核意见"
              style="margin-top: 14px"
            />
            <p class="cp-note">决定提交后不能对本条记录反复改判，请先核对快照及原件。</p></template
          >
        </template>
        <template #footer
          ><div class="cp-actions">
            <el-button :disabled="submitting" @click="detailOpen = false">关闭</el-button
            ><el-button
              v-if="detailError"
              :disabled="submitting"
              @click="openDetail(selectedId, detailType)"
              >重新读取</el-button
            ><el-button
              v-if="detail?.reviewable && !detailLoading"
              type="primary"
              :loading="submitting"
              :disabled="downloading"
              @click="submit"
              >确认提交审核决定</el-button
            >
          </div></template
        >
      </el-dialog>
    </main>
  </el-config-provider>
</template>
<script setup>
import { ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRegistrationReviews,
  getRegistrationReview,
  decideRegistrationReview,
  getQualificationReviews,
  getQualificationReview,
  decideQualificationReview,
  getReviewOriginal,
} from '@/api/companyReview'
import {
  COMPANY_PAGE,
  COMPANY_REVIEW,
  COMPANY_OPTIONS,
  REVIEW_DECISION,
  REVIEW_COMMENT_MAX,
} from '@/constants/company'
import { companyError, companyFieldLabel, companyLabel, companyTime } from '@/utils/company'
import { downloadCompanyFile } from '@/utils/companyFile'
import '@/assets/company.css'
const router = useRouter()
const type = ref('registration'),
  status = ref('PENDING'),
  qualificationType = ref(''),
  page = ref(COMPANY_PAGE.FIRST),
  items = ref([]),
  total = ref(0),
  loading = ref(false),
  error = ref('')
const detailOpen = ref(false),
  detail = ref(null),
  detailType = ref('registration'),
  detailLoading = ref(false),
  detailError = ref(''),
  selectedId = ref(null),
  decision = ref(REVIEW_DECISION.APPROVE),
  comment = ref(''),
  submitting = ref(false),
  downloading = ref(false)
let generation = 0,
  detailGeneration = 0
const reviewTag = (value) =>
  value === 'APPROVED' ? 'success' : value === 'REJECTED' ? 'danger' : 'warning'
const snapshotLabel = (key) =>
  ({
    qualificationId: '材料 ID',
    qualificationType: '材料类型',
    originalFilename: '原始文件名',
    contentType: '文件格式',
    fileSize: '文件字节数',
    sha256: 'SHA-256 摘要',
  })[key] || companyFieldLabel(key)
const snapshotValue = (key, value) => companyLabel(key, value)
async function load() {
  const current = ++generation
  loading.value = true
  items.value = []
  error.value = ''
  try {
    const params = { page: page.value, pageSize: COMPANY_PAGE.SIZE, reviewStatus: status.value }
    if (type.value === 'qualification' && qualificationType.value)
      params.qualificationType = qualificationType.value
    const response = await (
      type.value === 'registration' ? getRegistrationReviews : getQualificationReviews
    )(params)
    if (current === generation) {
      items.value = response.data.data.items
      total.value = response.data.data.total
    }
  } catch (e) {
    if (current === generation) error.value = companyError(e)
  } finally {
    if (current === generation) loading.value = false
  }
}
function reset() {
  page.value = COMPANY_PAGE.FIRST
  total.value = 0
  load()
}
function changePage(value) {
  page.value = value
  load()
}
async function openDetail(id, kind = type.value, keepComment = false) {
  const current = ++detailGeneration
  selectedId.value = id
  detailType.value = kind
  detail.value = null
  detailOpen.value = true
  detailLoading.value = true
  detailError.value = ''
  if (!keepComment) {
    comment.value = ''
    decision.value = REVIEW_DECISION.APPROVE
  }
  try {
    const response = await (
      kind === 'registration' ? getRegistrationReview : getQualificationReview
    )(id)
    if (current === detailGeneration) detail.value = response.data.data
  } catch (e) {
    if (current === detailGeneration) detailError.value = companyError(e)
  } finally {
    if (current === detailGeneration) detailLoading.value = false
  }
}
async function submit() {
  if (submitting.value || !detail.value?.reviewable) return
  const reviewComment = comment.value.trim() || null
  if (decision.value === REVIEW_DECISION.REJECT && !reviewComment) {
    detailError.value = '驳回必须填写原因'
    return
  }
  try {
    await ElMessageBox.confirm('确认对当前提交快照作出此审核决定？', '确认审核', {
      confirmButtonText: '确认提交',
      cancelButtonText: '继续核对',
      type: 'warning',
    })
  } catch {
    return
  }
  submitting.value = true
  detailError.value = ''
  const id = detail.value.id,
    kind = detailType.value
  try {
    const payload = { decision: decision.value, reviewComment }
    if (kind === 'registration') payload.registrationVersion = detail.value.registrationVersion
    await (kind === 'registration' ? decideRegistrationReview : decideQualificationReview)(
      id,
      payload,
    )
    ElMessage.success('审核决定已保存')
    await Promise.all([load(), openDetail(id, kind)])
  } catch (e) {
    const message = companyError(e)
    await openDetail(id, kind, true)
    detailError.value = message
  } finally {
    submitting.value = false
  }
}
async function downloadOriginal() {
  if (!detail.value || downloading.value) return
  downloading.value = true
  try {
    const id = detail.value.id
    await downloadCompanyFile(() => getReviewOriginal(id), detail.value.originalFilename)
  } catch (e) {
    detailError.value = companyError(e)
  } finally {
    downloading.value = false
  }
}
load()
</script>
