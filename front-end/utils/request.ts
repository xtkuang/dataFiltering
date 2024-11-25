import axios from 'axios'
import { message } from 'antd'
// import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: 'http://127.0.0.1:8000', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000, // request timeout
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent
    // *为每个请求的请求头增添 token

    if (localStorage?.getItem('token')) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] =
        'Bearer ' + localStorage.getItem('token')
    }
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data

    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      message.error(res.msg || 'Error')
      // !处理登录状态失效的逻辑
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   // to re-login
      //   MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
      //     confirmButtonText: 'Re-Login',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning'
      //   }).then(() => {
      //     store.dispatch('user/resetToken').then(() => {
      //       location.reload()
      //     })
      //   })
      // }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return Promise.resolve(response.data)
    }
  },
  (error) => {
    console.log('err' + error) // for debug
    message.error(error.message)

    return Promise.reject(error)
  }
)

export default service
