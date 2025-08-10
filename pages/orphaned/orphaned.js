const app = getApp()

Page({
  data: {
    hasError: false,
    isEmpty: false,
    errorMessage: '',
    orphanedData: [],
    isRefreshing: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
    
    // 设置tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  // 加载数据
  async loadData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    this.setData({ hasError: false })

    try {
      // 等待app数据加载完成
      if (!app.globalData.orphanedProblems) {
        await app.loadData()
      }

      this.processOrphanedData()
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({
        hasError: true,
        errorMessage: '数据加载失败，请检查网络连接'
      })
    } finally {
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }
  },

  // 处理孤立问题数据
  processOrphanedData() {
    const orphanedData = app.globalData.orphanedProblems || []
    
    this.setData({
      orphanedData: orphanedData,
      isEmpty: orphanedData.length === 0
    })
  },

  // 刷新数据
  async refreshData() {
    this.setData({ isRefreshing: true })
    
    try {
      await app.loadData(true) // 强制刷新
      this.processOrphanedData()
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('刷新失败:', error)
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      })
    } finally {
      this.setData({ isRefreshing: false })
    }
  },

  // 选择节点
  onSelectNode(e) {
    const node = e.currentTarget.dataset.node
    
    if (!node || !node.filePath) {
      return
    }

    // 添加到最近查看
    app.addRecentProblem({
      id: node.id,
      title: node.title,
      filePath: node.filePath
    })

    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${node.id}&title=${encodeURIComponent(node.title)}&filePath=${encodeURIComponent(node.filePath)}`
    })
  }
})
