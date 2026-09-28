<template>
  <section v-loading="pageLoading" class="resume-workspace" :class="{ embedded }">
    <header class="workspace-header">
      <div>
        <el-button v-if="!embedded" text :icon="ArrowLeft" class="back-button" @click="goBack"
          >返回简历库</el-button
        >
        <div class="title-row">
          <div>
            <p class="eyebrow">RESUME EDITOR</p>
            <h2>{{ isNewResume ? '新建简历' : basicForm.title || '编辑简历' }}</h2>
          </div>
          <div class="completion-indicator">
            <span>完整度</span>
            <strong>{{ completionRate }}%</strong>
            <el-progress :percentage="completionRate" :show-text="false" :stroke-width="7" />
          </div>
        </div>
      </div>

      <el-button
        type="primary"
        :icon="DocumentChecked"
        :loading="basicSaving"
        @click="saveBasicInfo"
      >
        {{ isNewResume ? '创建并继续' : '保存基础信息' }}
      </el-button>
    </header>

    <nav class="section-nav" aria-label="简历编辑分区">
      <button class="section-tab active" type="button">
        <el-icon><User /></el-icon>
        基础信息
      </button>
      <button class="section-tab" type="button" @click="scrollToPreference">
        <el-icon><Location /></el-icon>
        求职意向
      </button>
      <button class="section-tab" type="button" @click="scrollToEducation">
        <el-icon><School /></el-icon>
        教育经历
      </button>
      <button class="section-tab" type="button" @click="scrollToExperience">
        <el-icon><OfficeBuilding /></el-icon>
        实习经历
      </button>
      <button class="section-tab" type="button" @click="scrollToProject">
        <el-icon><FolderOpened /></el-icon>
        项目经历
      </button>
      <button class="section-tab" type="button" @click="scrollToSkill">
        <el-icon><Star /></el-icon>
        专业技能
      </button>
      <button class="section-tab" type="button" @click="scrollToExtras">
        <el-icon><Document /></el-icon>
        补充信息
      </button>
    </nav>

    <div class="editor-layout">
      <main class="editor-panel">
        <section class="form-section">
          <div class="section-heading">
            <div class="section-icon">
              <el-icon><User /></el-icon>
            </div>
            <div>
              <h3>基础信息</h3>
              <p>这些信息会作为简历抬头和联系方式展示。</p>
            </div>
          </div>

          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-position="top">
            <div class="form-grid two-columns">
              <el-form-item label="简历名称" prop="title" required>
                <el-input
                  v-model="basicForm.title"
                  maxlength="15"
                  show-word-limit
                  placeholder="例如：Java 后端实习简历"
                />
              </el-form-item>
              <el-form-item label="姓名" prop="realName">
                <el-input v-model="basicForm.realName" maxlength="20" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="basicForm.gender" placeholder="请选择">
                  <el-option
                    v-for="option in genderOptions"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="出生日期">
                <el-date-picker
                  v-model="basicForm.birthday"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="basicForm.email"
                  maxlength="100"
                  placeholder="name@example.com"
                />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="basicForm.phone"
                  maxlength="11"
                  placeholder="请输入 11 位手机号"
                />
              </el-form-item>
              <el-form-item label="当前城市">
                <el-input
                  v-model="basicForm.currentCity"
                  maxlength="50"
                  placeholder="例如：深圳市"
                />
              </el-form-item>
              <el-form-item label="政治面貌">
                <el-select v-model="basicForm.politicsStatus" clearable placeholder="请选择">
                  <el-option
                    v-for="option in politicsOptions"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="个人优势一句话">
              <el-input
                v-model="basicForm.headline"
                maxlength="50"
                show-word-limit
                placeholder="例如：熟悉 Java Web 开发，具备完整项目实践经验"
              />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input
                v-model="basicForm.summary"
                type="textarea"
                :rows="4"
                maxlength="150"
                show-word-limit
                placeholder="用一段简洁的话介绍你的方向、能力和目标。"
              />
            </el-form-item>
          </el-form>
        </section>

        <section id="preference-section" class="form-section preference-section">
          <div class="section-heading">
            <div class="section-icon">
              <el-icon><Location /></el-icon>
            </div>
            <div>
              <h3>求职意向</h3>
              <p>一份简历对应一条求职意向，用于匹配岗位和展示预期。</p>
            </div>
          </div>

          <el-alert
            v-if="isNewResume"
            type="info"
            :closable="false"
            show-icon
            title="请先创建简历，再保存求职意向。"
          />

          <el-form
            ref="preferenceFormRef"
            :model="preferenceForm"
            :rules="preferenceRules"
            label-position="top"
            :disabled="isNewResume"
          >
            <div class="form-grid two-columns">
              <el-form-item label="期望职位" prop="expectedPosition" required>
                <el-input
                  v-model="preferenceForm.expectedPosition"
                  maxlength="50"
                  placeholder="例如：Java 后端开发实习生"
                />
              </el-form-item>
              <el-form-item label="期望城市">
                <el-input
                  v-model="preferenceForm.expectedCity"
                  maxlength="50"
                  placeholder="例如：深圳市"
                />
              </el-form-item>
              <el-form-item label="最低薪资" prop="salaryMin">
                <el-input-number
                  v-model="preferenceForm.salaryMin"
                  :min="SALARY_MIN"
                  :step="SALARY_STEP"
                  :controls="false"
                  placeholder="单位：元/月"
                />
              </el-form-item>
              <el-form-item label="最高薪资" prop="salaryMax">
                <el-input-number
                  v-model="preferenceForm.salaryMax"
                  :min="SALARY_MIN"
                  :step="SALARY_STEP"
                  :controls="false"
                  placeholder="单位：元/月"
                />
              </el-form-item>
              <el-form-item label="薪资说明">
                <el-input
                  v-model="preferenceForm.salaryText"
                  maxlength="50"
                  placeholder="例如：3K-6K/月"
                />
              </el-form-item>
              <el-form-item label="到岗时间">
                <el-date-picker
                  v-model="preferenceForm.availableDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                />
              </el-form-item>
            </div>
            <el-form-item label="求职意向说明">
              <el-input
                v-model="preferenceForm.description"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="例如：希望参与真实业务系统的开发和迭代。"
              />
            </el-form-item>
            <div class="section-actions">
              <el-button
                type="primary"
                :icon="DocumentChecked"
                :loading="preferenceSaving"
                :disabled="isNewResume"
                @click="savePreference"
              >
                保存求职意向
              </el-button>
            </div>
          </el-form>
        </section>

        <ResumeEducationSection
          :resume-id="activeResumeId"
          :educations="educations"
          :disabled="isNewResume"
          @changed="loadResumeDetail"
        />
        <ResumeExperienceSection
          :resume-id="activeResumeId"
          :experiences="experiences"
          :disabled="isNewResume"
          @changed="loadResumeDetail"
        />
        <ResumeProjectSection
          :resume-id="activeResumeId"
          :projects="projects"
          :disabled="isNewResume"
          @changed="loadResumeDetail"
        />
        <ResumeSkillSection
          :resume-id="activeResumeId"
          :skills="skills"
          :disabled="isNewResume"
          @changed="loadResumeDetail"
        />
        <ResumeExtrasSection
          :resume-id="activeResumeId"
          :certs="certs"
          :links="links"
          :disabled="isNewResume"
          @changed="loadResumeDetail"
        />
      </main>

      <aside class="preview-panel">
        <div class="preview-heading">
          <div>
            <p class="eyebrow">LIVE PREVIEW</p>
            <h3>实时预览</h3>
          </div>
          <el-select v-model="previewMode" class="template-select" aria-label="预览模板">
            <el-option
              v-for="option in previewOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <article class="resume-preview" :class="{ compact: previewMode === COMPACT_PREVIEW }">
          <header class="preview-profile">
            <div>
              <h4>{{ basicForm.realName || '你的姓名' }}</h4>
              <p>{{ basicForm.headline || preferenceForm.expectedPosition || '目标岗位' }}</p>
            </div>
            <span class="preview-avatar">{{ displayInitial }}</span>
          </header>

          <div class="preview-contact">
            <span v-if="basicForm.phone"
              ><el-icon><Phone /></el-icon>{{ basicForm.phone }}</span
            >
            <span v-if="basicForm.email"
              ><el-icon><Message /></el-icon>{{ basicForm.email }}</span
            >
            <span v-if="basicForm.currentCity"
              ><el-icon><Location /></el-icon>{{ basicForm.currentCity }}</span
            >
          </div>

          <section v-if="hasPreference" class="preview-section">
            <h5>求职意向</h5>
            <div class="preview-preference-line">
              <strong>{{ preferenceForm.expectedPosition || '期望职位' }}</strong>
              <span>{{ preferenceMeta }}</span>
            </div>
            <p v-if="preferenceForm.description">{{ preferenceForm.description }}</p>
          </section>

          <section v-if="educations.length" class="preview-section">
            <h5>教育经历</h5>
            <div v-for="education in educations" :key="education.id" class="preview-education">
              <div>
                <strong>{{ education.schoolName }}</strong>
                <span>{{ education.major }} · {{ education.degree }}</span>
              </div>
              <time>{{ formatEducationPeriod(education) }}</time>
              <p v-if="education.gpa || education.rankInfo">
                {{
                  [education.gpa && `GPA ${education.gpa}`, education.rankInfo]
                    .filter(Boolean)
                    .join(' · ')
                }}
              </p>
            </div>
          </section>

          <section v-if="experiences.length" class="preview-section">
            <h5>实习经历</h5>
            <div v-for="experience in experiences" :key="experience.id" class="preview-experience">
              <div>
                <strong>{{ experience.companyName }}</strong>
                <span>{{ formatExperiencePeriod(experience) }}</span>
              </div>
              <p>{{ experience.position }}</p>
              <p v-if="experience.description">{{ experience.description }}</p>
              <p v-if="experience.achievement" class="preview-achievement">
                成果：{{ experience.achievement }}
              </p>
            </div>
          </section>

          <section v-if="projects.length" class="preview-section">
            <h5>项目经历</h5>
            <div v-for="project in projects" :key="project.id" class="preview-project">
              <div>
                <strong>{{ project.projectName }}</strong
                ><span>{{ formatProjectPeriod(project) }}</span>
              </div>
              <p>{{ project.role }}</p>
              <p v-if="project.techStack" class="preview-stack">{{ project.techStack }}</p>
              <p>{{ project.description }}</p>
              <p v-if="project.responsibility">职责：{{ project.responsibility }}</p>
              <p v-if="project.achievement" class="preview-achievement">
                成果：{{ project.achievement }}
              </p>
            </div>
          </section>

          <section v-if="skills.length" class="preview-section">
            <h5>专业技能</h5>
            <div class="preview-skills">
              <span v-for="skill in skills" :key="skill.id">{{ skill.skillName }}</span>
            </div>
          </section>

          <section v-if="certs.length" class="preview-section">
            <h5>证书荣誉</h5>
            <div v-for="cert in certs" :key="cert.id" class="preview-extra-line">
              <strong>{{ cert.certName }}</strong>
              <span>{{ [cert.issuer, cert.awardDate].filter(Boolean).join(' · ') }}</span>
            </div>
          </section>

          <section v-if="links.length" class="preview-section">
            <h5>作品链接</h5>
            <div v-for="link in links" :key="link.id" class="preview-extra-line">
              <strong>{{ link.linkName }}</strong>
              <a :href="link.url" target="_blank" rel="noopener noreferrer">{{
                link.linkType || link.url
              }}</a>
            </div>
          </section>

          <section v-if="basicForm.summary" class="preview-section">
            <h5>个人简介</h5>
            <p>{{ basicForm.summary }}</p>
          </section>

          <p v-if="!hasPreviewContent" class="preview-empty">
            填写左侧信息后，简历内容会在这里同步呈现。
          </p>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Document,
  DocumentChecked,
  FolderOpened,
  Location,
  Message,
  OfficeBuilding,
  Phone,
  School,
  Star,
  User,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ResumeEducationSection from '@/components/resume/ResumeEducationSection.vue'
