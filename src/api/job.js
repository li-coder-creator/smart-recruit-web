import request from '@/utils/request'

// 发布岗位
export const addJob = (data) => {
    return request.post('/job', data)
}

// 查询岗位列表
export const getJobList = () => {
    return request.get('/job')
}

// 查询岗位详情
export const getJobDetail = (id) => {
    return request.get(`/job/${id}`)
}

// 修改岗位
export const updateJob = (data) => {
    return request.put('/job', data)
}

// 删除岗位
export const deleteJob = (id) => {
    return request.delete(`/job/${id}`)
}