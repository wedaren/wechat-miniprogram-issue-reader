Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#007aff',
    list: [
      {
        text: '问题总览',
        pagePath: '/pages/index/index',
        iconPath: '/images/tree.png',
        selectedIconPath: '/images/tree-active.png'
      },
      {
        text: '关注问题', 
        pagePath: '/pages/focused/focused',
        iconPath: '/images/star.png',
        selectedIconPath: '/images/star-active.png'
      },
      {
        text: '孤立问题',
        pagePath: '/pages/orphaned/orphaned',
        iconPath: '/images/orphan.png', 
        selectedIconPath: '/images/orphan-active.png'
      },
      {
        text: '最近问题',
        pagePath: '/pages/recent/recent',
        iconPath: '/images/recent.png',
        selectedIconPath: '/images/recent-active.png'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      
      // 更新选中状态
      this.setData({
        selected: index
      })
      
      // 跳转到对应页面
      wx.switchTab({
        url: item.pagePath,
        fail(error) {
          console.error('Tab切换失败:', error)
        }
      })
    }
  }
})
