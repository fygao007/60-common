# Repository Structure

本仓库沉淀 60 系统 PC 端组件资产，当前以可直接打开的 HTML 预览和本地 React 组件库为主。

## Top Level

| 路径 | 说明 |
|---|---|
| `README.md` | GitHub 首页入口，说明仓库用途、入口页面和维护规则。 |
| `docs/` | 仓库级说明文档。 |
| `ui-demo/` | HTML 预览页、设计组件库源码和静态资产。 |

## UI Demo

| 路径 | 说明 |
|---|---|
| `ui-demo/components/` | 组件索引、组件状态和组件组合预览 HTML。 |
| `ui-demo/components/component-library-index.html` | 框架2组件库功能索引。 |
| `ui-demo/components/current-components-index.html` | 当前已沉淀组件索引。 |
| `ui-demo/components/all-components-index.html` | Ant Design 组件体系排查目录。 |
| `ui-demo/scenarios/` | 场景模板索引、弹窗、抽屉等场景 HTML。 |
| `ui-demo/scenarios/scenario-templates-index.html` | 业务场景模板索引和生成规则入口。 |
| `ui-demo/demos/` | 具体业务和完整功能演示 HTML。 |
| `ui-demo/framework/` | 框架核心、框架选择、页面模板、资产和隔离回归。 |
| `ui-demo/templates/react-business-page/` | AI 和开发者新增业务页时必须使用的 React 三文件模板。 |
| `ui-demo/framework/framework-index.html` | 框架1和框架2选择入口。 |
| `ui-demo/assets/` | 图标、导航背景等静态资源。 |
| `ui-demo/packages/design-system/` | 本地 React 设计组件库。 |

## Design System

| 路径 | 说明 |
|---|---|
| `src/tokens.css` | 全局颜色、字体、间距、圆角、阴影等变量。 |
| `src/base.css` | 基础样式和通用 HTML 类。 |
| `src/index.js` | React 组件统一导出入口。 |
| `src/<Component>/index.jsx` | 组件实现。 |
| `src/<Component>/index.css` | 组件样式。 |
| `src/AppShell/app-shell.css` / `app-shell.js` | 框架1兼容底座，不用于新页面。 |
| `src/AppShellV2/app-shell-v2.css` / `app-shell-v2.js` | HTML 预览默认使用的框架2底座，采用 Shadow DOM 隔离。 |
| `docs/` | 组件专项规范和落地规则。 |

## Maintenance Rules

1. 新增组件先在 `ui-demo/packages/design-system/src/<Component>/` 中沉淀源码，再在 `src/index.js` 导出。
2. 新增 HTML 按职责放入 `components/`、`scenarios/`、`demos/` 或 `framework/`，不放在 `ui-demo/` 根目录。
3. 新增图标放入 `ui-demo/assets/icons/`，需要在页面脚本中复用时同步登记 `ui-demo/assets/icon-registry.js`。
4. 组件颜色必须优先使用 `src/tokens.css` 中的变量，不在组件 CSS 里直接写设计色值。
5. 本地工具配置、系统文件和临时截图不提交到仓库。
6. `demos/` 中被修改的页面必须迁移为 `<name>.html`、`<name>.page.jsx`、`<name>.css` 三文件结构。
