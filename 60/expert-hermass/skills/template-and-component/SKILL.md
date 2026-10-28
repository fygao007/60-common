---
name: template-and-component
description: 页面结构与模板匹配。Hermass Step 2/3 使用：先查 page-compositions 定模式，再按 page-template-catalog 选模板，组件只从 @wisedu/design-system 导入；含新建页面登记项与强制禁令。
---

# 页面结构与模板匹配（Step 2 + Step 3）

> 目录基准（由 `agents/hermass.md` 按整包位置解析）：
> UI Demo = `${UI_DEMO_ROOT}`
> 字段单源 = `${ONTOLOGY_ROOT}`

## Step 2：搭建页面结构

1. 读取 `${UI_DEMO_ROOT}/specs/page-compositions.json`，页面只能选一种模式：
   - `shared`：直接用 `@wisedu/shared-pages` 公共页面，公共修改统一生效
   - `custom`：页面完全独立，禁止导入公共页面包
   - `hybrid`：公共主体 + 只能通过已登记扩展点加个性内容
2. **菜单解耦**：菜单定义放 `${UI_DEMO_ROOT}/demos/<产品>/menus/` 并注册到 `WiseMenuRegistry`；页面只声明"菜单 ID + 功能 key"；跳转用 `WiseMenuRegistry.route('菜单ID:功能key')` 或 `link()`，禁止硬编码相对地址。菜单模块不得导入页面代码、样式或 Mock。
3. 涉及场景模型时先跑 `npm run generate:demo-context -- <场景JSON>`，只按生成上下文实现，不得自行发明业务规则。

## Step 3：选择模板与组件

### 模板选择规则（优先复用 scenarios 页面）

1. **优先从现有场景页选页面模板**：先读 `${UI_DEMO_ROOT}/scenarios/README.md` 和 `${UI_DEMO_ROOT}/scenarios/scenario-templates-index.html`，结合下方映射表，从 `${UI_DEMO_ROOT}/scenarios/` 选择结构与需求最接近的页面。用户未指定模板时，需求卡必须记录首选页面、文件路径和匹配理由；有多个接近项时列出至多 3 个候选并选择最贴近的一项，不因目录里的组件名相似就直接选组件模板。
2. **再核对模板目录与组件**：每次运行时读取 `${UI_DEMO_ROOT}/specs/page-template-catalog.json` 和 `${UI_DEMO_ROOT}/templates/`。把所选场景页映射到最接近的 catalog 模板/设计系统组件；记录 catalog ID、场景页和组件。catalog 负责组件与生成约束，场景页负责页面结构与视觉参考。
3. **遵守已有页面实现方式**：场景页已有同名 `.page.jsx`、`.css`、`.html` 时，按其 React 页面结构和设计系统组件复用；没有 React 实现或仅有静态导出时，将其作为结构/视觉参考，在目标页面目录按工程模板实现，禁止直接修改被锁定的旧静态页面或把静态导出当作可配置装配器。**目标工程跑不了 ES module 时（`file://` 直开、无构建步骤的静态站），一律改用下方「静态模板白名单」中的模板，并整份复制该模板文件**——整份复制模板文件属于复用模板，不受"照类名自拼不算复用"的约束。
4. **选定即锁定**：用户指定场景页时直接用该页。选定后保持结构、视觉和组件组合，只替换已确认的业务内容；不得另写布局、调间距/配色、增加框架壳或自定义装饰。只在模板已有槽位内配置；标准列表继续走 `standard-list-root` 固定装配器。
5. **无合适场景页**：再从 catalog 选择最接近的组件模板，并在需求卡说明缺少的场景模板能力。禁止从空白文件手写通用页面；确实无匹配时依工程约束使用设计系统组件，并记录复用缺口，不虚称已有模板。
6. **禁令不变**：禁止 JSX 手写原生 `button`/`input`/`select`/`textarea`/`table`（`nativeControlsAllowed: false`）。"原始组件"指设计系统基础组件，不是原生 HTML。

### 现有场景页映射（选择时以实际文件为准）

下表为 UI Demo 目录 `${UI_DEMO_ROOT}/` 下的场景页清单。