import ResumeExperienceSection from '@/components/resume/ResumeExperienceSection.vue'
import ResumeProjectSection from '@/components/resume/ResumeProjectSection.vue'
import ResumeSkillSection from '@/components/resume/ResumeSkillSection.vue'
import ResumeExtrasSection from '@/components/resume/ResumeExtrasSection.vue'
import {
  createJobPreference,
  createResume,
  getResumeAggregateDetail,
  updateJobPreference,
  updateResumeBasic,
} from '@/api/resume'

const EMPTY_COMPLETION_RATE = 0
const SALARY_MIN = 0
const SALARY_STEP = 1000
const STANDARD_PREVIEW = 'STANDARD'
const COMPACT_PREVIEW = 'COMPACT'
const MIN_RESUME_ID = 1
const PHONE_PATTERN = /^1[3-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const genderOptions = ['男', '女', '保密']
const politicsOptions = ['中共党员', '中共预备党员', '共青团员', '群众']
const previewOptions = [
  { label: '标准模板', value: STANDARD_PREVIEW },
  { label: '精简模板', value: COMPACT_PREVIEW },
]

const router = useRouter()
const route = useRoute()
const props = defineProps({
  resumeId: { type: Number, default: null },
  embedded: { type: Boolean, default: false },
})
const emit = defineEmits(['created', 'changed'])
const basicFormRef = ref()
const preferenceFormRef = ref()
const pageLoading = ref(false)
const basicSaving = ref(false)
const preferenceSaving = ref(false)
const activeResumeId = ref(null)
const completionRate = ref(EMPTY_COMPLETION_RATE)
const previewMode = ref(STANDARD_PREVIEW)
const educations = ref([])
const experiences = ref([])
const projects = ref([])
const skills = ref([])
const certs = ref([])
const links = ref([])
let detailRequestVersion = 0

const basicForm = reactive({
  title: '',
  realName: '',
  gender: '',
  birthday: '',
  email: '',
  phone: '',
  currentCity: '',
  politicsStatus: '',
  headline: '',
  summary: '',
})

const preferenceForm = reactive({
  id: null,
  expectedPosition: '',
  expectedCity: '',
  salaryMin: undefined,
  salaryMax: undefined,
  salaryText: '',
  availableDate: '',
  description: '',
})

const basicRules = {
  title: [{ required: true, message: '请输入简历名称', trigger: 'blur' }],
  email: [{ pattern: EMAIL_PATTERN, message: '请输入正确的邮箱地址', trigger: 'blur' }],
  phone: [{ pattern: PHONE_PATTERN, message: '请输入正确的 11 位手机号', trigger: 'blur' }],
}

const preferenceRules = {
  expectedPosition: [{ required: true, message: '请输入期望职位', trigger: 'blur' }],
  salaryMin: [{ validator: validateSalaryRange, trigger: 'change' }],
  salaryMax: [{ validator: validateSalaryRange, trigger: 'change' }],
}

const isNewResume = computed(() => !activeResumeId.value)
const displayInitial = computed(() => (basicForm.realName || '我').slice(0, 1))
const hasPreference = computed(() =>
  Boolean(
    preferenceForm.expectedPosition || preferenceForm.expectedCity || preferenceForm.description,
  ),
)
const hasPreviewContent = computed(() =>
  Boolean(basicForm.realName || basicForm.headline || basicForm.summary || hasPreference.value),
)
const preferenceMeta = computed(() => {
  const parts = [
    preferenceForm.expectedCity,
    preferenceForm.salaryText || salaryRangeText.value,
  ].filter(Boolean)
  return parts.join(' · ')
})
const salaryRangeText = computed(() => {
  if (preferenceForm.salaryMin === undefined && preferenceForm.salaryMax === undefined) {
    return ''
  }

  return `${preferenceForm.salaryMin ?? '面议'}-${preferenceForm.salaryMax ?? '面议'} 元/月`
})

function validateSalaryRange(_rule, _value, callback) {
  const { salaryMin, salaryMax } = preferenceForm

  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
    callback(new Error('最低薪资不能高于最高薪资'))
    return
  }

  callback()
}

