# AI 组件复用入口

本文件是模型生成 UI 时的首要入口。视觉规则以组件默认值和机器规范为准，Markdown 描述只用于解释。

## 读取顺序

1. 判断场景。
2. 业务页面从 `templates/react-business-page/README.md` 开始。
3. 读取对应 manifest。
4. 使用场景级组件。
5. 只填业务字段、数据和事件。
6. 运行自动校验，不通过时修改组件或 manifest，不在业务页打补丁。

## 业务页面决策

- 新页面和被修改的旧页面统一使用 `<name>.page.jsx`。
- HTML 只挂载框架2并加载 `assets/bundles/pages/<name>.bundle.js`。
- React 组件只能从 `@wisedu/design-system` 公共入口导入。
- 历史静态 HTML 由 `specs/legacy-static-pages.json` 锁定；修改即必须迁移。
- 业务 JSX 不得直接出现 `button`、`input`、`select`、`textarea`、`table`。
- 业务 CSS 只允许业务布局类，不得覆盖 `.ds-*` 或 `.frame2-*`。
- 关键页面登记到 `specs/business-page-regression.json`，固定框架尺寸、组件数量、响应式布局和主交互。

## 编辑弹层决策

| 需求 | 必须使用 | 禁止替代 |
|---|---|---|
| 单列、字段较少、居中编辑 | `DSSingleEditModal` | `DSModal` + 页面自写表单 CSS |
| 两列短字段、居中编辑 | `DSDoubleEditModal` | 自写 grid 或把 `DSModal` 任意加宽 |
| 分组、富文本、持续编辑 | `DSGroupedEditDrawer` | 页面自写抽屉或手写分组间距 |

机器规范：

`packages/design-system/specs/edit-overlay-templates.json`

组件：

- `packages/design-system/src/EditOverlayTemplates/index.jsx`
- `packages/design-system/src/EditForm/index.jsx`
- `packages/design-system/src/Modal/index.jsx`
- `packages/design-system/src/Drawer/index.jsx`

可运行预览：

`components/edit-overlay-templates.html`

## 生成原则

- 场景级组件锁定容器尺寸、列数和纵向留白。
- `DSEditField` 锁定 `94px` 标签、`16px` 间距和响应式规则。
- `DSModal` / `DSDrawer` 负责遮罩、Esc、焦点、滚动和加载状态。
- 基础控件必须使用 `DSInput`、`DSSelect`、`DSSwitch`、`DSDatePicker`、`DSTimePicker`、`DSRichTextEditor` 等。
- 页面代码不得出现 `.ds-modal__*`、`.ds-drawer__*` 或 `.ds-edit-field__*` 内部结构。

## 必跑命令

```bash
npm run validate
npm run test:edit-overlays
npm run test:business-pages
```

更新视觉基准只能在确认设计规范发生变化后执行：

```bash
npm run test:edit-overlays:update
npm run test:business-pages:update
```
