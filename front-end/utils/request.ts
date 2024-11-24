import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { env } from 'process'

// 创建一个 axios 实例
const instance = axios.create({
  baseURL: env.BASE_URL, // 替换为你的 API 基础 URL
  timeout: 10000, // 请求超时时间
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    console.log('请求拦截:', config)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做些什么
    console.log('响应拦截:', response)
    return response.data
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error)
  }
)

// 封装的网络请求函数
export const request = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await instance.get(url, config)
    return response
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}