const saveBasicInfo = async () => {
  const valid = await basicFormRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }

  basicSaving.value = true

  try {
    if (isNewResume.value) {
      const response = await createResume(toBasicPayload())
      activeResumeId.value = response.data.data
      completionRate.value = EMPTY_COMPLETION_RATE
      if (props.embedded) {
        emit('created', activeResumeId.value)
        ElMessage.success('简历已创建，可以继续填写其他内容')
        return
      }
      await router.replace({ path: '/layout/resume/edit', query: { id: activeResumeId.value } })
      ElMessage.success('简历已创建，现在可以继续填写求职意向')
      return
    }

    await updateResumeBasic(activeResumeId.value, toBasicPayload())
    ElMessage.success('基础信息已保存')
    await refreshCompletionRate()
  } catch (error) {
    console.error('保存基础信息失败：', error)
    ElMessage.error('保存基础信息失败')
  } finally {
    basicSaving.value = false
  }
}

const savePreference = async () => {
  const valid = await preferenceFormRef.value.validate().catch(() => false)
  if (!valid || isNewResume.value) {
    return
  }

  preferenceSaving.value = true

  try {
    const preferencePayload = toPreferencePayload()
    delete preferencePayload.id

    if (preferenceForm.id) {
      await updateJobPreference(preferenceForm.id, preferencePayload)
    } else {
      await createJobPreference(activeResumeId.value, preferencePayload)
    }

    ElMessage.success('求职意向已保存')
    await loadResumeDetail()
  } catch (error) {
    console.error('保存求职意向失败：', error)
    ElMessage.error('保存求职意向失败')
  } finally {
    preferenceSaving.value = false
  }
}

