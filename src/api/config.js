import axios from 'axios'
import { Toast } from 'vant'
import router from '@/router'

axios.defaults.baseURL = 'http://127.0.0.1:8888'
// 超时时间
const instance = axios.create({ timeout: 1000 * 12 })
// POST请求类型
instance.defaults.headers.post['Content-Type'] = 'application/json'

// 错误提示框
const errorTip = (message) => {
  Toast.fail({
    duration: 3000,
    forbidClick: true,
    message: message
  })
}
// 状态码处理
const errorHandle = (status) => {
  switch (status) {
    case 401:
      // 显示登陆窗口
      router.push('/index/login')
      break
  }
}

// 发起请求
instance.interceptors.request.use(
  // 遮罩层请求Loading显示
  config => {
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    })
    // 获取Token
    const token = localStorage.getItem('token')
    // 如果Token不为空就将Token放入头
    token && (config.headers.Authorization = token)
    return config
  },
  error => Promise.error(error))

// 响应
instance.interceptors.response.use(
  // 响应成功
  res => {
    // 遮罩层请求Loading关闭
    Toast.clear()
    if (res.status === 200) {
      if (res.data.code !== 200) {
        res.data.message && errorTip(res.data.message)
        // 状态码不对，判断状态码对应操作
        errorHandle(res.data.code)
        // 状态码不对，提示错误信息
        return new Promise(() => {})
      }
      return res.data
    } else {
      // 响应码是2XX 出现问题
      res.data.message && errorTip('请求异常，请重试！')
      return Promise.reject(res)
    }
  },
  // 响应异常响应码不是2xx
  error => {
    Toast.clear()
    const { response } = error
    if (response) { // 如果响应体不为空
      response.data.message && errorTip(response.data.message)
      errorHandle(response.status)
      return Promise.reject(response)
    }
  })

export default instance
