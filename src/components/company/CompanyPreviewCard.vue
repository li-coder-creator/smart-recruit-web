<template>
  <aside class="cp-preview">
    <header class="cp-section-head">
      <h2>求职者视角</h2>
      <span class="cp-note">已保存资料预览</span>
    </header>
    <div class="cp-preview-card">
      <div class="cp-cover">
        <div class="cp-avatar">{{ company.name?.slice(0, 1) || '企' }}</div>
      </div>
      <div class="cp-preview-body">
        <h3>{{ company.name || '企业名称待完善' }}</h3>
        <p>{{ company.city || '城市待完善' }}</p>
        <p class="cp-note">
          {{ companyLabel('industry', company.industry) }} ·
          {{ companyLabel('employeeSize', company.employeeSize) }}
        </p>
        <div class="cp-tags">
          <span
            v-for="code in (company.benefits || []).slice(0, 4)"
            :key="code"
            class="cp-benefit"
            >{{ companyLabel('benefits', code) }}</span
          >
        </div>
        <hr />
        <h4>关于我们</h4>
        <p class="cp-preview-description">{{ company.description || '企业介绍待完善' }}</p>
        <div v-if="company.photos?.length" class="cp-mini-gallery">
          <CompanyPhoto
            v-for="photo in company.photos.slice(0, 3)"
            :key="photo.id"
            :photo="photo"
          />
        </div>
        <div class="cp-reassure">
          <strong>企业可信信息</strong>
          <p>
            {{ company.registrationVerified ? '当前工商资料已核验' : '当前工商资料尚未核验通过' }}
          </p>
          <p>
            {{ company.businessLicenseVerified ? '营业执照已核验' : '尚无有效、已核验的营业执照' }}
          </p>
        </div>
        <el-button class="cp-full-button" @click="$emit('preview')" :icon="View"
          >查看完整预览</el-button
        >
      </div>
    </div>
  </aside>
</template>
<script setup>
import { View } from '@element-plus/icons-vue'
import CompanyPhoto from './CompanyPhoto.vue'
import { companyLabel } from '@/utils/company'
defineProps({ company: { type: Object, required: true } })
defineEmits(['preview'])
</script>
