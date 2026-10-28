# 场景模板

本目录存放可直接用于生成业务页面的场景 HTML。

- `scenario-templates-index.html`：场景模板索引。
- `szd-standard-list-page.html`：深职大规范 1.1 表格页（上筛下表）根容器模板，按 MasterGo 设计稿实现且不含框架壳；由 `DSRegularListTemplate` 组合筛选、按钮、`DSDataTable`、Pagination 与 Tag。根容器内边距 12px、筛选至工具栏间距 12px、按钮间距 8px，分页由弹性 footer 贴齐底部；可直接复制作为无框架列表页起点。
- `no-data-table-page.html`：无数据表格页；由 `DSRegularListTemplate`、`DSEmptyState` 与标准分页组件组成，按根容器 12px 内边距、筛选至工具栏 12px、按钮间距 8px 输出。
- `szd-alert-list-page.html`：待提示表格页根容器模板；在标准列表页顶部使用 `DSAlert` 提示条，提示条与筛选区间距 12px，工具栏至表格间距 8px，其余规则继承无框架列表页强约束。
- `szd-top-tabs-list-page.html`：顶部带页签表格页根容器模板；使用基础 `DSTabs` 一级页签，主体继承无框架列表页的 12px 内边距、12px 筛选至按钮间距、8px 按钮间距与底部分页规则。
- `szd-tree-table-page.html`：左树右表格根容器模板；左栏使用 `DSTree`，右栏使用 `DSRegularListTemplate`，表格和分页在右栏剩余高度内自适应。
- `szd-group-table-page.html`：左分组右表格根容器模板；左侧使用展开的 `DSTree` 分组，右侧表格保持自适应与底部分页。
- `form-table-page.html`：分组表单表格页，覆盖主表单、分组说明、明细表格和补充表单。
- `modal-page.html`：普通弹窗。
- `delete-modal-page.html`：删除确认与失败弹窗。
- `drawer-page.html`：右侧抽屉。
- `audit-review-page.html`：审核评分页，覆盖批次切换、提交名单、只读材料、评分表单和上下条导航。
- `stats-dashboard-page.html`：统计看板页，覆盖筛选联动、指标卡、SVG 趋势图、环节进度和排名表格。
- `workbench-home-page.html`：首页工作台，覆盖问候条、数据概览、待办列表、快捷入口和通知公告。
- `tree-config-page.html`：树形配置页，覆盖 300px 左树、节点联动和右侧字段配置表格。
- `detail-page.html`：子页详情页，覆盖返回子页头、分类页签和分组只读详情。
- `detail-page-settings.html`：详情页设置，覆盖返回子页头、设置页签、分组配置表单和底部保存操作。
- `detail-left-form-edit-page.html`：详情页居左表单编辑态，覆盖单列编辑、逐项提示和底部操作。
- `detail-table-anchor-page.html`：详情页表格表单与右侧锚点，使用子页头、分组标题、标准字段组件、数据表格和分组定位。
- 编辑弹层统一入口：`../components/edit-overlay-templates.html`。

审核评分、统计看板、首页工作台、树形配置、子页详情五个场景提炼自 `demos/teaching-portfolio` 的真实业务页，各卡片的"参考实现"链接指向来源页面。

场景规范维护在 `../packages/design-system/docs/`。
