# 微信小程序 - 问题阅读器

## 项目概述

这是一个基于微信小程序平台开发的"问题阅读器"应用，旨在为用户提供一个移动端界面，用于方便地阅读和导航一个以 Markdown 文件为基础的个人知识库。

## 功能特性

### 🌲 四大核心视图

1. **问题总览** - 展示知识库中所有问题的完整层级结构
2. **关注问题** - 仅展示被用户标记为"关注"的问题及其子问题树  
3. **孤立问题** - 展示所有尚未在主结构中建立关联的问题
4. **最近问题** - 展示用户近期查看过的问题，按时间倒序排列

### 📱 界面设计

- **底部Tab栏** - 四个功能入口，支持快速切换视图
- **树状导航** - 可展开/折叠的层级结构，支持无限层级
- **Markdown渲染** - 完整的Markdown内容展示，支持代码高亮、表格等
- **响应式设计** - 适配不同尺寸的移动设备

### ⚡ 交互体验

- 平滑的页面切换动画
- 下拉刷新数据
- 本地缓存支持离线阅读
- 一键关注/取消关注问题
- 最近阅读记录自动保存

## 项目结构

```
├── app.js                    # 应用入口文件
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── sitemap.json             # 站点地图
├── pages/                   # 页面目录
│   ├── index/              # 主导航页面
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   └── detail/             # 内容详情页面
│       ├── detail.js
│       ├── detail.wxml
│       ├── detail.wxss
│       └── detail.json
├── components/             # 组件目录
│   └── tree-node/         # 树节点组件
│       ├── tree-node.js
│       ├── tree-node.wxml
│       ├── tree-node.wxss
│       └── tree-node.json
├── custom-tab-bar/        # 自定义tabBar
│   ├── index.js
│   ├── index.wxml
│   ├── index.wxss
│   └── index.json
└── images/                # 图标资源
    ├── tree.png
    ├── tree-active.png
    ├── star.png
    ├── star-active.png
    ├── orphan.png
    ├── orphan-active.png
    ├── recent.png
    └── recent-active.png
```

## 数据结构

### tree.json 示例
```json
[
  {
    "id": "1",
    "title": "技术问题", 
    "children": [
      {
        "id": "1-1",
        "title": "JavaScript问题",
        "filePath": "js-problems.md"
      }
    ]
  }
]
```

### focused.json 示例
```json
["1-1", "2-1"]
```

## 开发环境设置

### 前置要求

1. 安装微信开发者工具
2. 申请微信小程序AppID
3. Node.js环境（用于后端API开发）

### 本地开发

1. 克隆项目到本地
2. 使用微信开发者工具打开项目目录
3. 配置AppID
4. 预览或真机调试

### 图标准备

需要准备以下图标文件（建议尺寸：44x44px）：

- `images/tree.png` - 问题总览（未选中）
- `images/tree-active.png` - 问题总览（选中）
- `images/star.png` - 关注问题（未选中）
- `images/star-active.png` - 关注问题（选中）
- `images/orphan.png` - 孤立问题（未选中）
- `images/orphan-active.png` - 孤立问题（选中）
- `images/recent.png` - 最近问题（未选中）
- `images/recent-active.png` - 最近问题（选中）

## 数据同步

### 后端API接口

需要开发以下API接口：

1. `GET /api/tree` - 获取问题树结构
2. `GET /api/focused` - 获取关注问题列表
3. `POST /api/focused` - 更新关注问题
4. `GET /api/orphaned` - 获取孤立问题列表
5. `GET /api/content/{filePath}` - 获取Markdown文件内容

### 云端存储方案

支持以下云端存储方案：

1. **GitHub Repository** - 将知识库托管在GitHub私有仓库
2. **GitLab** - 企业级Git托管服务
3. **对象存储** - 阿里云OSS、腾讯云COS等
4. **自建服务器** - 搭建专用的文件服务

## Markdown增强

为了更好地支持Markdown渲染，建议集成以下库：

1. **towxml** - 功能强大的小程序Markdown渲染引擎
2. **wx-markdown** - 轻量级Markdown解析器
3. **marked** - 标准Markdown解析库

## 部署上线

### 小程序发布流程

1. 完成开发和测试
2. 上传代码到微信公众平台
3. 提交审核
4. 审核通过后发布

### 后端服务部署

1. 选择云服务提供商（阿里云、腾讯云等）
2. 部署API服务
3. 配置域名和SSL证书
4. 在小程序后台配置服务器域名

## 扩展功能

### 未来可扩展的功能

1. **全文搜索** - 支持关键词搜索所有文档
2. **标签系统** - 为问题添加标签分类
3. **评论系统** - 支持对问题进行评论和讨论
4. **离线下载** - 批量下载文档支持完全离线阅读
5. **分享功能** - 分享问题链接给其他用户
6. **主题切换** - 深色模式、护眼模式等
7. **字体调节** - 调整字体大小和行距
8. **阅读进度** - 记录文档阅读进度
9. **书签功能** - 在长文档中添加书签
10. **导出功能** - 导出PDF、Word等格式

## 技术栈

- **前端框架**: 微信小程序原生开发
- **样式**: WXSS + Flexbox布局  
- **数据管理**: 小程序本地存储 + 云端同步
- **Markdown解析**: 待集成第三方库
- **图标**: PNG格式静态资源

## 许可证

本项目遵循 MIT 许可证。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件到开发者邮箱

---

**注意**: 这是一个基础版本的实现，实际使用时需要根据具体需求进行定制化开发，特别是后端API和Markdown渲染部分。