const loadResumeDetail = async () => {
  if (isNewResume.value) {
    return
  }

  pageLoading.value = true
  const requestVersion = ++detailRequestVersion
  const requestedResumeId = activeResumeId.value

  try {
    const response = await getResumeAggregateDetail(requestedResumeId)
    if (requestVersion !== detailRequestVersion || requestedResumeId !== activeResumeId.value)
      return
    const detail = response.data.data

    applyBasicInfo(detail?.resume)
    applyPreference(detail?.jobPreference)
    educations.value = detail?.educations ?? []
    experiences.value = detail?.experiences ?? []
    projects.value = detail?.projects ?? []
    skills.value = detail?.skills ?? []
    certs.value = detail?.certs ?? []
    links.value = detail?.links ?? []
    completionRate.value = detail?.resume?.completionRate ?? EMPTY_COMPLETION_RATE
    emit('changed')
  } catch (error) {
    if (requestVersion !== detailRequestVersion) return
    console.error('获取简历详情失败：', error)
    ElMessage.error('获取简历详情失败')
  } finally {
    if (requestVersion === detailRequestVersion) {
      pageLoading.value = false
    }
  }
}

const refreshCompletionRate = async () => {
  await loadResumeDetail()
}

const applyBasicInfo = (resume) => {
  if (!resume) {
    return
  }

  Object.assign(basicForm, {
    title: resume.title ?? '',
    realName: resume.realName ?? '',
    gender: resume.gender ?? '',
    birthday: resume.birthday ?? '',
    email: resume.email ?? '',
    phone: resume.phone ?? '',
    currentCity: resume.currentCity ?? '',
    politicsStatus: resume.politicsStatus ?? '',
    headline: resume.headline ?? '',
    summary: resume.summary ?? '',
  })
}

