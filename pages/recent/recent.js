const app = getApp()

Page({
  data: {
    isLoading: true,
    hasError: false,
    isEmpty: false,
    errorMessage: '',
    recentData: [],
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
        selected: 3
      })
    }
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  // 加载数据
  async loadData() {
    this.setData({ isLoading: true, hasError: false })

    try {
      // 等待app数据加载完成
      if (!app.globalData.recentProblems) {
        await app.loadData()
      }

      this.processRecentData()
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({
        hasError: true,
        errorMessage: '数据加载失败，请检查网络连接'
      })
    } finally {
      this.setData({ isLoading: false })
      wx.stopPullDownRefresh()
    }
  },

  // 处理最近问题数据
  processRecentData() {
    const recentData = app.globalData.recentProblems || []
    const processedData = recentData.map(item => ({
      ...item,
      timeText: this.formatTime(item.viewTime)
    }))
    
    this.setData({
      recentData: processedData,
      isEmpty: processedData.length === 0
    })
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else {
      return `${Math.floor(diff / day)}天前`
    }
  },

  // 刷新数据
  async refreshData() {
    this.setData({ isRefreshing: true })
    
    try {
      // 最近记录不需要从服务器刷新，只刷新其他数据
      await app.loadData(true)
      this.processRecentData()
      
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

    // 添加到最近查看（会更新时间戳）
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