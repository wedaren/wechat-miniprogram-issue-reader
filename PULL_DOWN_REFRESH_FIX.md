# 下拉刷新功能修复说明

## 问题描述
问题总览页面与关注问题页面（以及其他页面）的下拉刷新功能难以触发。

## 问题原因
在原代码中，`wx.stopPullDownRefresh()` 被错误地放在了 `loadData()` 方法的 `finally` 块中。这导致：

1. 页面初次加载时就调用了 `wx.stopPullDownRefresh()`
2. 页面显示（`onShow`）时也会调用 `wx.stopPullDownRefresh()`
3. 这会提前结束下拉刷新动画，导致用户无法正常触发下拉刷新

## 修复方案
1. **移除 `loadData()` 方法中的 `wx.stopPullDownRefresh()` 调用**
   - `loadData()` 方法用于页面初始化和显示时的数据加载
   - 不应该在这里停止下拉刷新动画

2. **确保 `wx.stopPullDownRefresh()` 只在 `refreshData()` 方法中调用**
   - `refreshData()` 方法专门用于处理用户主动的下拉刷新操作
   - 在刷新完成后（无论成功或失败）都应该停止下拉刷新动画

3. **在全局配置中明确设置下拉刷新选项**
   - 在 `app.json` 的 `window` 配置中设置 `enablePullDownRefresh: false`
   - 让各个页面通过自己的配置文件独立控制下拉刷新功能

## 修复的文件
- `pages/index/index.js` - 问题总览页面
- `pages/focused/focused.js` - 关注问题页面  
- `pages/orphaned/orphaned.js` - 孤立问题页面
- `pages/recent/recent.js` - 最近问题页面
- `app.json` - 全局配置

## 修复效果
修复后，用户可以正常使用下拉刷新功能：
1. 在页面顶部向下拖拽可以触发下拉刷新
2. 刷新过程中显示适当的加载动画
3. 刷新完成后正确停止动画并显示结果提示

## 测试验证
1. 启动小程序
2. 进入问题总览页面
3. 在页面顶部向下拖拽，应该能看到下拉刷新动画
4. 松手后开始刷新，完成后动画停止
5. 在其他页面重复测试，确保功能正常
