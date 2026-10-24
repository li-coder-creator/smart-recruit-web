<template>
  <section class="cp-panel">
    <header class="cp-section-head">
      <div>
        <h2>{{ compact ? '企业可信信息' : '企业可信档案' }}</h2>
        <p v-if="!compact">完整、真实的信息能帮助候选人更安心地了解你</p>
      </div>
      <el-button v-if="editable" link @click="$emit('edit', 'basic')"
        >完善档案 <el-icon><ArrowRight /></el-icon
      ></el-button>
    </header>
    <div v-for="row in rows" :key="row.title" class="cp-trust-row">
      <div class="cp-trust-icon" :class="{ gold: row.gold }">
        <el-icon><component :is="row.icon" /></el-icon>
      </div>
      <div class="cp-trust-copy">
        <strong>{{ row.title }}</strong
        ><span>{{ row.description }}</span>
      </div>
      <el-tag :type="row.type" size="small" effect="light">{{ row.status }}</el-tag>
    </div>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { Document, Checked, Picture, OfficeBuilding, ArrowRight } from '@element-plus/icons-vue'
import { COMPANY_REGISTRATION } from '@/constants/company'
const props = defineProps({
  company: { type: Object, required: true },
  editable: Boolean,
  compact: Boolean,
})
defineEmits(['edit'])
const rows = computed(() => [
  {
    title: '企业基本信息',
    description: props.company.basicProfileComplete ? '基础信息已完善' : '部分基础信息待补充',
    status: props.company.basicProfileComplete ? '已完善' : '待完善',
    type: props.company.basicProfileComplete ? 'success' : 'info',
    icon: Document,
  },
  {
    title: '工商信息',
    description: '对应当前提交的工商资料版本',
    status: props.company.registrationVerified
      ? '已核验'
      : COMPANY_REGISTRATION[props.company.registrationReviewStatus] || '未核验',
    type: props.company.registrationVerified ? 'success' : 'warning',
    icon: OfficeBuilding,
    gold: true,
  },
  {
    title: '营业执照',
    description: props.company.businessLicenseVerified
      ? '存在有效且审核通过的营业执照'
      : '尚无有效、已核验的营业执照',
    status: props.company.businessLicenseVerified ? '已核验' : '未核验',
    type: props.company.businessLicenseVerified ? 'success' : 'info',
    icon: Checked,
    gold: true,
  },
  ...(!props.compact
    ? [
        {
          title: '工作制度与福利',
          description: '企业提供，以岗位沟通约定为准',
          status: props.company.restPolicy || props.company.benefits?.length ? '已填写' : '待补充',
          type: 'info',
          icon: Document,
        },
      ]
    : []),
  {
    title: '办公环境',
    description: `已展示 ${props.company.photoCount ?? 0} 张照片 · 企业提供`,
    status: props.company.photoCount ? '已展示' : '待添加',
    type: props.company.photoCount ? 'success' : 'info',
    icon: Picture,
  },
])
</script>
