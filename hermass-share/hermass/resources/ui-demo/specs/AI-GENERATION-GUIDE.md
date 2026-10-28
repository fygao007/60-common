# AI 页面生成规范入口（人话版）

> **来源**：综合本仓库（`ui-demo`）已有的 `@wisedu/design-system`、`specs/page-template-catalog.json`、`specs/page-compositions.json` 与 `scripts/validate-*` 沉淀而成。通用方法论见 user-level skill `ai-page-gen-guardrails`。
>
> **作用**：让 AI / 同事在生成或修改 `demos/` 业务页前先对齐，**避免风格与结构漂移**。本文件是「读序 + 决策表 + 铁律」的人话入口；硬约束仍以 `AGENTS.md` 与各 `validate-*` 脚本为准。

---

## 一、生成前必读顺序（不要先自由发挥）

1. **本文件**：确认页面类型与对应模板 / 组件。
2. `specs/page-template-catalog.json`：按意图选最接近的模板；**禁止从空白文件手写通用页面**。
3. `packages/design-system/src/index.js`：按钮、输入、选择、表格、分页、标签、卡片、弹窗、抽屉、空状态等**必须从 `@wisedu/design-system` 导入**（见第三节清单）。
4. `ontology/product-world/scenarios/`：确认场景模型、角色、字段来源（统一用 `fieldRef`）。
5. 执行 `generate:demo-context`。如上下文含 `fixedEntrySource`，入口必须按该文件装配，只修改同目录业务配置，不从其他 Demo 复制实现。

---

## 二、页面类型决策表

| 任务 | 必选模板（catalog id → 组件） | 必需组件 | 现有参考页（先去抄） |
| --- | --- | --- | --- |
| 增删改查 / 管理列表 | `crud-list` → `DSCrudTemplate` | `DSFilterBar` `DSDataTable` `DSPagination` `DSButton` | `demos/recruitment/hr/position/`、`recruit-type/` |
| 查询 / 只读列表 / 台账 | `regular-list` → `DSRegularListTemplate` | `DSFilterBar` `DSDataTable` `DSPagination` | 招聘监控 `monitor/` |
| 无框架根容器标准列表 | `standard-list-root` → `DSStandardListTemplate` | 模板内部组合 | `scenarios/szd-standard-list-page.html`（原地址，严格配置版） |
| 卡片 / 资源库 / 入口集合 | `card-list` → `DSCardListTemplate` | `DSCard` `DSFilterBar` `DSPagination` | — |
| 审核 / 审批 / 意见处理 | `audit` → `DSAuditTemplate` | `DSAuditToolbar` `DSAuditActions` `DSAuditOpinionModal` | `process-audit/`、`plan-audit/` |
| 首页 / 工作台 / 看板 | `dashboard` → `DSDashboardGrid` | `DSCard` `DSChartCard` | — |
| 新增 / 编辑 / 详情维护 | `edit-form` → `DSEditForm` | `DSEditForm` `DSEditField` `DSButtonGroup` | `resume-info/`（shared）、详情页 |
| 批量导入 / 数据映射 | `import-wizard` → `DSImportWizard` | `DSImportSteps` `DSImportUpload` `DSImportValidationPanel` | — |

> 找不到完全匹配时，选**最接近的模板组合**，而不是手写基础控件（见 `page-template-catalog.json` 的 `fallback.rule`）。

---

## 三、设计系统组件清单（只从 `@wisedu/design-system` 导入）

- **按钮**：`DSButton` `DSButtonGroup` `DSIconButton` `DSLinkButton` `DSLinkButtonGroup`
- **输入 / 选择**：`DSInput` `DSSelect` `DSTextarea` `DSField` `DSRadioGroup` `DSCheckbox` `DSSwitch` `DSCascader` `DSDatePicker` `DSTimePicker`
- **表格 / 列表**：`DSDataTable` `DSRegularListTemplate` `DSCrudTemplate` `DSCardListTemplate` `DSParentChildTable` `DSImportMappingTable`
- **分页 / 标签 / 卡片**：`DSPagination` `DSTag` `DSCard`
- **弹窗 / 抽屉**：`DSModal` `DSDrawer` `DSAuditOpinionModal` `DSDoubleEditModal` `DSGroupedEditDrawer` `DSSingleEditModal`
- **审核**：`DSAuditTemplate` `DSAuditToolbar` `DSAuditActions` `DSAuditStatusTabs` `DSAuditDetailDrawer`
- **表单 / 只读**：`DSEditForm` `DSEditField` `DSFormGroup` `DSReadOnlyForm` `DSReadOnlyField`
- **布局 / 其它**：`DSAppShell` `DSPageHeader` `DSSubPageHeader` `DSGroupTitle` `DSTabs` `DSSteps` `DSTree` `DSTransfer` `DSUpload` `DSAnchor` `DSAlert` `DSEmptyState` `DSEmptyGuide` `DSChartKit`

> 完整出口见 `packages/design-system/src/index.js`。**禁止**从 `packages/design-system/src/...` 内部路径导入，也**禁止** `ap-*` 仿制组件。

---

## 四、铁律（可点检）

> ✅ = 已被 `validate-*` 自动拦截；⚠️ = 目前靠自觉 / 人工 review，建议后续补成校验。

- ✅ 禁止在 JSX 手写 `button` / `input` / `select` / `textarea` / `table`（`validate-business-page-contract`）
- ✅ 禁止复制 `.ds-*` / `.frame2-*` 内部 DOM，禁止覆盖其样式（`validate-business-page-contract`）
- ✅ 业务 CSS 颜色必须用设计 token，禁止硬编码（`validate-business-page-contract`）
- ✅ 必须从 `@wisedu/design-system` 公开入口导入；禁止内部路径导入、禁止 `ap-*`（`validate-business-page-contract`）
- ✅ 禁止跨 Demo 导入、禁止依赖业务 `shared/` 目录（`validate-business-page-contract`）
- ✅ 共享 / 混合页必须通过 `specs/page-compositions.json` 登记并只用已开放扩展点（`validate-page-compositions`）
- ✅ 新页面禁止复制编辑弹窗内部选择器（`validate-no-new-overlay-internals`）
- ⚠️ 列表页**操作列必须最后一列**（建议补校验）
- ⚠️ 空值占位符全系统统一用 ASCII 短杠 `-`，不用 `—` / `–` / `－`（建议补校验）
- ⚠️ 筛选默认最多两排，多余字段走「展开」，按钮组固定在筛选区末位（建议留人工 review）
- ⚠️ 页面必须选用 `page-template-catalog` 中的模板（policy 已声明 `templateRequired`，建议补「实际 import 了 catalog 模板组件」的校验）
- ⚠️ 弹窗 / 批量操作先复用场景级 overlay 组件（`DSAuditOpinionModal` / `DSDoubleEditModal` 等），再考虑新增

---

## 五、生成后必跑

```bash
npm run validate:business-pages
npm run validate
```

任一校验失败不能交付。字段相关改动另跑 `npm run validate:field-ontology` 等（详见 `AGENTS.md` 产品字段默认规则）。
