const app = getApp()
const { api, cache } = require('../../utils/api.js')

Page({
  data: {
    apiStatus: 'unknown',
    dataVersion: '',
    cacheStatus: '',
    syncStatus: null,
    loading: {
      health: false,
      sync: false,
      forceSync: false,
      cache: false,
      test: false
    },
    logs: []
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.updateStatus()
  },

  // 初始化页面
  async initPage() {
    this.addLog('页面加载完成', 'info')
    this.updateStatus()
    await this.checkSyncStatus()
  },

  // 更新状态信息
  updateStatus() {
    const dataVersion = app.globalData.version || '未获取'
    const isOnline = app.globalData.isOnline
    const cacheInfo = this.getCacheInfo()
    
    this.setData({
      apiStatus: isOnline ? 'online' : 'offline',
      dataVersion: dataVersion,
      cacheStatus: cacheInfo
    })
  },

  // 获取缓存信息
  getCacheInfo() {
    try {
      const info = wx.getStorageInfoSync()
      return `${info.keys.length} 项，${(info.currentSize / 1024).toFixed(2)} KB`
    } catch (error) {
      return '获取失败'
    }
  },

  // 健康检查
  async testHealth() {
    this.setData({ 'loading.health': true })
    this.addLog('开始健康检查...', 'info')
    
    try {
      const result = await api.health()
      this.addLog(`健康检查成功: ${result.message}`, 'success')
      
      this.setData({ apiStatus: 'online' })
      
      wx.showToast({
        title: '服务正常',
        icon: 'success'
      })
    } catch (error) {
      this.addLog(`健康检查失败: ${error.message}`, 'error')
      this.setData({ apiStatus: 'offline' })
      
      wx.showToast({
        title: '服务异常',
        icon: 'error'
      })
    } finally {
      this.setData({ 'loading.health': false })
    }
  },

  // 检查同步状态
  async checkSyncStatus() {
    this.setData({ 'loading.sync': true })
    this.addLog('检查同步状态...', 'info')
    
    try {
      const status = await api.getSyncStatus()
      this.setData({ syncStatus: status })
      this.addLog(`同步状态: ${status.status}`, 'info')
    } catch (error) {
      this.addLog(`获取同步状态失败: ${error.message}`, 'error')
    } finally {
      this.setData({ 'loading.sync': false })
    }
  },

  // 强制同步
  async forceSync() {
    this.setData({ 'loading.forceSync': true })
    this.addLog('开始强制同步...', 'info')
    
    try {
      const result = await app.forceSync()
      
      if (result.updated) {
        this.addLog(`同步成功，${result.message}`, 'success')
        this.updateStatus()
        await this.checkSyncStatus()
      } else {
        this.addLog('数据已是最新版本', 'info')
      }
      
    } catch (error) {
      this.addLog(`强制同步失败: ${error.message}`, 'error')
    } finally {
      this.setData({ 'loading.forceSync': false })
    }
  },

  // 清空缓存
  async clearCache() {
    this.setData({ 'loading.cache': true })
    
    wx.showModal({
      title: '确认操作',
      content: '确定要清空所有缓存吗？这将导致下次加载时重新从服务器获取数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            cache.clear()
            app.globalData.treeData = null
            app.globalData.version = null
            
            this.addLog('缓存已清空', 'success')
            this.updateStatus()
            
            wx.showToast({
              title: '缓存已清空',
              icon: 'success'
            })
          } catch (error) {
            this.addLog(`清空缓存失败: ${error.message}`, 'error')
          }
        }
        this.setData({ 'loading.cache': false })
      },
      fail: () => {
        this.setData({ 'loading.cache': false })
      }
    })
  },

  // API 测试
  async testAPI() {
    this.setData({ 'loading.test': true })
    this.addLog('开始 API 测试...', 'info')
    
    try {
      // 测试获取结构
      this.addLog('测试获取知识库结构...', 'info')
      const structure = await api.getStructure()
      this.addLog(`获取结构成功，版本: ${structure.version}`, 'success')
      
      // 测试获取问题（如果有数据的话）
      if (structure.tree && structure.tree.rootNodes && structure.tree.rootNodes.length > 0) {
        const firstFile = structure.tree.rootNodes[0].filePath
        this.addLog(`测试获取问题: ${firstFile}`, 'info')
        
        const issue = await api.getIssue(firstFile)
        this.addLog(`获取问题成功，标题: ${issue.title}`, 'success')
      }
      
      this.addLog('API 测试完成', 'success')
      
      wx.showToast({
        title: 'API 测试通过',
        icon: 'success'
      })
      
    } catch (error) {
      this.addLog(`API 测试失败: ${error.message}`, 'error')
      
      wx.showToast({
        title: 'API 测试失败',
        icon: 'error'
      })
    } finally {
      this.setData({ 'loading.test': false })
    }
  },

  // 添加日志
  addLog(message, level = 'info') {
    const logs = [...this.data.logs]
    logs.unshift({
      time: Date.now(),
      message: message,
      level: level
    })
    
    // 保留最近50条日志
    if (logs.length > 50) {
      logs.splice(50)
    }
    
    this.setData({ logs })
  },

  // 格式化同步时间
  formatSyncTime(timestamp) {
    if (!timestamp) return '未知'
    
    try {
      const date = new Date(timestamp)
      const now = Date.now()
      const diff = now - date.getTime()
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      
      return date.toLocaleDateString()
    } catch (error) {
      return '格式错误'
    }
  },

  // 格式化日志时间
  formatLogTime(timestamp) {
    const date = new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  },

  // 获取同步状态文本
  getSyncStatusText(status) {
    const statusMap = {
      'idle': '空闲',
      'syncing': '同步中',
      'completed': '已完成',
      'failed': '失败',
      'not_configured': '未配置'
    }
    return statusMap[status] || status
  }
})
