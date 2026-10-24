<template>
  <section class="cp-panel">
    <header class="cp-section-head">
      <div>
        <h2>审核反馈与历史</h2>
        <p>工商核验与资质审核独立记录，可查看驳回原因。</p>
      </div>
      <el-button :disabled="loading" @click="load">刷新</el-button>
    </header>
    <el-tabs v-model="type" @tab-change="reset"
      ><el-tab-pane label="工商资料" name="registration" /><el-tab-pane
        label="资质材料"
        name="qualification"
    /></el-tabs>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
      class="cp-alert"
    />
    <el-table v-loading="loading" :data="items" empty-text="暂无审核记录" style="width: 100%">
      <el-table-column v-if="type === 'registration'" label="提交版本" min-width="160"
        ><template #default="{ row }"
          >版本 {{ row.registrationVersion }}
          <el-tag v-if="row.currentVersion" size="small">当前版本</el-tag
          ><span v-else class="cp-note">历史版本</span></template
        ></el-table-column
      >
      <el-table-column v-else label="材料" min-width="220"
        ><template #default="{ row }"
          >{{ row.originalFilename }}
          <el-tag v-if="row.removed" size="small" type="info">已移除</el-tag>
          <p class="cp-note">
            {{ companyLabel('qualificationType', row.qualificationType) }}
          </p></template
        ></el-table-column
      >
      <el-table-column label="审核状态" min-width="130"
        ><template #default="{ row }"
          ><el-tag
            :type="
              row.reviewStatus === 'APPROVED'
                ? 'success'
                : row.reviewStatus === 'REJECTED'
                  ? 'danger'
                  : 'warning'
            "
            >{{ COMPANY_REVIEW[row.reviewStatus] || '未知状态' }}</el-tag
          ></template
        ></el-table-column
      >
      <el-table-column label="审核意见" min-width="200"
        ><template #default="{ row }"
          ><span class="cp-prose">{{ row.reviewComment || '—' }}</span></template
        ></el-table-column
      >
      <el-table-column label="提交时间" min-width="175"
        ><template #default="{ row }">{{ companyTime(row.submittedAt) }}</template></el-table-column
      >
      <el-table-column label="审核时间" min-width="175"
        ><template #default="{ row }">{{ companyTime(row.reviewedAt) }}</template></el-table-column
      >
      <el-table-column v-if="type === 'registration'" type="expand"
        ><template #default="{ row }"
          ><dl class="cp-facts cp-history-snapshot">
            <div v-for="(value, key) in row.snapshot || {}" :key="key">
              <dt>{{ companyFieldLabel(key) }}</dt>
              <dd>{{ companyLabel(key, value) }}</dd>
            </div>
          </dl></template
        ></el-table-column
      >
    </el-table>
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
</template>
<script setup>
import { ref, watch } from 'vue'
import { getMyRegistrationReviews, getMyQualificationReviews } from '@/api/company'
import { COMPANY_PAGE, COMPANY_REVIEW } from '@/constants/company'
import { companyError, companyFieldLabel, companyLabel, companyTime } from '@/utils/company'
const props = defineProps({ revision: { type: Number, default: 0 } })
const type = ref('registration'),
  page = ref(COMPANY_PAGE.FIRST),
  items = ref([]),
  total = ref(0),
  loading = ref(false),
  error = ref('')
let generation = 0
async function load() {
  const current = ++generation
  loading.value = true
  error.value = ''
  items.value = []
  try {
    const response = await (
      type.value === 'registration' ? getMyRegistrationReviews : getMyQualificationReviews
    )({ page: page.value, pageSize: COMPANY_PAGE.SIZE })
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
watch(() => props.revision, reset, { immediate: true })
</script>
