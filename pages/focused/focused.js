const app = getApp()

Page({
  data: {
    hasError: false,
    isEmpty: false,
    errorMessage: '',
    focusedData: [],
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
        selected: 1
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
      if (!app.globalData.treeData) {
        await app.loadData()
      }

      this.processFocusedData()
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({
        hasError: true,
        errorMessage: '数据加载失败，请检查网络连接'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 处理关注问题数据
  processFocusedData() {
    const focusedIds = app.globalData.focusedProblems || []
    
    if (focusedIds.length === 0) {
      this.setData({ 
        focusedData: [],
        isEmpty: true 
      })
      return
    }

    // 从树形数据中提取关注的问题
    const allProblems = this.flattenTree(app.globalData.treeData || [])
    const focusedProblems = []

    focusedIds.forEach(id => {
      const problem = allProblems.find(p => p.id === id)
      if (problem && problem.filePath) {
        focusedProblems.push(problem)
      }
    })

    this.setData({
      focusedData: focusedProblems,
      isEmpty: focusedProblems.length === 0
    })
  },

  // 扁平化树结构
  flattenTree(tree, result = []) {
    tree.forEach(node => {
      result.push(node)
      if (node.children && node.children.length > 0) {
        this.flattenTree(node.children, result)
      }
    })
    return result
  },

  // 刷新数据
  async refreshData() {
    this.setData({ isRefreshing: true })
    
    try {
      await app.loadData(true) // 强制刷新
      this.processFocusedData()
      
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
      wx.stopPullDownRefresh()
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
