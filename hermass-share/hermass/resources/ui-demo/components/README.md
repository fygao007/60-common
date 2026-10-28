# 组件页面

本目录存放组件索引、组件状态和组件组合预览 HTML。

- `component-library-index.html`：组件功能总入口。
- `current-components-index.html`：当前已沉淀组件。
- `all-components-index.html`：Ant 全量组件目录。
- `card-components.html`：卡片布局、开关、操作折叠、选择态和图片卡交互预览。
- `empty-state-components.html`：基础缺省图片、恢复操作和高级空状态引导预览。
- `modal-components.html`：弹窗尺寸、配置、确认、长内容及关闭交互预览。
- `edit-overlay-templates.html`：由 `edit-overlay-templates.jsx` 构建的真实 React 场景组件预览。
- 其他 HTML：按钮、表单、表格、导航等组件预览。

组件源码仍统一维护在 `../packages/design-system/src/`。

修改 React 预览后运行 `npm run build:previews`。禁止直接编辑生成的
`edit-overlay-templates.bundle.js` 和 `edit-overlay-templates.bundle.css`。
