# UI Demo / 组件库资产

这个目录用于沉淀 PC 前端组件库和 HTML 组件预览页。

## 目录说明

- `packages/design-system/`：本地设计组件库，React 组件包名 `@wisedu/design-system`；独立 HTML 预览页优先引用 `web-components/` 下的 Lit Web Components。
- `assets/`：图标、导航背景和组件静态资源。
- `components/`：组件索引、组件状态和组件组合预览 HTML。
- `scenarios/`：场景模板索引、弹窗和抽屉等场景 HTML。
- `demos/`：具体业务和完整功能演示 HTML。
- `framework/`：框架核心、框架选择、页面模板、框架资产和校验脚本。
- `templates/react-business-page/`：模型生成业务页面时的唯一代码结构入口。
- [`../docs/repository-structure.md`](../docs/repository-structure.md)：仓库级目录和维护规则。

## 主要入口

- `components/component-library-index.html`：框架2组件库总入口。
- `components/current-components-index.html`：当前组件索引。
- `components/all-components-index.html`：Ant 全量组件目录。
- `scenarios/scenario-templates-index.html`：场景模板入口。
- `framework/framework-index.html`：框架1、框架2选择入口。
- `framework/personal-workbench.html`：框架2预览。
- `framework/no-sidebar-page-template.html`：日程、待办等无左侧菜单业务页模板。
- `framework/primary-nav.html`：框架1兼容预览。
- `demos/staff-portal-homepage.html`：智慧人事首页业务演示。
- `assets/icon-registry.js`：统一图标注册表。

## HTML 组件预览索引

总览：

- `components/ant-components-page.html`：组件总览。
- `components/button-states.html`：按钮类型、尺寸和状态样例。
- `components/button-group-states.html`：按钮组类型、尺寸和状态样例。
- `components/link-button-components.html`：链接按钮和表格操作列样例。
- `components/steps-components.html`：步骤条组件。
- `components/anchor-components.html`：锚点组件。
- `components/group-title-components.html`：一级标题分组组件。
- `components/tag-components.html`：流程状态标签，覆盖待办卡片、已结表格和 IM 卡片三种形态。
- `components/empty-state-components.html`：缺省页组件，覆盖 8 类基础图片、恢复操作和高级步骤引导。
- `demos/assessment-result-card-page.html`：考核结果卡片业务样例。

表单：

- `components/form-components-page.html`：完整表单页面，整合输入、下拉、日期时间、单选、多选、开关、上传等控件。
- `components/form-input-states.html`：录入输入框状态。
- `components/form-select-states.html`：下拉选择状态。
- `components/form-cascader-states.html`：级联选择器状态。
- `components/transfer-components.html`：穿梭框组件，覆盖平铺、分组、表格和树形选择。
- `components/upload-components.html`：通用上传组件，覆盖点击、拖拽、粘贴、进度、成功与失败状态。
- `components/modal-components.html`：弹窗尺寸、批量配置、危险确认、长内容滚动和焦点交互。
- `components/edit-overlay-templates.html`：单列编辑弹窗、双列编辑弹窗和带分组抽屉模板。
- `components/form-textarea-states.html`：文本域状态。
- `components/form-rich-text-editor-states.html`：富文本编辑器状态。
- `components/form-radio-group-states.html`：单选组状态。
- `components/form-checkbox-group-states.html`：多选组状态。
- `components/form-switch-states.html`：开关状态。
- `components/form-date-picker-states.html` / `components/form-date-range-states.html`：日期选择与日期范围。
- `components/form-time-picker-states.html` / `components/form-time-range-states.html`：时间选择与时间范围。
- `components/form-datetime-picker-states.html` / `components/form-datetime-range-states.html`：日期时间选择与日期时间范围。
- `components/form-upload-button-states.html` / `components/form-upload-dragger-states.html`：附件上传与拖拽上传。

表格：

- `components/basic-table-page.html`：基础表格页面。
- `components/multi-level-table-page.html`：多级表头表格页面。
- `components/lowcode-table-page.html`：低代码表格页面。
- `scenarios/drawer-page.html`：900px 右侧表单抽屉交互页面。
- `scenarios/modal-page.html`：600px 长表单弹窗场景页面。
- `scenarios/delete-modal-page.html`：删除确认、删除成功与删除失败交互场景。
- `scenarios/regular-list-page.html`：常规列表页交互模板。
- `scenarios/card-list-page.html`：卡片列表页交互模板。

## 60 组件库当前覆盖

- 基础：`DSAnchor`、`DSButton`、`DSButtonGroup`、`DSLinkButton`、`DSLinkButtonGroup`、`DSSteps`、`DSIconButton`、`DSField`、`DSInput`、`DSSelect`、`DSCascader`、`DSTransfer`、`DSUpload`、`DSTextarea`、`DSRichTextEditor`、`DSTimePicker`、`DSTag`。
- 布局：`DSAppShell`、`DSPageHeader`、`DSGroupTitle`、`DSEditForm`、`DSEditField`、`DSFormGroup`、`DSCard`、`DSTabs`。
- 数据：`DSFilterBar`、`DSDataTable`、`DSParentChildTable`、`DSPagination`、`DSEmptyState`、`DSEmptyGuide`。
- 浮层：`DSModal`、`DSDrawer`、`DSSingleEditModal`、`DSDoubleEditModal`、`DSGroupedEditDrawer`。
- 审核：`DSAuditStatusTabs`、`DSAuditToolbar`、`DSAuditActions`、`DSAuditOpinionModal`、`DSAuditDetailDrawer`。
- 导入：`DSImportSteps`、`DSImportUpload`、`DSImportMappingTable`、`DSImportValidationPanel`、`DSImportResult`。
- 模板：`DSRegularListTemplate`、`DSCardListTemplate`、`DSCrudTemplate`、`DSAuditTemplate`、`DSImportWizard`。

React 页面统一从 `@wisedu/design-system` 引用组件；独立 HTML 预览优先引用 Lit Web Components，例如 `packages/design-system/web-components/DataTable/ds-data-table.js`，只在页面内维护 `columns`、`data` 等配置，避免重复手写原始 table DOM。

`demos/` 的新增页面和需要修改的历史页面统一迁移为 React bundle。历史静态页面由
`specs/legacy-static-pages.json` 锁定，禁止继续在原 HTML 中扩展 `ap-*` 或原生基础控件。

模型生成页面前先读取 `AI_COMPONENT_USAGE.md`。编辑弹层的唯一规范源是
`packages/design-system/specs/edit-overlay-templates.json`，预览页由真实
React 组件打包生成，不再维护手写弹层 DOM。

## 更新索引时机

新增或调整以下内容时，请同步更新本文件：

1. 新增 HTML 预览页。
2. 新增 `@wisedu/design-system` 导出组件。
3. 新增组件专项规范文档。
4. 调整资源目录或框架底座用法。

## 用户提供需求的最简格式

```text
页面：
类型：列表 CRUD / 审核页 / 表单页 / 导入向导 / 详情页
查询：
字段：
操作：
规则：
输出：HTML / React
```
