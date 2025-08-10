const app = getApp()
const { handleError } = require('../../utils/api.js')
const { toRichText } = require('../../utils/markdown-optimized.js')

Page({
  data: {
    id: '',
    title: '',
    filePath: '',
    hasError: false,
    errorMessage: '',
    markdownContent: '',
    markdownNodes: null,
    isFocused: false,
    formatTime: '',
    wordCount: 0,
    lastModified: ''
  },

  onLoad(options) {
    const { id, title, filePath } = options
    
    this.setData({
      id: id || '',
      title: decodeURIComponent(title || ''),
      filePath: decodeURIComponent(filePath || '')
    })

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.title || '问题详情'
    })

    // 检查是否已关注
    this.checkFocusStatus()
    
    // 加载内容
    this.loadContent()
  },

  onShareAppMessage() {
    return {
      title: this.data.title,
      path: `/pages/detail/detail?id=${this.data.id}&title=${encodeURIComponent(this.data.title)}&filePath=${encodeURIComponent(this.data.filePath)}`
    }
  },

  // 检查关注状态
  checkFocusStatus() {
    const focusedProblems = app.globalData.focusedProblems || []
    const isFocused = focusedProblems.includes(this.data.id)
    this.setData({ isFocused })
  },

  // 加载内容
  async loadContent() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    this.setData({ hasError: false })

    try {
      const issue = await app.getIssueContent(this.data.filePath)
      
      // 渲染Markdown内容
      const richTextNodes = toRichText(issue.content)
      
      this.setData({
        markdownContent: issue.content,
        markdownNodes: richTextNodes,
        title: issue.title || this.data.title,
        lastModified: this.formatDateTime(issue.last_modified),
        formatTime: this.getCurrentTime(),
        wordCount: this.countWords(issue.content)
      })

      // 更新导航栏标题
      if (issue.title && issue.title !== this.data.title) {
        wx.setNavigationBarTitle({
          title: issue.title
        })
      }

    } catch (error) {
      console.error('加载内容失败:', error)
      this.setData({
        hasError: true,
        errorMessage: handleError(error, '内容加载失败')
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 格式化日期时间
  formatDateTime(isoString) {
    if (!isoString) return ''
    
    try {
      const date = new Date(isoString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
      console.error('日期格式化失败:', error)
      return ''
    }
  },

  // 统计字数
  countWords(content) {
    if (!content) return 0
    // 去除Markdown语法字符，统计实际内容字数
    return content
      .replace(/[#*`_~\[\]()!-]/g, '') // 移除Markdown标记
      .replace(/\s+/g, '') // 移除空白字符
      .length
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 切换关注状态
  toggleFocus() {
    const { id, title, filePath } = this.data
    const isFocused = !this.data.isFocused

    // 更新全局状态
    app.updateFocusStatus(id, isFocused)

    // 更新页面状态
    this.setData({ isFocused })

    // 显示反馈
    wx.showToast({
      title: isFocused ? '已添加关注' : '已取消关注',
      icon: 'success'
    })
  },

  // 重新加载内容
  async reloadContent() {
    await this.loadContent()
  },

  // 复制内容
  copyContent() {
    if (!this.data.markdownContent) {
      wx.showToast({
        title: '暂无内容可复制',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: this.data.markdownContent,
      success() {
        wx.showToast({
          title: '内容已复制',
          icon: 'success'
        })
      },
      fail() {
        wx.showToast({
          title: '复制失败',
          icon: 'error'
        })
      }
    })
  },

  // 分享文件路径
  sharePath() {
    wx.setClipboardData({
      data: this.data.filePath,
      success() {
        wx.showToast({
          title: '文件路径已复制',
          icon: 'success'
        })
      }
    })
  }
})
