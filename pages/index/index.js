const app = getApp()

Page({
  data: {
    isLoading: true,
    hasError: false,
    isEmpty: false,
    errorMessage: '',
    treeData: [],
    expandedNodes: {},
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
        selected: 0
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
      if (!app.globalData.treeData) {
        await app.loadData()
      }

      this.processTreeData()
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

  // 处理树形数据
  processTreeData() {
    const treeData = app.globalData.treeData || []
    
    this.setData({
      treeData: treeData,
      isEmpty: treeData.length === 0
    })
  },

  // 刷新数据
  async refreshData() {
    this.setData({ isRefreshing: true })
    
    try {
      await app.loadData(true) // 强制刷新
      this.processTreeData()
      
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

  // 切换节点展开/折叠
  onToggleNode(e) {
    const { nodeId, expanded } = e.detail
    const expandedNodes = { ...this.data.expandedNodes }
    
    if (expanded) {
      expandedNodes[nodeId] = true
    } else {
      delete expandedNodes[nodeId]
    }
    
    this.setData({ expandedNodes })
  },

  // 选择节点
  onSelectNode(e) {
    const node = e.detail
    
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