| 页面意图 | 首选场景页 | Catalog / 组件映射 |
|---|---|---|
| 无框架标准列表 | `${UI_DEMO_ROOT}/scenarios/szd-standard-list-page.html` | `standard-list-root` / `DSStandardListTemplate`，固定装配器 |
| 顶部页签 + 左树 + 表格 | `${UI_DEMO_ROOT}/scenarios/card-list-page.html` | `regular-list` / `DSTabs` + `DSTree` + `DSRegularListTemplate`；页面名虽含 card-list，实际不是卡片列表 |
| 左树 + 表格 | `${UI_DEMO_ROOT}/scenarios/szd-tree-table-page.html` | `regular-list` / `DSTree` + `DSRegularListTemplate` |
| 左分组 + 表格 | `${UI_DEMO_ROOT}/scenarios/szd-group-table-page.html` | `regular-list` / `DSGroupTitle` + `DSTabs` + `DSRegularListTemplate` |
| 顶部页签 + 表格（React/bundle 工程） | `${UI_DEMO_ROOT}/scenarios/szd-top-tabs-list-page.html` | `regular-list` / `DSTabs` + `DSRegularListTemplate`；该文件仅 14 行 bundle 宿主，页面本体在 `.page.jsx`，只能在可运行 esbuild 产物的工程使用 |
| 顶部页签 + 表格（静态 / file:// 工程） | `${UI_DEMO_ROOT}/scenarios/regular-list-page.html` | `regular-list` / `ds-regular-list-template` **纯静态骨架**（595 行，顶部页签 + 提示条 + 筛选 + 功能按钮 + 统计行 + 表格 + 固定分页，`type="module"` 计数为 0）；目标工程跑不了 ES module 时选它 |
| 提示条 + 表格 | `${UI_DEMO_ROOT}/scenarios/szd-alert-list-page.html` | `regular-list` / `DSAlert` + `DSRegularListTemplate` |
| 空数据列表 | `${UI_DEMO_ROOT}/scenarios/no-data-table-page.html` | `regular-list` / `DSRegularListTemplate` + `DSEmptyState` |
| 卡片列表、资源库 | 当前 `${UI_DEMO_ROOT}/scenarios/` 无匹配页面 | `card-list` / `DSCardListTemplate`；不得拿 `card-list-page.html` 冒充 |
| 分组表单 + 明细表格 | `${UI_DEMO_ROOT}/scenarios/form-table-page.html` | `edit-form` / `DSEditForm` + `DSDataTable` |
| 树形配置 | `${UI_DEMO_ROOT}/scenarios/tree-config-page.html` | `edit-form` / `DSTree` + 表单/配置组件 |
| 审核评分 | `${UI_DEMO_ROOT}/scenarios/audit-review-page.html` | `audit` / 审核组件；场景页为静态预览，按 React 页面规则迁移实现 |
| 统计看板 | `${UI_DEMO_ROOT}/scenarios/stats-dashboard-page.html` | `dashboard` / `DSDashboardGrid` + 图表组件；静态预览仅作结构参考 |
| 首页工作台 | `${UI_DEMO_ROOT}/scenarios/workbench-home-page.html` | `dashboard` / `DSDashboardGrid` + `DSCard` |
| 子页详情 | `${UI_DEMO_ROOT}/scenarios/detail-page.html` | `edit-form` / `DSSubPageHeader` + 只读表单组件 |
| 详情设置 | `${UI_DEMO_ROOT}/scenarios/detail-page-settings.html` | `edit-form` / `DSEditForm` + `DSButtonGroup` |
| 左侧说明的编辑表单 | `${UI_DEMO_ROOT}/scenarios/detail-left-form-edit-page.html` | `edit-form` / `DSEditForm` + `DSEditField` |
| 表格表单 + 右侧锚点 | `${UI_DEMO_ROOT}/scenarios/detail-table-anchor-page.html` | `detail-table-anchor` / `DSAnchor` + `DSDataTable` |
| 右侧表单抽屉 | `${UI_DEMO_ROOT}/scenarios/drawer-page.html` | `edit-form` / `DSDrawer` + 表单组件 |
| 普通弹窗、删除确认、编辑弹层 | `${UI_DEMO_ROOT}/scenarios/modal-page.html`、`${UI_DEMO_ROOT}/scenarios/delete-modal-page.html`、`${UI_DEMO_ROOT}/components/edit-overlay-templates.html` | `edit-form` / `DSModal`、`DSEditOverlayTemplates` |
| 批量导入向导 | 当前 `${UI_DEMO_ROOT}/scenarios/` 无匹配页面 | `import-wizard` / `DSImportWizard`，如需页面模板须记录缺口 |
| 大屏/投放预览 | 当前 `${UI_DEMO_ROOT}/scenarios/` 无专用投放模板；统计参考 `${UI_DEMO_ROOT}/scenarios/stats-dashboard-page.html` | `display-board` / 按需求选择公开组件并记录缺口 |

`${UI_DEMO_ROOT}/scenarios/200884015180678-3918-136023.html` 等编号 HTML 是设计导出稿，不是 Hermass 的可配置模板；仅在用户要求对照原稿时作为视觉参考。

> 模板不能承载某项需求时报告缺口；禁止以此为理由自由重画。

