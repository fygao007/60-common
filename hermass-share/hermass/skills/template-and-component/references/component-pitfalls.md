# 组件使用细节坑（DSDataTable / DSDrawer / 页内多视图）

> 路径基准：UI Demo = `${UI_DEMO_ROOT}`

## DSDataTable：操作列冻结

- 「最后一列操作列冻结」= `actionFixed`，**默认就是 `true`**，`actionsPosition` 默认 `'right'`。只要 `actions` 非空，操作列自动 `position:sticky; right:0`，不需要写页面 CSS。
- 冻结滚动容器是 `.ds-data-table__wrap`（`overflow:auto`）。自检：`wrap.scrollLeft = wrap.scrollWidth` 后比较最后 `th` 的 `getBoundingClientRect().right` 与 `wrap.getBoundingClientRect().right`，相等即生效。
- 行操作项只消费 `key / label / variant / danger / disabled / onClick`；`fixed:'right'` 加在 **action item** 上是空操作。要冻结"列"靠 `actionFixed`。
- `actions: []` 时没有操作列，最后的数据列不会冻结；需要时在该列上写 `{ fixed: 'right' }`。
- 加操作列后表格总宽 = Σ列宽 + 系统列（序号 64 / 勾选 48 / 操作 ≥116）。`table-layout:fixed` 下实际宽度 = `max(minWidth, Σ列宽)`，只增不减，不必同步改 `minWidth`。
- 操作列 `label` 决定列宽（link 变体 ≈ 字数×15+16，下限 44/116）；`actionsMaxVisible` 超出渲染 `...` 按钮，该按钮无点击行为，别让它成为唯一入口。

## DSDataTable：列宽调整

- `minWidth` 是 `<table>` 的 min-width（`minWidth || Σ列宽`）。传小于 Σ列宽的值会按比例压缩所有列并普遍出现省略号——这是部分页面既有观感，镜像它即可，不要擅自改口径。
- 列宽是固定值，合计宽 > 容器宽会横向滚动 → 加列前先算合计，等价替换列宽。
- 可用宽度实测：`wrapW ≈ viewport - 584`（1280→696 / 1440→856 / 1600→1016 / 1920→1336）；合计 ≤ wrapW 时表格按比例拉伸铺满。
- 单元格内容宽度 = 文本宽 + `td` padding 24px；用同字体临时 `span` 量文本天然宽度最准。
- 文字按钮（`DSLinkButton`）自带 `padding: 0 4px`，需精确贴合时用页面级 `.xxx-link { padding: 0 !important }`（只动自己的类，不动 `.ds-*`）。
- 长文本省略号：`DSLinkButton` 文本在 `.ds-button__label` 里，只给外层加 `text-overflow` 无效 → 必须同时给 `.ds-button__label` 加 `display:block; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`。
- 自检脚本：遍历 `td` 比较 `scrollWidth > clientWidth` 找截断，配合 `deviceScaleFactor: 3` 截图确认。

## DSDrawer + DSReadOnlyForm：轻量只读详情

- 监控/列表页"查看详情"：`DSDrawer` + `DSReadOnlyForm`，字段直接复用列表同一份 `FIELDS`，避免第二套口径。但用户点名"用 X 页的详情页"时走抽取方案，不要用这套抽屉。
- 抽屉宽度用页面级类覆盖：`.xx-position-drawer{width:720px!important;max-width:calc(100vw - 24px)}`。
- 长文本字段在 item 上加 `long: true` → 映射为 `fullWidth` + `align:'start'`。
- `DSReadOnlyForm` 的 `labelWidth` 默认 150；中文长标签在 720 抽屉里建议 `labelWidth={170}`。

## 页内多视图（顶部页签切换）

- "顶部加页签切换 A/B，B 保持现状"：不自造页签，用 `DSRegularListTemplate` 的 `tabs={[{key,label},...]}` + `activeTab` + `onTabChange`；`metaLabel=""` + `metaValue=""` 可隐藏右侧 meta 按钮。
- 单页多视图写法：`const isATab = activeTab === 'a'`，然后 `filterProps` / `summary` / `tableProps` 三处按 `isATab` 三元切换；原 `tableProps` 原样搬到 else 分支，不改字段不动样式就是"保持现状"。
- 表格字段"与 X 页一致"：把 X 页列定义复制成一张 `FIELD_LIST`，`map` 成 DSDataTable 列，`value()` 同时供表格渲染与 CSV 导出，避免两处口径漂移。
- 复制过来的工具类（如 `.pa-mono`）必须在当前页 CSS 里另起页级类，不跨页引用别人 CSS。

## 无框架根容器列表模板强约束

只交付根容器内部内容、不带框架壳时（如 `${UI_DEMO_ROOT}/scenarios/szd-standard-list-page.html`）：

1. 不渲染框架壳，只输出筛选区、工具栏、表格、分页；内容距四边均 12px。
2. 必须用 `DSRegularListTemplate`，传 `inset={12}`、`contentGap={12}`、`toolbarGap={8}`；筛选区与工具栏间距 12px，工具栏按钮间距 8px。
3. 表格由 `DSDataTable` 渲染，`lowcode` + `bordered` 变体；分页用模板 footer 贴底，禁止绝对/固定定位伪造。
4. 完整规范见 `${UI_DEMO_ROOT}/packages/design-system/docs/regular-list-page.md`。
