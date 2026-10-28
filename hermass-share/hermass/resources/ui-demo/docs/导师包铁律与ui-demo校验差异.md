# ui-demo 页面铁律与现有校验覆盖差异

> 目的：把 `ui-demo` 的页面「铁律」（来自 `AGENTS.md`、设计评审结论、`specs/AI-GENERATION-GUIDE.md` 第四节）逐条对照现有 `validate-*` 脚本，找出**尚未被自动拦截、建议补成校验**的规则。
>
> 结论先行：`ui-demo` 在「组件来源 / 样式覆盖 / 跨 Demo 隔离 / 公共页组合 / 弹窗内部复制」上已由代码包 + 多脚本强覆盖；真正的自动校验缺口集中在 3 条具体规则——**操作列末列、占位符 `-`、模板实际用法**。

---

## 一、总览

| 导师包铁律 | ui-demo 自动拦截情况 | 对应校验 / 机制 |
| --- | --- | --- |
| 视觉以高保真原型为准，不引入新 UI 风格 | 部分（颜色已拦，字体/间距/非标变体未拦） | `validate-business-page-contract`（拦硬编码颜色 + 强制 design-system 导入） |
| 不生成独立 HTML、不重做导航/首页/外壳 | ✅ 强覆盖 | 旧页 hash 锁定 + React 业务页必须 bundle + 登记回归 |
| 列表页以标杆模板复用 | 部分（policy 声明，无脚本校验实际用法） | `page-template-catalog.json`（`templateRequired:true`） |
| 参数页用三列表格形态 | 部分（edit-form 模板覆盖） | `DSEditForm` 模板 |
| 详情页沿用现有详情模式 | ✅ 软覆盖 | `specs/page-compositions.json` 的 shared / hybrid 机制 |
| 弹窗先找现有相似弹窗 | ✅ 强覆盖（不复制内部选择器） | `validate-no-new-overlay-internals` + 场景级 overlay 组件 |
| 表格操作列必须最后一列 | ❌ 未拦截 | 无 |
| 筛选默认两排、多余展开、按钮组末位 | ❌ 未拦截 | 无（布局启发式，难 lint） |
| 优先复用已有 class / 页面函数 | ✅ 强覆盖 | `validate-business-page-contract`（拦手写控件 + 跨 Demo 导入） |
| 复杂公共组件沉淀到公共层 | ✅ 已超越 | `packages/design-system` + `packages/shared-pages` 包管理 |
| 占位符统一 ASCII 短杠 `-` | ❌ 未拦截 | 无 |
| 组件缺失先沉淀公共组件再写页面 | ✅ 强覆盖 | design-system 公开出口 + 拦 `ap-*` + 拦内部路径导入 |
| 改公共样式/组件后同步更新规范 | 不适用（流程规则） | 你们用代码包 + 校验，天然同步 |

---

## 二、建议补成自动校验的缺口（按价值排序）

### 1. ⚠️ 操作列必须最后一列（高价值、可 lint）
- **现状**：导师包铁律明确要求，ui-demo 无任何校验。`DSDataTable` 虽按约定把操作列放末位，但无脚本兜底。
- **建议**：在 `validate-business-page-contract.mjs` 中检查 `.page.jsx` 里 `DSDataTable` 列定义——若存在 `actionColumn` / 操作类列，必须位于列数组末位；或在 `defineTableColumns()` 产出后断言。
- **成本**：低（字符串/列数组顺序检查）。

### 2. ⚠️ 占位符统一 ASCII 短杠 `-`（高价值、可 lint）
- **现状**：导师包用 `page-kit.js` 把 `-` 写死为默认值。ui-demo 无对应约束，容易冒出 `—` / `–` / `－`。
- **建议**：新增 `validate-placeholder-dash.mjs`（或在 contract 脚本里加一条），扫描 `.page.jsx` / `.css` 字面量，禁止把 `—`/`–`/`－` 当作占位/分隔；允许业务编号中的连接符按格式保留。
- **成本**：低。

### 3. ⚠️ 模板实际用法校验（中价值）
- **现状**：`page-template-catalog.json` 已声明 `templateRequired:true`，但**没有脚本**确认页面 `.page.jsx` 真的 import 了 catalog 中的模板组件（`DSCrudTemplate` / `DSRegularListTemplate` / `DSAuditTemplate` 等）。存在「声明要模板、实际手写」的漏洞。
- **建议**：新增 `validate-template-usage.mjs`，遍历 `.page.jsx`，要求至少 import 一个 catalog 模板组件；`crud-list`/`regular-list` 类页面必须含 `DSDataTable`。
- **成本**：中（需对齐 catalog 的 `requiredComponents`）。

### 4. ⚠️ 视觉一致性广度（低–中，可选）
- **现状**：颜色硬编码已被拦，但**新字体、新间距尺度、非标组件变体**仍可混入业务 CSS。
- **建议**：在 contract 校验里增加「业务 CSS 不得引入设计系统外的字号 / 间距 scale」，或维护一份允许 token 白名单。
- **成本**：中。

### 5. ⚠️ 筛选两排（低 lintability，建议留人工）
- **现状**：纯布局启发式，难以稳定 lint。
- **建议**：仅在本文档 / `AI-GENERATION-GUIDE.md` 作为铁律 + 人工 review；或检查 `DSFilterBar` 默认可见字段数不超过阈值。

---

## 三、已强覆盖、无需重复建设的（确认即可）

- 禁止手写基础控件 → `validate-business-page-contract`（正则拦 `button|input|select|textarea|table`）
- 禁止覆盖 / 复制 `.ds-*`、`.frame2-*` → 同上（CSS 选择器 + 内部 DOM 检查）
- 颜色必须 token → 同上（禁硬编码 `#hex` / `rgba`）
- 必须从 design-system 公开入口导入 → 同上（禁内部路径、禁 `ap-*`）
- 跨 Demo 隔离 → 同上（禁跨 Demo import、禁依赖 `shared/` 业务目录）
- 公共页组合合规 → `validate-page-compositions`（shared/custom/hybrid + 扩展点校验）
- 不复制弹窗内部选择器 → `validate-no-new-overlay-internals`

> 上述已覆盖项说明：`ui-demo` 的治理层（代码包 + 多脚本校验）已较完备；本审计仅补「人话版生成规范入口」未覆盖到的自动拦截缺口（通用方法论见 skill `ai-page-gen-guardrails`）。