### 静态模板白名单（目标工程不能运行 ES module 时必读）

目标工程为纯静态站（`file://` 直开、无构建步骤）时，只能整体复制下表模板；其余场景页（含 `szd-*`、`card-list-page`、`form-table-page`、`stats-dashboard-page`、`tree-config-page`、`audit-review-page`）都含 `type="module"` 或依赖 bundle，**不可搬入静态工程**。判断"是否静态工程"看特征而不是目录名：无 `npm run build`、无打包产物、`index.html` 直开可看、页面靠 `<script>` 而非模块入口。

| 模板 | 形态 | 适用 |
|---|---|---|
| `${UI_DEMO_ROOT}/scenarios/regular-list-page.html` | 595 行纯静态，`ds-regular-list-template` 骨架 | 顶部页签 / 提示条 + 筛选 + 功能按钮 + 统计行 + 表格 + 固定分页 |
| `${UI_DEMO_ROOT}/scenarios/modal-page.html` | 纯静态 | 普通弹窗 |
| `${UI_DEMO_ROOT}/scenarios/drawer-page.html` | 纯静态 | 右侧抽屉 |
| `${UI_DEMO_ROOT}/scenarios/delete-modal-page.html` | 纯静态 | 删除确认 |
| `${UI_DEMO_ROOT}/scenarios/workbench-home-page.html` | 纯静态 | 首页工作台 |

判定方式（用包内脚本，不要依赖 grep——Windows 默认没有）：

```bash
node "<专家包>/scripts/check-page.mjs" "${UI_DEMO_ROOT}/scenarios/regular-list-page.html" --static
```

通过 = 该模板可搬入静态工程。脚本会拦四类：`<ds-*>` 自定义标签、`type="module"`、**引用 `*.bundle.*` 构建产物**（`szd-*` 这类 React 场景页只有十几行 HTML，全靠 bundle 渲染，搬走就是空白）、以及 body 内静态结构少于 3 个（同样说明靠 JS 渲染）。想确认某个 `scenarios/*.html` 能不能当静态模板，直接对它跑这条命令。

静态工程落地规则：

1. 整份复制模板文件到输出目录，只改三处：CSS 相对层级、业务字段/文案/数据、页面专属布局与可视化。禁止只挑类名另拼结构。
2. 禁止 Web Components（`<ds-data-table>`、`<ds-group-title>`）与 `<script type="module">`；表格用 `<table>` + `ds-*` 类名，交互用普通 `<script>`。
3. 页面背景必须 `#fff`，不得用 `--ds-color-bg-page` 等灰底色。
4. 模板自带的弹窗/抽屉样式不引入时，改用静态 `modal-page.html` / `drawer-page.html` 的结构，不手写遮罩与关闭按钮。
5. 输出到带外壳的工程时，同步登记该工程的页面映射（外壳的 `index.html` 页面表），否则外壳内无法进入；`check-page.mjs --shell <外壳index.html>` 会验这一条。
6. 骨架尺寸由 `tokens.css` 默认值保证：内边距 `12px`、表头 `40px`、数据行 `46px`、控件高 `32px`、同组按钮 `4px`。页面不重复声明、不覆盖、不自造 10/14/18/24；出图后用 `shot.mjs` 核对计算样式。
7. **静态模板的表格是自造类名**（`.preview-table` / `.data-table`），不读 DS 的 `--ds-table-*` 变量，模板里写死 `th 40 / td 46` 属于正常，但值改了就要同步改 tokens 并回头核这两处。

### 选完模板后：尺寸已在 tokens，不要覆盖

骨架数值已经写进 `packages/design-system/src/tokens.css`，模板直接继承，页面**不需要任何尺寸声明**：

| 项 | 取值 | 来源 |
|---|---|---|
| 内容左右内边距 | `12px` | `--ds-regular-list-inset`（tokens 已定义） |
| 数据表格 | 表头 `40px`、数据行 `46px` | `--ds-table-header-height` / `--ds-table-row-height`（tokens 已定义，`th` 与 `td` 分开取值） |
| 控件高 | `32px` | `--ds-control-height-md` |
| 区域间距 | `8 / 8 / 8` | 模板 CSS 的 `--ds-regular-list-*-gap` fallback |

因此：**不要**在页面里再写 `--ds-regular-list-inset: 12px`、`.data-table td { height: 46px }`、`th { height: 40px }` 这类重复声明，也不要自造 10/14/18/24。实测方式出图后用计算样式核对（`paddingLeft === '12px'`、`th 40px`、`td 46px`），而不是靠"有没有写覆盖"来判对。

