import axios from "axios"
import { ElMessage } from "element-plus"
import router from "@/router"
// 创建axios实例
const request = axios.create({
    baseURL: "/api",
    timeout: 5000
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(config => {

    const token = localStorage.getItem("token")

    if (token) {
       config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

/**
 * 响应拦截器
 */
request.interceptors.response.use(

    response => response,

    error => {

        if (error.response?.status === 401) {

            ElMessage.error("登录已过期，请重新登录")

            localStorage.removeItem("token")

            router.push("/login")
        }

        return Promise.reject(error)
    }

)

export default request