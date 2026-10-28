# 首页案例

来源：`/Users/gaofeiyang/claude工程/项目/深职大/业务/首页/framework-2`

## 页面入口

- `staff-home.html`：智慧人事首页。
- `task-center.html`：任务中心。
- `notice-center.html`：通知消息。
- `resource-center.html`：资料中心。
- `schedule-center.html`：日程中心。
- `shell.html`：框架空壳页。

## 迁移处理

- 已迁移页面 HTML 与首页专用资源到本目录。
- 未迁移源目录中的 `vendor/`、`framework-2.js`、`framework-2.staff-preset.js`、`theme.css`。
- 页面统一引用 `../../../../framework/`、`../../../../packages/design-system/src/` 和 `../../../../assets/icon-registry.js` 中的共享框架与组件资源。
- 源目录中与共享框架重复的框架图片资源未保留在本目录。
- 源页面中指向未随本目录迁入的旧业务详情页链接已改为 `#`，避免形成失效本地链接。
