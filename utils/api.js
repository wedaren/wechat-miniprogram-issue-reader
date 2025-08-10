// API 配置和工具函数
const API_CONFIG = {
  BASE_URL: 'https://wxtest.wedaren.tech',
  VERSION: 'v1',
  TIMEOUT: 10000, // 10秒超时
  CACHE_TTL: 5 * 60 * 1000 // 5分钟缓存
}

// API 接口地址
const API_ENDPOINTS = {
  HEALTH: '/health',
  STRUCTURE: '/v1/kb/structure', 
  ISSUE: '/v1/kb/issue',
  SYNC_STATUS: '/v1/kb/sync-status',
  FORCE_SYNC: '/v1/kb/force-sync'
}

// 网络请求封装
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    // 默认配置
    const defaultOptions = {
      timeout: API_CONFIG.TIMEOUT,
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      dataType: 'json'
    }
    
    // 合并配置
    const finalOptions = {
      ...defaultOptions,
      ...options,
      url: url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`,
      success: (res) => {
        const duration = Date.now() - startTime
        console.log(`[API] ${options.method || 'GET'} ${url} - ${res.statusCode} (${duration}ms)`)
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          // 创建错误对象并附加状态码和响应信息
          const error = new Error(`HTTP ${res.statusCode}: ${res.data?.error?.message || 'Unknown error'}`)
          error.statusCode = res.statusCode
          error.response = res
          error.data = res.data
          reject(error)
        }
      },
      fail: (error) => {
        const duration = Date.now() - startTime
        console.error(`[API] ${options.method || 'GET'} ${url} - Failed (${duration}ms)`, error)
        reject(error)
      }
    }
    
    wx.request(finalOptions)
  })
}

// GET 请求
const get = (url, params = {}, options = {}) => {
  // 构建查询参数
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request(fullUrl, {
    ...options,
    method: 'GET'
  })
}

// POST 请求
const post = (url, data = {}, options = {}) => {
  return request(url, {
    ...options,
    method: 'POST',
    data
  })
}

// API 接口封装
const api = {
  // 健康检查
  async health() {
    return await get(API_ENDPOINTS.HEALTH)
  },

  // 获取知识库结构
  async getStructure(etag = null) {
    const headers = {
      'Accept': 'application/json'
    }
    
    if (etag) {
      headers['If-None-Match'] = etag
    }
    
    try {
      return await get(API_ENDPOINTS.STRUCTURE, {}, { 
        header: headers
      })
    } catch (error) {
      // 检查是否为304 Not Modified
      if (error.statusCode === 304) {
        console.log('[API] Structure not modified (304)')
        return null // 返回null表示数据未更新
      }
      throw error
    }
  },

  // 获取问题内容
  async getIssue(filePath) {
    if (!filePath) {
      throw new Error('filePath is required')
    }
    
    return await get(API_ENDPOINTS.ISSUE, { path: filePath })
  },

  // 获取同步状态
  async getSyncStatus() {
    return await get(API_ENDPOINTS.SYNC_STATUS)
  },

  // 手动触发同步
  async forceSync() {
    return await post(API_ENDPOINTS.FORCE_SYNC)
  }
}

// 缓存工具
const cache = {
  // 获取缓存
  get(key) {
    try {
      const item = wx.getStorageSync(`cache_${key}`)
      if (!item) return null
      
      const { data, timestamp, ttl } = item
      if (Date.now() - timestamp > ttl) {
        wx.removeStorageSync(`cache_${key}`)
        return null
      }
      
      return data
    } catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  },

  // 设置缓存
  set(key, data, ttl = API_CONFIG.CACHE_TTL) {
    try {
      wx.setStorageSync(`cache_${key}`, {
        data,
        timestamp: Date.now(),
        ttl
      })
    } catch (error) {
      console.warn('Cache set error:', error)
    }
  },

  // 删除缓存
  remove(key) {
    try {
      wx.removeStorageSync(`cache_${key}`)
    } catch (error) {
      console.warn('Cache remove error:', error)
    }
  },

  // 清空所有缓存
  clear() {
    try {
      const keys = wx.getStorageInfoSync().keys
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          wx.removeStorageSync(key)
        }
      })
    } catch (error) {
      console.warn('Cache clear error:', error)
    }
  }
}

// 状态码检查工具
const isHttpError = (error) => {
  return error && typeof error.statusCode === 'number'
}

const isClientError = (error) => {
  return isHttpError(error) && error.statusCode >= 400 && error.statusCode < 500
}

const isServerError = (error) => {
  return isHttpError(error) && error.statusCode >= 500
}

const isNotModified = (error) => {
  return isHttpError(error) && error.statusCode === 304
}

// 错误处理工具
const handleError = (error, defaultMessage = '网络请求失败') => {
  let message = defaultMessage
  
  if (error.statusCode) {
    // HTTP 状态码错误
    switch (error.statusCode) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '未授权访问'
        break
      case 403:
        message = '访问被拒绝'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 502:
        message = '服务器网关错误'
        break
      case 503:
        message = '服务暂时不可用'
        break
      default:
        message = error.message || `HTTP ${error.statusCode} 错误`
    }
  } else if (error.errMsg) {
    // 微信小程序错误
    if (error.errMsg.includes('timeout')) {
      message = '请求超时，请检查网络连接'
    } else if (error.errMsg.includes('fail')) {
      message = '网络连接失败，请检查网络设置'
    }
  } else if (error.message) {
    // 其他错误
    message = error.message
  }
  
  console.error('API Error:', error)
  return message
}

module.exports = {
  API_CONFIG,
  API_ENDPOINTS,
  api,
  cache,
  handleError,
  request,
  get,
  post,
  // 状态码检查工具
  isHttpError,
  isClientError,
  isServerError,
  isNotModified
}
