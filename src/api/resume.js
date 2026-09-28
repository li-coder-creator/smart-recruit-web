import request from '@/utils/request'

// 简历主信息
export const createResume = (data) => request.post('/resume', data)

export const getResumePage = (params) => request.get('/resume', { params })

export const getResumeBasic = (resumeId) => request.get(`/resume/${resumeId}`)

export const getResumeAggregateDetail = (resumeId) => request.get(`/resume/${resumeId}/detail`)

export const updateResumeBasic = (resumeId, data) => request.put(`/resume/${resumeId}/basic`, data)

export const deleteResume = (resumeId) => request.delete(`/resume/${resumeId}`)

// 简历状态
export const setDefaultResume = (resumeId) => request.put(`/resume/${resumeId}/default`)

export const updateResumeFavorite = (resumeId, favorite) =>
  request.put(`/resume/${resumeId}/favorite`, { favorite })

export const getResumeCompletionRate = (resumeId) => request.get(`/resume/${resumeId}/completionRate`)

// 求职意向
export const createJobPreference = (resumeId, data) => request.post(`/resume/${resumeId}/preference`, data)

export const getJobPreference = (resumeId) => request.get(`/resume/${resumeId}/preference`)

export const updateJobPreference = (preferenceId, data) => request.put(`/resume/preference/${preferenceId}`, data)

export const deleteJobPreference = (preferenceId) => request.delete(`/resume/preference/${preferenceId}`)

// 教育经历
export const createResumeEducation = (resumeId, data) => request.post(`/resume/${resumeId}/education`, data)

export const getResumeEducations = (resumeId) => request.get(`/resume/${resumeId}/education`)

export const updateResumeEducation = (educationId, data) => request.put(`/resume/education/${educationId}`, data)

export const deleteResumeEducation = (educationId) => request.delete(`/resume/education/${educationId}`)

// 实习 / 工作经历
export const createResumeExperience = (resumeId, data) => request.post(`/resume/${resumeId}/experience`, data)

export const getResumeExperiences = (resumeId) => request.get(`/resume/${resumeId}/experience`)

export const updateResumeExperience = (experienceId, data) => request.put(`/resume/experience/${experienceId}`, data)

export const deleteResumeExperience = (experienceId) => request.delete(`/resume/experience/${experienceId}`)

// 项目经历
export const createResumeProject = (resumeId, data) => request.post(`/resume/${resumeId}/project`, data)

export const getResumeProjects = (resumeId) => request.get(`/resume/${resumeId}/project`)

export const updateResumeProject = (projectId, data) => request.put(`/resume/project/${projectId}`, data)

export const deleteResumeProject = (projectId) => request.delete(`/resume/project/${projectId}`)

// 专业技能
export const createResumeSkill = (resumeId, data) => request.post(`/resume/${resumeId}/skill`, data)

export const getResumeSkills = (resumeId) => request.get(`/resume/${resumeId}/skill`)

export const updateResumeSkill = (skillId, data) => request.put(`/resume/skill/${skillId}`, data)

export const deleteResumeSkill = (skillId) => request.delete(`/resume/skill/${skillId}`)

// 证书荣誉
export const createResumeCert = (resumeId, data) => request.post(`/resume/${resumeId}/cert`, data)

export const getResumeCerts = (resumeId) => request.get(`/resume/${resumeId}/cert`)

export const updateResumeCert = (certId, data) => request.put(`/resume/cert/${certId}`, data)

export const deleteResumeCert = (certId) => request.delete(`/resume/cert/${certId}`)

// 作品链接
export const createResumeLink = (resumeId, data) => request.post(`/resume/${resumeId}/link`, data)

export const getResumeLinks = (resumeId) => request.get(`/resume/${resumeId}/link`)

export const updateResumeLink = (linkId, data) => request.put(`/resume/link/${linkId}`, data)

export const deleteResumeLink = (linkId) => request.delete(`/resume/link/${linkId}`)

// 旧页面过渡兼容：列表页和编辑页改造完成后删除。
export const addResume = createResume

export const getResumeList = () => getResumePage({ pageNum: 1, pageSize: 100 })

export const getResumeDetail = getResumeBasic

export const updateResume = (data) => updateResumeBasic(data.id, data)
