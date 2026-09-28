import axios from "axios"
import { ElMessage } from "element-plus"
import router from "@/router"

const API_SUCCESS_CODE = 200

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

    response => {
        const result = response.data

        if (
            result &&
            typeof result.code === "number" &&
            result.code !== API_SUCCESS_CODE
        ) {
            return Promise.reject(new Error(result.message || "请求失败"))
        }

        return response
    },

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
