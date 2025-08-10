/**
 * API使用示例 - 展示如何正确处理HTTP状态码
 */

const { api, isNotModified, isClientError, isServerError } = require('./utils/api.js')

// 示例1: 正确处理304 Not Modified
async function loadStructure() {
  try {
    const structure = await api.getStructure('some-etag-value')
    
    if (structure === null) {
      console.log('数据未更新，使用缓存数据')
      // 使用缓存的数据
      return getCachedStructure()
    }
    
    console.log('获取到新的结构数据:', structure)
    return structure
    
  } catch (error) {
    if (isClientError(error)) {
      console.error('客户端错误:', error.statusCode, error.message)
    } else if (isServerError(error)) {
      console.error('服务器错误:', error.statusCode, error.message)
    } else {
      console.error('网络错误:', error.message)
    }
    
    // 降级到缓存数据
    return getCachedStructure()
  }
}

// 示例2: 处理不同HTTP状态码
async function loadIssueContent(filePath) {
  try {
    const content = await api.getIssue(filePath)
    return content
    
  } catch (error) {
    switch (error.statusCode) {
      case 404:
        console.log('文件不存在')
        return null
        
      case 403:
        console.log('没有访问权限')
        throw new Error('访问被拒绝')
        
      case 500:
        console.log('服务器错误，稍后重试')
        // 可以实现重试逻辑
        throw error
        
      default:
        if (isClientError(error)) {
          console.error('客户端请求错误:', error.statusCode)
        } else if (isServerError(error)) {
          console.error('服务器内部错误:', error.statusCode)
        }
        throw error
    }
  }
}

// 示例3: 条件请求和缓存处理
async function getStructureWithCache() {
  const cachedData = getCachedStructure()
  const etag = cachedData ? cachedData.etag : null
  
  try {
    const freshData = await api.getStructure(etag)
    
    if (freshData === null) {
      // 304 Not Modified - 数据未更新，使用缓存
      console.log('使用缓存数据 (304 Not Modified)')
      return cachedData.data
    }
    
    // 获取到新数据，更新缓存
    console.log('获取到新数据，更新缓存')
    setCachedStructure({
      data: freshData,
      etag: freshData.etag // 假设API返回新的etag
    })
    
    return freshData
    
  } catch (error) {
    if (isNotModified(error)) {
      // 这种情况不应该发生，因为我们已经在api.getStructure中处理了304
      console.log('数据未修改，使用缓存')
      return cachedData ? cachedData.data : null
    }
    
    // 网络错误或其他错误，降级到缓存
    if (cachedData) {
      console.warn('API请求失败，使用缓存数据:', error.message)
      return cachedData.data
    }
    
    throw error
  }
}

// 缓存辅助函数（示例实现）
function getCachedStructure() {
  try {
    const cached = wx.getStorageSync('structure_cache')
    return cached || null
  } catch (error) {
    return null
  }
}

function setCachedStructure(data) {
  try {
    wx.setStorageSync('structure_cache', data)
  } catch (error) {
    console.warn('缓存失败:', error)
  }
}

module.exports = {
  loadStructure,
  loadIssueContent,
  getStructureWithCache
}
