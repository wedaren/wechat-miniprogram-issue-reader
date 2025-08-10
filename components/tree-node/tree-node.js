Component({
  properties: {
    node: {
      type: Object,
      value: {}
    },
    level: {
      type: Number,
      value: 0
    },
    expandedNodes: {
      type: Object,
      value: {}
    }
  },

  data: {
    expanded: false,
    hasChildren: false,
    nodeIcon: '📄'
  },

  observers: {
    'node, expandedNodes': function(node, expandedNodes) {
      if (!node) return
      
      const hasChildren = node.children && node.children.length > 0
      const expanded = expandedNodes[node.id] || false
      const nodeIcon = this.getNodeIcon(node, hasChildren)
      
      this.setData({
        hasChildren,
        expanded,
        nodeIcon
      })
    }
  },

  methods: {
    // 获取节点图标
    getNodeIcon(node, hasChildren) {
      if (hasChildren) {
        return '📁' // 文件夹图标
      } else if (node.filePath) {
        return '📄' // 文件图标
      } else {
        return '📝' // 文档图标
      }
    },

    // 切换展开/收起
    onToggle() {
      if (!this.data.hasChildren) return
      
      const expanded = !this.data.expanded
      
      this.triggerEvent('toggle', {
        nodeId: this.data.node.id,
        expanded: expanded
      })
    },

    // 选择节点
    onSelect() {
      const { node } = this.data
      
      // 如果是文件节点，触发选择事件
      if (node.filePath) {
        this.triggerEvent('select', node)
      }
    },

    // 处理子节点切换
    onChildToggle(e) {
      this.triggerEvent('toggle', e.detail)
    },

    // 处理子节点选择
    onChildSelect(e) {
      this.triggerEvent('select', e.detail)
    }
  }
})
