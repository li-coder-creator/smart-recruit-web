<template>
  <div class="cp-stack">
    <section class="cp-panel">
      <header class="cp-section-head">
        <div>
          <h2>公司概况</h2>
          <p>了解企业业务、规模与发展阶段</p>
        </div>
        <el-button v-if="editable" link @click="$emit('edit', 'basic')"
          >编辑 <el-icon><ArrowRight /></el-icon
        ></el-button>
      </header>
      <dl class="cp-facts">
        <div v-for="key in basicFields" :key="key" :class="{ wide: wideFields.includes(key) }">
          <dt>{{ companyFieldLabel(key) }}</dt>
          <dd>
            <a
              v-if="key === 'website' && safeWebsite(company.website)"
              :href="safeWebsite(company.website)"
              target="_blank"
              rel="noopener noreferrer"
              >{{ company.website }}</a
            ><template v-else>{{ companyLabel(key, company[key]) }}</template>
          </dd>
        </div>
      </dl>
      <details class="cp-registration">
        <summary>
          工商信息 <span>{{ registrationText }}</span>
        </summary>
        <dl class="cp-facts">
          <div
            v-for="key in registrationFields"
            :key="key"
            :class="{ wide: wideFields.includes(key) }"
          >
            <dt>{{ companyFieldLabel(key) }}</dt>
            <dd>{{ companyLabel(key, company[key]) }}</dd>
          </div>
        </dl>
        <p class="cp-note">工商字段核验与营业执照审核分别展示；办公地址可能与注册地址不同。</p>
        <el-button v-if="editable" link @click="$emit('edit', 'registration')"
          >编辑工商信息</el-button
        >
      </details>
    </section>
    <section class="cp-panel">
      <header class="cp-section-head">
        <div>
          <h2>工作制度与福利</h2>
          <p>企业提供的信息，具体安排以岗位沟通为准</p>
        </div>
        <el-button v-if="editable" link @click="$emit('edit', 'experience')"
          >编辑 <el-icon><ArrowRight /></el-icon
        ></el-button>
      </header>
      <dl class="cp-facts">
        <div>
          <dt>工作时间</dt>
          <dd>{{ workTime }}</dd>
        </div>
        <div>
          <dt>休息制度</dt>
          <dd>{{ companyLabel('restPolicy', company.restPolicy) }}</dd>
        </div>
        <div>
          <dt>加班情况</dt>
          <dd>{{ companyLabel('overtimePolicy', company.overtimePolicy) }}</dd>
        </div>
      </dl>
      <div class="cp-tags">
        <span v-for="code in company.benefits || []" :key="code" class="cp-benefit">{{
          companyLabel('benefits', code)
        }}</span
        ><span v-if="!company.benefits?.length" class="cp-note">福利信息待补充</span>
      </div>
      <p v-if="company.workNotes" class="cp-prose cp-note">{{ company.workNotes }}</p>
    </section>
    <section v-if="editable || company.productName || company.teamName" class="cp-panel">
      <header class="cp-section-head">
        <div>
          <h2>产品与团队</h2>
          <p>了解企业在做什么、与谁一起工作</p>
        </div>
        <el-button v-if="editable" link @click="$emit('edit', 'story')"
          >编辑 <el-icon><ArrowRight /></el-icon
        ></el-button>
      </header>
      <div v-if="company.productName" class="cp-story">
        <h3>{{ company.productName }}</h3>
        <p class="cp-prose">{{ company.productDescription || '产品介绍待补充' }}</p>
      </div>
      <div v-if="company.teamName" class="cp-story">
        <h3>
          {{ company.teamName }}<span v-if="company.teamRole"> · {{ company.teamRole }}</span>
        </h3>
        <p class="cp-prose">{{ company.teamBio || '团队介绍待补充' }}</p>
      </div>
      <p v-if="!company.productName && !company.teamName" class="cp-empty">
        暂未填写产品与团队介绍
      </p>
    </section>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { COMPANY_REGISTRATION } from '@/constants/company'
import { companyFieldLabel, companyLabel, safeWebsite } from '@/utils/company'
const props = defineProps({ company: { type: Object, required: true }, editable: Boolean })
defineEmits(['edit'])
const basicFields = [
  'fullName',
  'industry',
  'employeeSize',
  'financingStage',
  'companyNature',
  'website',
  'foundedDate',
  'address',
  'commuteDescription',
]
const registrationFields = [
  'legalRepresentative',
  'registeredCapital',
  'businessStatus',
  'creditCode',
  'registeredAddress',
  'businessScope',
]
const wideFields = [
  'fullName',
  'address',
  'commuteDescription',
  'registeredAddress',
  'businessScope',
]
const registrationText = computed(() =>
  props.company.registrationVerified
    ? '当前工商版本已核验'
    : COMPANY_REGISTRATION[props.company.registrationReviewStatus] || '未核验',
)
const workTime = computed(() =>
  props.company.workStartTime && props.company.workEndTime
    ? `${props.company.workStartTime.slice(0, 5)} – ${props.company.workEndTime.slice(0, 5)}`
    : '待完善',
)
</script>
