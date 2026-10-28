# 业务演示

本目录只存放具体业务或完整功能演示，不放框架核心、组件索引和场景模板。

页面统一加载 `../framework/` 中的框架2能力，并复用
`../packages/design-system/` 中的组件和设计变量。

新增或修改页面必须使用同名三文件结构：

- `<name>.html`：只配置框架2和加载 bundle。
- `<name>.page.jsx`：从 `@wisedu/design-system` 引用真实组件。
- `<name>.css`：只写业务布局，不覆盖组件内部样式。

`../specs/legacy-static-pages.json` 中的旧 HTML 为只读，修改前必须迁移。