const applyPreference = (preference) => {
  Object.assign(preferenceForm, {
    id: preference?.id ?? null,
    expectedPosition: preference?.expectedPosition ?? '',
    expectedCity: preference?.expectedCity ?? '',
    salaryMin: preference?.salaryMin ?? undefined,
    salaryMax: preference?.salaryMax ?? undefined,
    salaryText: preference?.salaryText ?? '',
    availableDate: preference?.availableDate ?? '',
    description: preference?.description ?? '',
  })
}

const toBasicPayload = () => ({
  ...basicForm,
  birthday: basicForm.birthday || null,
  phone: basicForm.phone?.trim() || null
})

const toPreferencePayload = () => ({
  ...preferenceForm,
  availableDate: preferenceForm.availableDate || null,
})

const formatEducationPeriod = (education) => {
  const dates = [education.startDate, education.endDate].filter(Boolean)
  return dates.length ? dates.join(' - ') : '时间待补充'
}

const formatExperiencePeriod = (experience) => {
  if (experience.periodText) {
    return experience.periodText
  }

  const dates = [experience.startDate, experience.endDate].filter(Boolean)
  return dates.length ? dates.join(' - ') : '时间待补充'
}

const formatProjectPeriod = (project) => {
  if (project.periodText) {
    return project.periodText
  }

  const dates = [project.startDate, project.endDate].filter(Boolean)
  return dates.length ? dates.join(' - ') : '时间待补充'
}

const scrollToPreference = async () => {
  await scrollToSection('preference-section')
}

const scrollToEducation = async () => {
  await scrollToSection('education-section')
}

const scrollToExperience = async () => {
  await scrollToSection('experience-section')
}

const scrollToProject = async () => {
  await scrollToSection('project-section')
}

const scrollToSkill = async () => {
  await scrollToSection('skill-section')
}

const scrollToExtras = async () => {
  await scrollToSection('extras-section')
}

