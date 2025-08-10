# 示例数据说明

本目录包含小程序使用的示例数据结构，用于开发和测试。

## 文件说明

### tree.json
定义问题的层级结构，支持无限层级嵌套。

```json
{
  "id": "唯一标识符",
  "title": "显示标题", 
  "children": [子节点数组],
  "filePath": "markdown文件路径（叶子节点才有）"
}
```

### focused.json
存储用户关注的问题ID列表。

```json
["问题ID1", "问题ID2", ...]
```

### orphaned.json
存储孤立问题列表，这些问题尚未被纳入主要的问题树结构。

```json
[
  {
    "id": "问题ID",
    "title": "问题标题",
    "filePath": "文件路径"
  }
]
```

## 数据关系

1. **树状结构**: `tree.json`定义了问题的层级关系
2. **关注关系**: `focused.json`中的ID必须存在于tree.json的某个节点中
3. **孤立问题**: `orphaned.json`中的问题不应该出现在tree.json中
4. **文件路径**: 所有filePath都应该指向实际存在的Markdown文件

## 实际使用

在实际项目中，这些数据应该：

1. 存储在云端（GitHub、GitLab、对象存储等）
2. 通过API接口提供给小程序
3. 支持增量更新和缓存机制
4. 包含版本控制和同步功能

## API接口设计建议

```javascript
// 获取问题树
GET /api/problems/tree

// 获取关注列表
GET /api/problems/focused

// 更新关注状态
POST /api/problems/focused
{
  "problemId": "tech-frontend-js",
  "focused": true
}

// 获取孤立问题
GET /api/problems/orphaned

// 获取问题内容
GET /api/problems/content/{filePath}
```
