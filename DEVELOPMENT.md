# 开发指南

## 快速开始

### 1. 环境准备

1. **微信开发者工具**
   - 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 登录微信开发者账号

2. **申请小程序**
   - 登录[微信公众平台](https://mp.weixin.qq.com/)
   - 注册小程序账号，获取AppID

### 2. 项目配置

1. **导入项目**
   ```bash
   # 克隆项目
   git clone <repository-url>
   cd wechat-miniprogram-issue-reader
   
   # 使用微信开发者工具打开项目目录
   ```

2. **配置AppID**
   - 在微信开发者工具中，设置项目的AppID
   - 或者在`project.config.json`中配置

3. **准备图标资源**
   - 在`images/`目录下放置所需的图标文件
   - 参考`images/README.md`的说明

### 3. 本地开发

1. **启动开发**
   - 在微信开发者工具中打开项目
   - 点击"编译"按钮开始预览
   - 使用"真机调试"测试在真实设备上的效果

2. **开发模式**
   - 启用"不校验合法域名"（开发阶段）
   - 打开调试面板查看日志
   - 使用断点调试JavaScript代码

## 核心功能开发

### 1. 数据管理

```javascript
// app.js 中的全局数据管理
App({
  globalData: {
    currentTab: 'all',
    treeData: null,
    focusedProblems: [],
    // ... 其他数据
  },
  
  // 数据加载和缓存
  async loadData() {
    // 实现数据获取逻辑
  }
})
```

### 2. 页面路由

```javascript
// 页面跳转
wx.navigateTo({
  url: '/pages/detail/detail?id=xxx'
})

// Tab切换
wx.switchTab({
  url: '/pages/index/index'
})
```

### 3. 组件开发

```javascript
// components/tree-node/tree-node.js
Component({
  properties: {
    node: Object,
    level: Number
  },
  
  methods: {
    onToggle() {
      // 节点展开/收起逻辑
    }
  }
})
```

## API集成

### 1. 后端接口设计

```javascript
// 接口配置
const API_BASE = 'https://your-api-domain.com/api'

const apiConfig = {
  getTree: `${API_BASE}/problems/tree`,
  getFocused: `${API_BASE}/problems/focused`, 
  getOrphaned: `${API_BASE}/problems/orphaned`,
  getContent: `${API_BASE}/problems/content`
}
```

### 2. 网络请求封装

```javascript
// utils/request.js
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      ...options,
      success: resolve,
      fail: reject
    })
  })
}
```

### 3. 数据缓存策略

```javascript
// 缓存管理
const cacheKey = 'issueData'
const cacheTimeout = 30 * 60 * 1000 // 30分钟

// 获取缓存
const getCachedData = () => {
  const data = wx.getStorageSync(cacheKey)
  const time = wx.getStorageSync(`${cacheKey}_time`)
  
  if (data && time && (Date.now() - time) < cacheTimeout) {
    return data
  }
  return null
}
```

## 调试技巧

### 1. 控制台调试

```javascript
// 使用console.log输出调试信息
console.log('数据加载完成:', data)

// 使用console.error输出错误信息  
console.error('请求失败:', error)
```

### 2. 真机调试

1. 手机连接电脑
2. 微信开发者工具中选择"真机调试"
3. 扫码在手机上打开调试版本

### 3. 性能分析

- 使用开发者工具的性能面板
- 监控页面加载时间
- 检查内存使用情况

## 常见问题

### 1. 网络请求问题

**问题**: 小程序网络请求失败
**解决方案**:
```javascript
// 1. 检查域名配置
// 在微信公众平台配置服务器域名

// 2. 开发阶段临时跳过域名校验
// 开发者工具 -> 设置 -> 项目设置 -> 不校验合法域名

// 3. 处理请求错误
wx.request({
  url: 'https://api.example.com/data',
  success(res) {
    if (res.statusCode === 200) {
      // 请求成功
    } else {
      console.error('请求失败:', res)
    }
  },
  fail(error) {
    console.error('网络错误:', error)
    wx.showToast({
      title: '网络连接失败',
      icon: 'error'
    })
  }
})
```

### 2. 页面数据同步问题

**问题**: 不同页面间数据不同步
**解决方案**:
```javascript
// 使用全局数据管理
const app = getApp()

// 页面间通信
// 页面A
app.globalData.sharedData = newData

// 页面B
const sharedData = app.globalData.sharedData
```

### 3. 组件通信问题

**问题**: 父子组件数据传递
**解决方案**:
```javascript
// 父组件向子组件传递数据
<tree-node node="{{item}}" bind:select="onNodeSelect"></tree-node>

// 子组件向父组件传递事件
this.triggerEvent('select', nodeData)
```

## 性能优化

### 1. 图片优化

```javascript
// 使用小程序优化过的图片格式
// 压缩图片大小
// 使用CDN加速图片加载
```

### 2. 代码分割

```javascript
// 使用按需加载
// 分包加载大型组件
// 延迟加载非关键资源
```

### 3. 缓存策略

```javascript
// 合理使用本地存储
// 实现增量更新
// 定期清理过期数据
```

## 测试

### 1. 功能测试

- 测试所有页面跳转
- 验证数据加载和显示
- 检查交互响应

### 2. 兼容性测试

- 测试不同手机型号
- 验证不同微信版本
- 检查横竖屏适配

### 3. 性能测试

- 监控启动时间
- 测试大量数据场景
- 检查内存泄漏

## 发布准备

### 1. 代码检查

```bash
# 检查代码质量
# 移除调试代码
# 优化性能瓶颈
```

### 2. 资源优化

- 压缩图片资源
- 移除未使用的文件
- 检查文件大小限制

### 3. 提交审核

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注  
3. 登录微信公众平台提交审核
4. 等待审核结果并处理反馈