const scrollToSection = async (sectionId) => {
  await nextTick()
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const goBack = () => router.push('/layout/resume')

const resetEditor = () => {
  Object.assign(basicForm, {
    title: '',
    realName: '',
    gender: '',
    birthday: '',
    email: '',
    phone: '',
    currentCity: '',
    politicsStatus: '',
    headline: '',
    summary: '',
  })
  Object.assign(preferenceForm, {
    id: null,
    expectedPosition: '',
    expectedCity: '',
    salaryMin: undefined,
    salaryMax: undefined,
    salaryText: '',
    availableDate: '',
    description: '',
  })
  educations.value = []
  experiences.value = []
  projects.value = []
  skills.value = []
  certs.value = []
  links.value = []
  completionRate.value = EMPTY_COMPLETION_RATE
}

watch(
  () => props.resumeId,
  (id) => {
    if (!props.embedded) return
    detailRequestVersion += 1
    activeResumeId.value = id
    if (id) loadResumeDetail()
    else resetEditor()
  },
)

onMounted(() => {
  if (props.embedded) return
  const routeResumeId = Number(route.query.id)
  if (Number.isInteger(routeResumeId) && routeResumeId >= MIN_RESUME_ID) {
    activeResumeId.value = routeResumeId
    loadResumeDetail()
  }
})
</script>

<style scoped>
.resume-workspace {
  --resume-surface: #ffffff;
  --resume-surface-soft: #f8fcfb;
  --resume-border: #dce9e6;
  --resume-ink: #13223e;
  --resume-muted: #65758d;
  --resume-accent: #10b98a;
  --resume-accent-soft: #e9faf5;
  width: min(100%, 1360px);
  margin: 0 auto;
  padding: 8px 0 42px;
}
.resume-workspace :deep(.el-button--primary:not(.is-text)) {
  border-color: var(--resume-accent);
  background: var(--resume-accent);
}
.resume-workspace :deep(.el-button--primary:not(.is-text):hover),
.resume-workspace :deep(.el-button--primary:not(.is-text):focus) {
  border-color: var(--sr-primary-dark);
  background: var(--sr-primary-dark);
}
.resume-workspace.embedded {
  width: 100%;
  height: calc(100vh - 116px);
  min-height: 600px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(430px, 1fr) 320px;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 0 14px;
}
.workspace-header,
.title-row,
.section-heading,
.section-nav,
.editor-layout,
.preview-heading,
.preview-profile,
.preview-contact,
.preview-preference-line {
  display: flex;
}
.workspace-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  padding: 18px 20px;
  border: 1px solid var(--resume-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 30px rgba(26, 54, 72, 0.05);
}
.resume-workspace.embedded .workspace-header {
  grid-column: 1;
  margin: 0;
  padding: 15px 18px 12px;
  border: 1px solid var(--resume-border);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  box-shadow: none;
}
.resume-workspace.embedded .eyebrow {
  display: none;
}
.resume-workspace.embedded .title-row {
  gap: 20px;
}
.resume-workspace.embedded .title-row h2 {
  font-size: 23px;
}
.resume-workspace.embedded .completion-indicator {
  width: 155px;
  padding: 0 0 0 14px;
}
.resume-workspace.embedded .workspace-header > :deep(.el-button--primary) {
  border-color: var(--sr-primary);
  background: var(--sr-primary);
}
.resume-workspace.embedded .workspace-header > :deep(.el-button--primary:hover),
.resume-workspace.embedded .workspace-header > :deep(.el-button--primary:focus) {
  border-color: var(--sr-primary-dark);
  background: var(--sr-primary-dark);
}
.back-button {
  margin: 0 0 8px;
  padding-left: 0;
  color: var(--resume-muted);
}
.title-row {
  align-items: center;
  gap: 32px;
}
.eyebrow {
  margin: 0 0 5px;
  color: var(--resume-accent);
  font-size: 12px;
  font-weight: 750;
  line-height: 1.3;
}
.title-row h2 {
  margin: 0;
  color: var(--resume-ink);
  font-size: 28px;
}
.completion-indicator {
  display: grid;
  width: 180px;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  padding: 9px 12px;
  border-left: 1px solid var(--resume-border);
  color: var(--resume-muted);
  font-size: 13px;
}
.completion-indicator strong {
  color: var(--sr-ink);
}
.completion-indicator :deep(.el-progress) {
  grid-column: 1 / -1;
  margin-top: 6px;
}
.completion-indicator :deep(.el-progress-bar__outer) {
  background: #e8eef4;
}
.completion-indicator :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, var(--sr-primary-dark), #6ed7bd);
}
.section-nav {
  gap: 8px;
  position: sticky;
  top: 82px;
  z-index: 8;
  margin-bottom: 18px;
  padding: 7px;
  overflow-x: auto;
  border: 1px solid var(--resume-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 22px rgba(26, 54, 72, 0.05);
}
.resume-workspace.embedded .section-nav {
  position: static;
  grid-column: 1;
  margin: 0;
  padding: 0 18px;
  border: 1px solid var(--resume-border);
  border-radius: 0;
  border-bottom-color: #e7eff2;
  box-shadow: none;
}
.resume-workspace.embedded .section-tab {
  min-height: 46px;
  padding: 0 1px;
  border-radius: 0;
  border-bottom: 3px solid transparent;
}
.resume-workspace.embedded .section-tab.active,
.resume-workspace.embedded .section-tab:hover {
  background: transparent;
  color: var(--resume-accent);
}
.resume-workspace.embedded .section-tab.active {
  border-bottom-color: var(--resume-accent);
}
.section-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--sr-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
}
.section-tab:hover,
.section-tab.active {
  background: var(--resume-accent-soft);
  color: #087d5e;
}
.editor-layout {
  align-items: flex-start;
  gap: 22px;
}
.resume-workspace.embedded .editor-layout {
  display: contents;
}
.editor-panel {
  min-width: 0;
  flex: 1;
}
.resume-workspace.embedded .editor-panel {
  grid-column: 1;
  grid-row: 3;
  height: 100%;
  overflow: auto;
  padding: 0 18px 22px;
  border: 1px solid var(--resume-border);
  border-top: 0;
  border-radius: 0 0 8px 8px;
  background: #fff;
}
.form-section,
.preview-panel {
  border: 1px solid var(--resume-border);
  border-radius: 8px;
  background: var(--resume-surface);
  box-shadow: 0 12px 28px rgba(26, 54, 72, 0.045);
}
.resume-workspace.embedded .preview-panel {
  position: static;
  grid-column: 2;
  grid-row: 1 / 4;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: auto;
  border: 1px solid var(--resume-border);
  background: rgba(255, 255, 255, 0.96);
}
.resume-workspace.embedded .preview-heading {
  position: sticky;
  top: 0;
  z-index: 2;
  margin: 0;
  padding: 14px;
  border-bottom: 1px solid #e7eff2;
  background: rgba(255, 255, 255, 0.97);
}
.resume-workspace.embedded .preview-heading .eyebrow {
  display: none;
}
.resume-workspace.embedded .preview-heading h3 {
  font-size: 18px;
}
.resume-workspace.embedded .template-select {
  width: 138px;
}
.resume-workspace.embedded .resume-preview {
  min-height: calc(100% - 76px);
  margin: 14px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 4px 0 0 rgba(18, 184, 134, 0.8);
}
.form-section {
  padding: 26px;
}
.preference-section {
  margin-top: 18px;
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
  border-radius: 7px;
  background: var(--resume-accent-soft);
  color: var(--resume-accent);
  font-size: 19px;
}
.section-heading h3,
.preview-heading h3 {
  margin: 0;
  color: var(--resume-ink);
  font-size: 20px;
  line-height: 1.35;
}
.section-heading p {
  margin: 4px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.5;
}
.form-grid {
  display: grid;
  gap: 0 16px;
}
.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.form-section :deep(.el-select),
.form-section :deep(.el-date-editor),
.form-section :deep(.el-input-number) {
  width: 100%;
}
.section-actions {
  display: flex;
  justify-content: flex-end;
}
.preview-panel {
  position: sticky;
  top: 150px;
  width: min(100%, 380px);
  padding: 18px;
  background: #f6fcfa;
}
.preview-heading {
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.template-select {
  width: 126px;
}
.resume-preview {
  min-height: 540px;
  padding: 26px;
  border: 1px solid #d8e8e3;
  border-left: 4px solid var(--resume-accent);
  border-radius: 8px;
  background: #fff;
}
.resume-preview.compact {
  padding: 18px;
  font-size: 13px;
}
.preview-profile {
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--sr-line);
}
.preview-profile h4 {
  margin: 0;
  color: var(--sr-ink);
  font-size: 32px;
  line-height: 1.2;
}
.preview-profile p {
  margin: 8px 0 0;
  color: var(--sr-primary-dark);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
}
.preview-avatar {
  display: grid;
  width: 68px;
  height: 78px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: #e9f7f3;
  color: var(--sr-ink);
  font-size: 33px;
  font-weight: 750;
}
.preview-contact {
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  color: var(--sr-muted);
  font-size: 13px;
}
.preview-contact span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.preview-section {
  padding-top: 17px;
  border-top: 1px solid var(--sr-line);
}
.preview-section + .preview-section {
  margin-top: 18px;
}
.preview-section h5 {
  position: relative;
  margin: 0 0 13px;
  padding-left: 12px;
  color: var(--sr-ink);
  font-size: 17px;
  line-height: 1.3;
}
.preview-section h5::before {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 0;
  width: 4px;
  border-radius: 4px;
  background: var(--resume-accent);
  content: '';
}
.preview-preference-line {
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  color: var(--sr-ink);
  font-size: 14px;
}
.preview-preference-line span {
  color: var(--sr-muted);
  text-align: right;
}
.preview-section p {
  margin: 9px 0 0;
  color: var(--sr-text);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-line;
}
.preview-education + .preview-education {
  margin-top: 14px;
}
.preview-education > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--sr-ink);
  font-size: 14px;
  line-height: 1.5;
}
.preview-education span,
.preview-education time {
  color: var(--sr-muted);
  font-size: 13px;
}
.preview-education time {
  display: block;
  margin-top: 3px;
}
.preview-education p {
  margin-top: 4px;
}
.preview-experience + .preview-experience {
  margin-top: 16px;
}
.preview-experience > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--sr-ink);
  font-size: 14px;
  line-height: 1.5;
}
.preview-experience > div span {
  color: var(--sr-muted);
  font-size: 13px;
  text-align: right;
}
.preview-experience > p {
  margin-top: 4px;
}
.preview-experience .preview-achievement {
  color: var(--sr-primary-dark);
}
.preview-project + .preview-project {
  margin-top: 16px;
}
.preview-project > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--sr-ink);
  font-size: 14px;
  line-height: 1.5;
}
.preview-project > div span {
  color: var(--sr-muted);
  font-size: 13px;
  text-align: right;
}
.preview-project > p {
  margin-top: 4px;
}
.preview-project .preview-stack {
  display: inline-block;
  padding: 3px 7px;
  border-radius: 5px;
  background: var(--sr-primary-soft);
  color: var(--sr-primary-dark);
}
.preview-project .preview-achievement {
  color: var(--sr-primary-dark);
}
.preview-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.preview-skills span {
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--sr-primary-soft);
  color: var(--sr-primary-dark);
  font-size: 13px;
  font-weight: 650;
}
.preview-extra-line + .preview-extra-line {
  margin-top: 10px;
}
.preview-extra-line strong,
.preview-extra-line span,
.preview-extra-line a {
  display: block;
}
.preview-extra-line strong {
  color: var(--sr-ink);
  font-size: 14px;
  line-height: 1.5;
}
.preview-extra-line span,
.preview-extra-line a {
  margin-top: 3px;
  color: var(--sr-muted);
  font-size: 13px;
  line-height: 1.5;
}
.preview-extra-line a {
  color: var(--sr-primary-dark);
}

