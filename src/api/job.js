import request from '@/utils/request'
import { toJobSavePayload } from '@/utils/job'

// 返回 Axios response；业务失败由 request 拦截器统一 reject。
// 求职者：岗位列表 data 为 { total, items }，详情 data 为 JobDetailVO。
export const getJobList = (params = {}) => request.get('/job', { params })

export const getJobDetail = (id) => request.get(`/job/${id}`)

// 企业：列表 params 为 page、size、keyword、filter；总览不接收列表筛选。
export const getCompanyJobList = (params = {}) => request.get('/job/company', { params })

export const getCompanyJobDetail = (id) => request.get(`/job/company/${id}`)

export const getCompanyJobOverview = () => request.get('/job/company/overview')

export const getJobRecruitmentProgress = (id) => request.get(`/job/company/${id}/progress`)

export const getJobRecentApplications = (id, params = {}) =>
  request.get(`/job/company/${id}/recent-applications`, { params })

export const getJobActivities = (id, params = {}) =>
  request.get(`/job/company/${id}/activities`, { params })

// 内容接口只发送 JobSaveDTO 字段，不发送归属、状态或审计时间。
export const addJob = (data) => request.post('/job', toJobSavePayload(data))

export const saveJobDraft = (data) => request.post('/job/drafts', toJobSavePayload(data))

export const updateJob = (id, data) => request.put(`/job/${id}`, toJobSavePayload(data))

// 状态变化使用独立接口；只有草稿可以删除。
export const publishJobDraft = (id) => request.put(`/job/${id}/publish`)

export const pauseJob = (id) => request.put(`/job/${id}/pause`)

export const resumeJob = (id) => request.put(`/job/${id}/resume`)

export const endJob = (id) => request.put(`/job/${id}/end`)

export const deleteJob = (id) => request.delete(`/job/${id}`)