只有模板未覆盖的少数项需要查表：弹窗档位（600 / 900 / 1200，表格弹窗最小 900）、表格式字段行高（40，与数据表格 46 区分）。这两项见同级 `docs/页面骨架尺寸.md`（核对清单与取值来由，不是生成前置读物）；若该文件不存在，按上述两档取值并在交付说明里写明依据。

`ui-demo-style-audit/references/` 是判错用的走查文档（含画板坐标、图层 ID、未验证标记），不用于生成；两者不一致时以 tokens 实际计算值为准。

### 选定模板后直接出图

- 场景模型登记模板及字段后执行 `npm run generate:demo-context -- <场景JSON>`。读取生成的 `template` 和 `fixedEntrySource`；有固定入口时原样使用，只替换文件名，不增加布局 JSX。
- `${UI_DEMO_ROOT}/scenarios/szd-standard-list-page.html` 和 `szd-standard-list-page.html` 是 `standard-list-root` 的别名，直接装配 `${UI_DEMO_ROOT}/templates/react-business-page/standard-list.page.jsx.template`，不需要用户记住新 ID。
- 该模板的业务配置放在同目录 `<page>.config.js`，导出 `usePageConfig()`，只填 `filterProps`、`toolbarActions`、`tableProps`、`pagination`。字段使用正式领域包；列宽使用组件规则。不可修改模板入口、模板组件或布局 CSS。
- 新建该模板页面必须调用 `node "${UI_DEMO_ROOT}/scripts/assemble-standard-list.mjs" <demo-context.json>` 装配四件套，只编辑配置；随后加 `--check` 检查固定骨架。程序拒绝覆盖已存在文件，不允许删文件绕过。`--output <目录>` 仅用于隔离验证；正式输出默认取场景的 demoPath。
- 其他模板仍按其现有源文件和组件配置原样使用；不声称它们都具有严格列表的自动校验能力。未登记扩展点不得自行补造。
- 构建页面后直接用浏览器截图。出图指实际 HTML 渲染结果，不用图片生成工具重绘界面；默认交付页面地址与截图，不额外做视觉调整。

## 强制禁令

- JSX 手写 `button` / `input` / `select` / `textarea` / `table`
- 复制 `.ds-*` 内部 DOM，或覆盖 `.ds-*`、`.frame2-*` 样式
- 跨 Demo 导入 CSS/JS/Mock；把页面专属实现塞进公共 `shared/`
- 复制菜单配置到页面；修改锁定的旧静态页面（需先迁移到 React 业务页模板）
- 页面内自造页签：`DSRegularListTemplate` 自带 `tabs` / `activeTab` / `onTabChange`
- 静态工程（`file://` 直开）引入 `<ds-data-table>`、`<ds-group-title>`、`<script type="module">`：这些依赖 Lit / ES module，静态协议下必定不注册或 404
- 静态工程用 React bundle 场景页（`szd-*`、`card-list-page` 等）顶替静态模板
- 只引组件 CSS、复制 `.ds-*` 类名就宣称"已复用模板"；反之已整份复制白名单模板的，不得再判为自造
- 在页面里重复声明 tokens 已给对的尺寸（`--ds-regular-list-inset`、`th`/`td` 高度），或目测写下 10/14/18/24 之类自造间距

## 新建页面登记项（漏一处就会被校验拦下）

| 登记项 | 位置 | 校验 |
|---|---|---|
| 模板 | `${UI_DEMO_ROOT}/specs/page-template-catalog.json` 选 1 个 | `policy.templateRequired = true` |
| 组合模式 | `${UI_DEMO_ROOT}/specs/page-compositions.json` 登记 `pageId/path/mode`；shared/hybrid 另填 `basePageRef`+`extensions` | `npm run validate:page-compositions` |
| 回归登记 | `${UI_DEMO_ROOT}/specs/business-page-regression.json` 加 `{name,file,rootSelector,requiredSelectors,activeFeature}`，`name` 必须等于 HTML 文件名去扩展名 | 回归基线 |
| 字段 | 先 `${UI_DEMO_ROOT}/scripts/find-standard-field.mjs`，新字段登记扩展 | `validate:field-ontology` |
| 场景 | `${ONTOLOGY_ROOT}/product-world/scenarios/` 立场景模型，未确认写 `research.openQuestions` | `validate:product-world` |
| 三件套同名 | `<name>.html` + `<name>.page.jsx` + `<name>.css` 同目录同名 | 同名互相推导校验 |

> 跨页复用详情页/子页面时：抽成独立模块放在宿主页子目录，**绝不能命名成 `<name>.page.jsx`**（会被打包脚本误判成页面入口）；被搬走的模块级常量必须带 `export`，并删除原页面的死 import。

详细组件用法（DSDataTable 列宽/操作列冻结、DSDrawer、页内多视图）见 `references/component-pitfalls.md`。