/* Child CRUD sections share the same editor surface without duplicating markup. */
.editor-panel :deep(.form-section) {
  border-color: var(--resume-border);
  box-shadow: 0 12px 28px rgba(26, 54, 72, 0.045);
}
.resume-workspace.embedded .editor-panel :deep(.form-section) {
  margin-top: 0;
  padding: 18px 2px;
  border: 0;
  border-bottom: 1px solid #edf4f7;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.resume-workspace.embedded .editor-panel :deep(.form-section:last-child) {
  border-bottom: 0;
}
.resume-workspace.embedded .editor-panel :deep(.section-heading) {
  margin-bottom: 14px;
  padding-bottom: 0;
  border-bottom: 0;
}
.resume-workspace.embedded .editor-panel :deep(.section-icon) {
  width: 34px;
  height: 34px;
}
.resume-workspace.embedded .editor-panel :deep(.section-heading h3) {
  font-size: 18px;
}
.resume-workspace.embedded .editor-panel :deep(.section-heading p) {
  font-size: 12px;
}
.resume-workspace.embedded .editor-panel :deep(.education-item),
.resume-workspace.embedded .editor-panel :deep(.experience-item),
.resume-workspace.embedded .editor-panel :deep(.project-item),
.resume-workspace.embedded .editor-panel :deep(.skill-item),
.resume-workspace.embedded .editor-panel :deep(.extra-item) {
  background: #fff;
}
.editor-panel :deep(.section-heading) {
  padding-bottom: 18px;
  border-bottom: 1px solid #edf3f1;
}
.editor-panel :deep(.section-icon) {
  border-radius: 7px;
  background: var(--resume-accent-soft);
  color: var(--resume-accent);
}
.editor-panel :deep(.education-item),
.editor-panel :deep(.experience-item),
.editor-panel :deep(.project-item),
.editor-panel :deep(.skill-item),
.editor-panel :deep(.extra-item) {
  border-color: #e1ece9;
  background: var(--resume-surface-soft);
  box-shadow: none;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;
}
.editor-panel :deep(.education-item:hover),
.editor-panel :deep(.experience-item:hover),
.editor-panel :deep(.project-item:hover),
.editor-panel :deep(.skill-item:hover),
.editor-panel :deep(.extra-item:hover) {
  border-color: #a7dfce;
  background: #ffffff;
}
.editor-panel :deep(.group-heading) {
  padding: 11px 0;
  border-bottom-color: #dfece8;
}
.editor-panel :deep(.el-empty) {
  padding: 20px 0 6px;
}
.editor-panel :deep(.el-button--primary.is-plain) {
  border-color: #b8e7d8;
  background: var(--resume-accent-soft);
  color: #087d5e;
}
.editor-panel :deep(.el-button--primary.is-plain:hover) {
  border-color: var(--resume-accent);
  background: #d9f6ed;
}
.editor-panel :deep(.el-input__wrapper),
.editor-panel :deep(.el-select__wrapper),
.editor-panel :deep(.el-textarea__inner) {
  background: #fcfefd;
  box-shadow: 0 0 0 1px #dce9e6 inset;
}
.editor-panel :deep(.el-input__wrapper:hover),
.editor-panel :deep(.el-select__wrapper:hover),
.editor-panel :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #a9d9cc inset;
}
.preview-empty {
  margin: 54px 0 0;
  color: var(--sr-muted);
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}
@media (max-width: 1060px) {
  .editor-layout {
    flex-direction: column;
  }
  .preview-panel {
    position: static;
    width: 100%;
  }
  .resume-preview {
    min-height: auto;
  }
}
@media (max-width: 1180px) {
  .resume-workspace.embedded {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}
@media (max-width: 860px) {
  .resume-workspace.embedded {
    height: auto;
    min-height: 0;
    overflow: visible;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto;
    gap: 0;
  }
  .resume-workspace.embedded .workspace-header,
  .resume-workspace.embedded .section-nav,
  .resume-workspace.embedded .editor-panel,
  .resume-workspace.embedded .preview-panel {
    grid-column: 1;
  }
  .resume-workspace.embedded .workspace-header {
    grid-row: 1;
  }
  .resume-workspace.embedded .section-nav {
    grid-row: 2;
  }
  .resume-workspace.embedded .editor-panel {
    grid-row: 3;
    height: auto;
    overflow: visible;
    border-top: 0;
    border-radius: 0 0 8px 8px;
  }
  .resume-workspace.embedded .preview-panel {
    grid-row: 4;
    height: auto;
    margin-top: 12px;
  }
  .resume-workspace.embedded .resume-preview {
    min-height: 0;
  }
}
@media (max-width: 640px) {
  .workspace-header,
  .title-row {
    align-items: stretch;
    flex-direction: column;
  }
  .workspace-header :deep(.el-button--primary) {
    width: 100%;
  }
  .completion-indicator {
    width: 100%;
  }
  .form-section {
    padding: 18px;
  }
  .two-columns {
    grid-template-columns: 1fr;
  }
  .preview-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .template-select {
    width: 100%;
  }
  .resume-preview {
    padding: 18px;
  }
  .preview-profile h4 {
    font-size: 26px;
  }
}
</style>
