# 页面生成硬约束（适用于所有模型和人工开发）

本约束适用于两个目录：
- **原型阶段**：`common/60/ui-demo/demos/`
- **实际业务**：`60sysV2/pages/`

## 三步流程

新增或修改页面时，必须按以下顺序执行，不得跳过：

### 1. 先选模板

读取 `common/60/ui-demo/scenarios/scenario-templates-index.html`，根据页面意图选择最接近的场景模板；禁止从空白文件开始手写通用页面。

可选模板：
- `regular-list-page.html` — 常规列表页
- `audit-review-page.html` — 审核评审页
- `detail-page.html` — 详情页
- `form-table-page.html` — 表单表格页
- `card-list-page.html` — 卡片列表页
- `stats-dashboard-page.html` — 统计看板页
- `tree-config-page.html` — 树形配置页
- `workbench-home-page.html` — 工作台首页
- `modal-page.html` — 弹窗页
- `drawer-page.html` — 抽屉页
- `delete-modal-page.html` — 删除确认弹窗

### 2. 再查组件

读取 `common/60/ui-demo/components/` 下的组件页面，确认要使用的组件样式：

- `button-states.html` — 按钮
- `form-input-states.html` — 输入框
- `form-select-states.html` — 下拉选择
- `form-checkbox-group-states.html` — 复选框
- `form-radio-group-states.html` — 单选框
- `form-switch-states.html` — 开关
- `form-date-picker-states.html` — 日期选择
- `form-upload-button-states.html` — 上传
- `basic-table-page.html` — 基础表格
- `modal-components.html` — 弹窗
- `tag-components.html` — 标签
- `card-components.html` — 卡片
- `empty-state-components.html` — 空状态
- `filter-area-components.html` — 筛选区域

### 3. 最后写业务差异

- **原型阶段**：HTML 只组合现有 ds-* 类名，CSS 只写页面布局和专属可视化
- **实际业务**：沿用原型阶段的组件样式，业务 CSS 只写页面布局和专属可视化

## 强制禁止

- 复制 `.ds-*` 组件内部 DOM，或覆盖 `.ds-*`、`.frame2-*` 样式
- 复制其他页面的 CSS、JS、Mock 数据或页面组件
- 把页面专属实现放进公共 `common/` 目录以规避独立性检查
- 修改已锁定的旧静态页面（需要改动时先评估影响范围）
- 使用 Web Components（如 `<ds-data-table>`）— 60sysV2 通过 file:// 协议访问，不支持 ES modules

## 60sysV2 特殊说明

由于 60sysV2 通过 file:// 协议直接访问 HTML 文件，存在以下限制：

### 不支持的功能
- **Web Components**：`<ds-data-table>` 等基于 Lit 框架的组件需要 ES modules，file:// 协议下会被 CORS 拦截
- **ES modules**：`<script type="module">` 和 `import` 语法在 file:// 下无法正常工作

### 允许的做法
- **普通 HTML 标签**：`<table>`、`<button>`、`<input>`、`<select>` 等
- **ds-* CSS 类名**：可以引用 ui-demo 的组件样式文件，使用 `ds-button`、`ds-tag`、`ds-filter-area` 等类名
- **普通 JavaScript**：`<script>` 标签内的常规 JS 代码

### 引用组件样式示例
```html
<!-- 引用 ui-demo 的组件样式 -->
<link rel="stylesheet" href="../../../../../common/60/ui-demo/packages/design-system/src/Button/index.css" />
<link rel="stylesheet" href="../../../../../common/60/ui-demo/packages/design-system/src/Tag/index.css" />
<link rel="stylesheet" href="../../../../../common/60/ui-demo/packages/design-system/src/Field/index.css" />
<link rel="stylesheet" href="../../../../../common/60/ui-demo/packages/design-system/src/FilterBar/index.css" />

<!-- 使用 ds-* 类名 -->
<button class="ds-button ds-button--primary ds-button--default-size">查询</button>
<span class="ds-tag ds-process-tag ds-process-tag--filled ds-tag--success">已通过</span>
```

## 页面跳转规范

当前使用 `window.location.href` 进行页面跳转，遵循以下规则：

### 推荐做法

```javascript
// 同级页面跳转
window.location.href = 'print-report.html';

// 跨目录跳转（使用相对路径）
window.location.href = `../apply/leave-cancel-detail.html?id=${id}&mode=view`;

// 带参数跳转
const params = new URLSearchParams({ id: recordId, mode: 'edit' });
window.location.href = `../info-audit-detail/index.html?${params.toString()}`;
```

### 禁止做法

```javascript
// ❌ 硬编码绝对路径
window.location.href = '/pages/leave/query/index.html';

// ❌ 拼接字符串参数（易出错）
window.location.href = `detail.html?id=${id}&name=${name}&type=${type}`;
// ✅ 改用 URLSearchParams

// ❌ 在 HTML 中硬编码跳转
<a href="../other/page.html">跳转</a>
// ✅ 改用 JS 控制跳转，便于后续统一改造
```

## 页面依赖限制

每个页面的实现只允许依赖：

- **框架文件**：`common/60/ui-demo/framework/`
- **组件样式**：`common/60/ui-demo/assets/`（tokens.css、base.css、theme.css）
- **当前页面目录内的文件**

禁止依赖：
- 其他业务页面的 CSS、JS 或组件
- 未登记的第三方库

## 完成后校验（手动检查清单）

交付前必须逐项检查：

### 结构检查
- [ ] 页面使用了场景模板作为起点
- [ ] 组件样式使用了 ds-* 类名（按钮、标签、筛选区等）
- [ ] 没有复制其他页面的代码
- [ ] **60sysV2**：使用普通 HTML 标签（table、button、input 等）
- [ ] **ui-demo**：使用 Web Components（ds-data-table 等）

### 样式检查
- [ ] 没有覆盖 .ds-* 或 .frame2-* 样式
- [ ] 业务 CSS 只包含布局和专属可视化
- [ ] 页面背景色为 #fff（非 #f0f2f5）

### 跳转检查
- [ ] 使用相对路径，未硬编码绝对路径
- [ ] 参数使用 URLSearchParams 拼接
- [ ] 跳转目标页面存在

### 链接检查
- [ ] 所有 CSS/JS 引用路径正确
- [ ] 图片、图标等资源路径正确
- [ ] 页面可在浏览器中正常打开

### 独立性检查
- [ ] 页面不依赖其他业务页面的代码
- [ ] 页面专属实现未放入公共目录

任一检查项失败都不能交付。

## 相关文件

- 场景模板索引：`common/60/ui-demo/scenarios/scenario-templates-index.html`
- 组件页面目录：`common/60/ui-demo/components/`
- 框架文件目录：`common/60/ui-demo/framework/`
- 样式资源目录：`common/60/ui-demo/assets/`
