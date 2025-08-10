# 微信小程序配置安全说明

## ⚠️ 重要安全提醒

本项目的 `project.config.json` 文件包含敏感的小程序 AppID 信息，已被添加到 `.gitignore` 中以防止意外提交到版本控制系统。

## 🔧 开发环境配置步骤

### 1. 复制示例配置文件

```bash
cp project.config.json.example project.config.json
```

### 2. 配置你的 AppID

打开 `project.config.json` 文件，将 `YOUR_APPID_HERE` 替换为你的实际小程序 AppID：

```json
{
  "appid": "你的实际AppID",
  // ... 其他配置保持不变
}
```

### 3. 获取 AppID 的方法

- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 进入你的小程序管理后台
- 在 "设置" → "基本设置" 中找到 AppID

## 🛡️ 安全最佳实践

### ✅ 应该做的

- ✅ 将 `project.config.json` 添加到 `.gitignore`
- ✅ 使用示例配置文件 `project.config.json.example`
- ✅ 本地开发时复制示例文件并配置实际 AppID
- ✅ 团队开发时通过私有渠道分享 AppID（如内部文档、加密消息等）

### ❌ 不应该做的

- ❌ 将包含 AppID 的配置文件提交到公开仓库
- ❌ 在代码注释中硬编码 AppID
- ❌ 通过公开的 Issue 或 Pull Request 讨论 AppID
- ❌ 将 AppID 写在 README 或其他文档中

## 🔄 现有项目迁移

如果你已经误提交了包含 AppID 的配置文件：

1. **立即更换 AppID**（如果可能）
2. **清理 Git 历史**：

   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch project.config.json' \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **强制推送更新**：

   ```bash
   git push origin --force --all
   ```

## 📱 测试环境

使用微信开发者工具时：

1. 确保本地已正确配置 `project.config.json`
2. 开发者工具会自动读取 AppID 进行项目关联
3. 预览和体验版发布需要相应的小程序权限

## 🤝 团队协作

- 新成员加入时，私下提供 AppID
- 建立团队内部的配置管理规范
- 定期检查是否有敏感信息泄露

---

**记住：安全第一！保护好你的小程序 AppID，就是保护你的应用安全。** 🔒
