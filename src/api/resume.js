import request from '@/utils/request'

// 添加简历
export const addResume = (data) => {
    return request.post('/resume', data)
}

// 获取当前用户所有简历
export const getResumeList = () => {
    return request.get('/resume')
}

// 获取简历详情
export const getResumeDetail = (id) => {
    return request.get(`/resume/${id}`)
}

// 修改简历
export const updateResume = (data) => {
    return request.put('/resume', data)
}

// 删除简历
export const deleteResume = (id) => {
    return request.delete(`/resume/${id}`)
}