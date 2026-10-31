import request from '@/utils/request'

// 求职者投递岗位
export const applyJob = (data) => {
  return request.post('/application', data)
}
// 求职者查看我的投递
export const getJobseekerApplication = () => {
  return request.get('/application/mine')
}

// 企业查看收到的投递
export const getApplicationList = () => {
  return request.get('/application/my')
}

// 查看投递详情
export const getApplicationDetail = (id) => {
  return request.get(`/application/${id}`)
}

// 修改投递状态
export const updateApplicationStatus = (id, data) => {
  return request.put(`/application/${id}/status`, data)
}

// 新求职者入口与原企业详情分开，避免混用两个响应契约。
export const getMyApplicationPage = (params, config = {}) =>
  request.get('/application/mine/page', { ...config, params })
export const getMyApplicationOverview = (config = {}) =>
  request.get('/application/mine/overview', config)
export const getMyApplicationDetail = (id, config = {}) =>
  request.get(`/application/mine/${id}`, config)
export const getMyNextInterview = (config = {}) =>
  request.get('/application/mine/interviews/next', config)

export const getApplicationInterviews = (id, config = {}) =>
  request.get(`/application/${id}/interviews`, config)
export const createApplicationInterview = (id, data) =>
  request.post(`/application/${id}/interviews`, data)
export const updateApplicationInterview = (id, interviewId, data) =>
  request.put(`/application/${id}/interviews/${interviewId}`, data)
export const cancelApplicationInterview = (id, interviewId, data) =>
  request.put(`/application/${id}/interviews/${interviewId}/cancel`, data)
