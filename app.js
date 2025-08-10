const { api, cache, handleError } = require('./utils/api.js')

// 应用生命周期
App({
  globalData: {
    treeData: null,
    focusedProblems: [],
    orphanedProblems: [],
    recentProblems: [],
    titles: {}, // 存储文件路径到标题的映射
    version: null, // 数据版本，用于缓存控制
    isOnline: true // 网络状态
  },

  onLaunch() {
    console.log('App Launch')
    this.checkNetworkStatus()
    this.loadData()
  },

  onShow() {
    console.log('App Show')
    this.checkNetworkStatus()
  },

  onHide() {
    console.log('App Hide')
  },

  onError(msg) {
    console.log('App Error:', msg)
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.isOnline = res.networkType !== 'none'
        
        // 监听网络状态变化
        wx.onNetworkStatusChange((res) => {
          this.globalData.isOnline = res.isConnected
          if (res.isConnected) {
            console.log('网络已连接，尝试同步数据')
            this.loadData()
          }
        })
      }
    })
  },

  // 加载数据
  async loadData(forceRefresh = false) {
    try {
      // 先尝试从缓存加载
      if (!forceRefresh) {
        const cached = this.loadFromCache()
        if (cached) {
          console.log('使用缓存数据')
          return
        }
      }

      // 检查网络连接
      if (!this.globalData.isOnline) {
        console.log('离线状态，使用本地缓存')
        return
      }

      // 从服务器获取数据
      await this.fetchDataFromServer()
    } catch (error) {
      console.error('加载数据失败:', error)
      
      // 如果服务器获取失败，尝试使用缓存
      const cached = this.loadFromCache()
      if (!cached) {
        wx.showToast({
          title: handleError(error, '数据加载失败'),
          icon: 'error'
        })
      }
    }
  },

  // 从缓存加载数据
  loadFromCache() {
    try {
      const cachedStructure = cache.get('structure')
      const cachedRecent = cache.get('recent_problems')
      
      if (cachedStructure) {
        this.processStructureData(cachedStructure)
        
        if (cachedRecent) {
          this.globalData.recentProblems = cachedRecent
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('缓存加载失败:', error)
      return false
    }
  },

  // 从服务器获取数据
  async fetchDataFromServer() {
    try {
      // 先检查服务健康状态
      await api.health()
      
      // 获取知识库结构
      const currentVersion = this.globalData.version
      const structure = await api.getStructure(currentVersion)
      
      if (structure) {
        // 数据有更新
        this.processStructureData(structure)
        
        // 缓存新数据
        cache.set('structure', structure, 30 * 60 * 1000) // 30分钟缓存
        
        console.log('数据同步成功，版本:', structure.version)
      } else {
        // 304 Not Modified，数据未更新
        console.log('数据未更新，使用现有数据')
      }
      
    } catch (error) {
      console.error('服务器数据获取失败:', error)
      throw error
    }
  },

  // 处理结构数据
  processStructureData(structure) {
    this.globalData.version = structure.version
    this.globalData.titles = structure.titles || {}
    
    // 处理树结构数据
    if (structure.tree && structure.tree.rootNodes) {
      this.globalData.treeData = this.convertTreeNodes(structure.tree.rootNodes)
    }
    
    // 处理关注列表
    if (structure.focused && structure.focused.focusList) {
      this.globalData.focusedProblems = structure.focused.focusList
    }
    
    // 孤立问题暂时为空，后续可通过其他接口获取
    this.globalData.orphanedProblems = []
  },

  // 转换树节点数据格式
  convertTreeNodes(nodes) {
    return nodes.map(node => {
      const title = this.globalData.titles[node.filePath] || node.filePath
      
      return {
        id: node.id,
        title: title,
        filePath: node.filePath,
        children: node.children ? this.convertTreeNodes(node.children) : []
      }
    })
  },

  // 获取问题内容
  async getIssueContent(filePath) {
    try {
      // 先从缓存查找
      const cached = cache.get(`issue_${filePath}`)
      if (cached) {
        return cached
      }
      
      // 从服务器获取
      const issue = await api.getIssue(filePath)
      
      // 缓存内容
      cache.set(`issue_${filePath}`, issue, 15 * 60 * 1000) // 15分钟缓存
      
      return issue
    } catch (error) {
      console.error('获取问题内容失败:', error)
      throw error
    }
  },

  // 添加最近查看记录
  addRecentProblem(problem) {
    const recent = this.globalData.recentProblems || []
    const existIndex = recent.findIndex(item => item.id === problem.id)
    
    if (existIndex > -1) {
      recent.splice(existIndex, 1)
    }
    
    recent.unshift({
      ...problem,
      viewTime: Date.now()
    })
    
    // 只保留最近20条
    if (recent.length > 20) {
      recent.splice(20)
    }
    
    this.globalData.recentProblems = recent
    
    // 缓存最近记录
    cache.set('recent_problems', recent, 7 * 24 * 60 * 60 * 1000) // 7天缓存
  },

  // 更新关注状态
  updateFocusStatus(problemId, isFocused) {
    const focusedProblems = [...this.globalData.focusedProblems]
    const index = focusedProblems.indexOf(problemId)
    
    if (isFocused && index === -1) {
      focusedProblems.push(problemId)
    } else if (!isFocused && index > -1) {
      focusedProblems.splice(index, 1)
    }
    
    this.globalData.focusedProblems = focusedProblems
    
    // 缓存更新后的关注列表
    cache.set('focused_problems', focusedProblems, 24 * 60 * 60 * 1000) // 1天缓存
  },

  // 手动同步数据
  async forceSync() {
    try {
      wx.showLoading({ title: '同步中...' })
      
      const result = await api.forceSync()
      
      if (result.updated) {
        // 清除缓存，强制重新加载
        cache.clear()
        await this.loadData(true)
        
        wx.showToast({
          title: '同步成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '数据已是最新',
          icon: 'success'
        })
      }
      
      return result
    } catch (error) {
      console.error('手动同步失败:', error)
      wx.showToast({
        title: handleError(error, '同步失败'),
        icon: 'error'
      })
      throw error
    } finally {
      wx.hideLoading()
    }
  },

  // 获取同步状态
  async getSyncStatus() {
    try {
      return await api.getSyncStatus()
    } catch (error) {
      console.error('获取同步状态失败:', error)
      return null
    }
  }
})
