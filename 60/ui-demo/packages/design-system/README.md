# @wisedu/design-system

60 系统 PC 页面生成使用的本地 React 组件库。组件以 `DS*` 前缀导出，样式基于 `src/tokens.css` 和 `src/base.css`。

## HTML 预览底子

HTML 预览默认使用框架2，框架1仅保留兼容实现：

| 文件 | 用途 |
|---|---|
| `index.jsx` + `index.css` | React 组件 `DSAppShell`，业务页用 |
| `AppShellV2/app-shell-v2.css` + `app-shell-v2.js` | 默认 HTML 预览框架，使用 Shadow DOM 隔离 |
| `AppShell/app-shell.css` + `app-shell.js` | 框架1兼容实现，不用于新页面 |

`ui-demo/components/` 中的组件预览通过兼容适配器接入框架2：

```html
<link rel="stylesheet" href="../packages/design-system/src/base.css" />
<link rel="stylesheet" href="../packages/design-system/src/AppShell/app-shell.css" />

<body>
  <div class="frame2-stage ds-scope">
    <main>...</main>
  </div>

  <script src="../assets/icon-registry.js"></script>
  <script src="../packages/design-system/src/AppShellV2/app-shell-v2.js?v=2.2.3"></script>
  <script src="../framework/framework-2.staff-preset.js?v=2.2.3"></script>
  <script src="../framework/framework-2.js?v=2.2.3"></script>
  <script src="../framework/legacy-app-shell-adapter.js?v=2.2.3"></script>
  <script>
    WiseAppShell.init({
      secondaryNav: {
        title: '组件库',
        items: ['功能索引', '当前组件', 'Ant目录', '组件总览', '表单', '表格', '框架']
      },
      activeFeature: '表单',
      onFeatureChange(feature) {
        // 按当前页面路由表跳转。
      }
    });
  </script>
</body>
```

新索引页和新业务页直接参考 `ui-demo/framework/page-template.html`。框架选择入口为 `ui-demo/framework/framework-index.html`。

`app-shell.css` 同时包含 **CRUD 列表通用模式**（`.operation-query-row` / `.operation-table` / `.ds-switch` / `.pages` / `.operation-footer`），业务页只需在 `<style>` 里写自己表格的列宽。

操作区无数据表格页的组件、状态、尺寸与间距基准见
`docs/no-data-table-page.md`，来源为
`mastergo://getd2c/195991886967017-2-016401`。

常规列表页的组合结构、响应式与交互规则见
`docs/regular-list-page.md`，来源为
`mastergo://getd2c/195991886967017-11-041340`。React 页面优先使用
`DSRegularListTemplate`，交互预览见 `ui-demo/scenarios/szd-standard-list-page.html`。

卡片列表页的组合结构、状态与交互规则见
`docs/card-list-page.md`，来源为
`mastergo://getd2c/195991886967017-11-83832`。React 页面优先使用
`DSCardListTemplate`，交互预览见 `ui-demo/scenarios/card-list-page.html`。

右侧表单抽屉的组件、状态、尺寸与间距基准见
`docs/drawer.md`，来源为
`mastergo://getd2c/195991886967017-2-003917` 和
`mastergo://getd2c/195991886967017-11-92271`。

弹窗的尺寸预设、内容自适应、关闭约束、焦点与提交状态见
`docs/modal.md`，主要来源为
`mastergo://getd2c/139272150501659-4316-81924`；交互预览见
`ui-demo/components/modal-components.html`。

单列编辑弹窗、双列编辑弹窗和带分组抽屉的组合规则见
`docs/edit-overlay-templates.md`；React 使用 `DSSingleEditModal`、
`DSDoubleEditModal`、`DSGroupedEditDrawer`、`DSEditField` 和
`DSFormGroup`，交互预览见
`ui-demo/components/edit-overlay-templates.html`。

删除确认与删除失败场景见 `docs/delete-modal.md`，删除确认来源为
`mastergo://getd2c/195991886967017-2-003863`。

### 一级页签 / 业务标题样式

一级页签选中态统一使用 8px 高的底部色块，不使用边框模拟。
只有存在多个一级页签时才展示标题行；单个页签或无页签时隐藏。
页签行默认不放右侧按钮，右侧仅保留自适应占位或业务自定义内容。

HTML 预览底子：

```html
<header class="operation-header">
  <div class="operation-section-tabs" aria-label="一级页签">
    <button class="operation-section-tab is-active" type="button" data-section-tab="pending"><span>待审核</span></button>
    <button class="operation-section-tab" type="button" data-section-tab="reviewed"><span>已审核</span></button>
  </div>
  <div class="operation-header-spacer"></div>
</header>

<section data-section-panel="pending">待审核内容</section>
<section data-section-panel="reviewed" hidden>已审核内容</section>

<!-- 单个一级页签时隐藏整行 -->
<header class="operation-header is-hidden">...</header>
```

`app-shell.js` 会自动处理：

- 同一 `.operation-section-tabs` 内点击切换 `.is-active`。
- 存在 `[data-section-panel]` 时，按 `data-section-tab` 对应值自动显示 / 隐藏内容。
- `operation-header` 内只有 0 或 1 个页签时自动加 `.is-hidden`，不展示标题行。
- 如需自定义刷新表格，可传 `onSectionTabChange(key, tab)`。

React / 组件库样式：

```jsx
const [activeSection, setActiveSection] = useState('pending')

<DSAppShell
  sectionTabs={[
    { key: 'pending', label: '待审核' },
    { key: 'reviewed', label: '已审核' },
  ]}
  activeSectionTab={activeSection}
  onSectionTabChange={setActiveSection}
>
  {activeSection === 'pending' ? <PendingTable /> : <ReviewedTable />}
</DSAppShell>
```

独立使用 `DSTabs`：

```jsx
<DSTabs
  variant="section"
  activeKey={activeSection}
  onChange={setActiveSection}
  items={[
    { key: 'pending', label: '待审核' },
    { key: 'reviewed', label: '已审核' },
  ]}
/>

{activeSection === 'pending' ? <PendingTable /> : <ReviewedTable />}
```

`variant="section"` 在 `items.length <= 1` 时返回 `null`，避免单个一级页签占用标题行。

也可在 `DSAppShell` 内部直接使用样式类：

```jsx
<div className="ds-app-shell__section-tabs">
  <button className="ds-app-shell__section-tab is-active" type="button"><span>待审核</span></button>
  <button className="ds-app-shell__section-tab" type="button"><span>已审核</span></button>
</div>
```

视觉规则：文本 `16px / 600 / 24px`，选中态色块 `height: 8px`，色值 `#D6D9FF`，文字层级高于色块。

## 使用

```jsx
import {
  DSAlert,
  DSAnchor,
  DSAppShell,
  DSButton,
  DSDataTable,
  DSDoubleEditModal,
  DSEditField,
  DSEditForm,
  DSFilterBar,
  DSFormGroup,
  DSGroupedEditDrawer,
  DSGroupTitle,
  DSPageHeader,
  DSSingleEditModal,
  DSSwitch,
  DSTabs,
  DSTag,
} from '@wisedu/design-system'
```

编辑弹层布局：

```jsx
<DSDoubleEditModal open={open} title="编辑信息" onCancel={close} onOk={submit}>
  <DSEditField label="名称" required><DSInput /></DSEditField>
  <DSEditField label="类型"><DSSelect options={options} /></DSEditField>
</DSDoubleEditModal>
```

编辑弹层的机器规范位于
`specs/edit-overlay-templates.json`。不要在业务页面复制弹窗、抽屉或字段
内部 DOM；生成规则入口见 `ui-demo/AI_COMPONENT_USAGE.md`。

入口 `src/index.js` 已默认引入 `base.css`，业务页面通常不需要重复引入基础样式。

## 一级标题分组 DSGroupTitle

用于页面内容区内的一级分组标题，不替代页面级 `DSPageHeader`。

```jsx
<DSGroupTitle
  title="分组名称"
  leading={<span className="section-mark" />}
  extra={<DSButton variant="link">查看说明</DSButton>}
/>
```

- 高度固定为 `38px`，横向内边距为 `16px`。
- 标题使用 `14px / 600 / 22px`。
- 背景使用从 `#F0F6FF` 到透明浅紫的水平渐变。
- `leading` 用于前置图标或标识，`extra` 用于右侧按钮、链接或状态。
- 长标题单行省略，完整字符串自动写入 `title` 属性。
- 默认输出 `role="heading" aria-level="1"`，可通过 `level` 调整语义层级。

独立 HTML 页面引用 Web Component：

```html
<script defer src="./packages/design-system/web-components/GroupTitle/ds-group-title.js"></script>

<ds-group-title title="分组名称"></ds-group-title>

<ds-group-title title="基本信息">
  <span slot="leading" class="section-mark"></span>
  <button slot="extra" type="button">查看说明</button>
</ds-group-title>
```

页面只维护标题和插槽内容，组件内部结构与样式由
`web-components/GroupTitle/ds-group-title.js` 统一管理。完整预览见
`ui-demo/components/group-title-components.html`。

## 选项卡 DSTabs

`DSTabs` 覆盖基础选项卡、多选项卡溢出切换、侧边选项卡和一级页签。

结构规则：

- 标题：字段名称或功能名称。
- 数量：跟随名称展示，使用 `count`。
- 标题过长时截断，鼠标悬浮通过 `title` 展示全称。
- 后置操作可使用 `more / actions / onMore`，例如侧边选项卡右侧的更多按钮。

基础选项卡：

```jsx
<DSTabs
  activeKey="a"
  items={[
    { key: 'a', label: '选项 0' },
    { key: 'b', label: '选项 0' },
  ]}
/>
```

多选项卡溢出切换：

```jsx
<DSTabs
  overflow
  activeKey="a"
  items={[
    { key: 'a', label: '选项 0' },
    { key: 'b', label: '选项 0' },
    { key: 'c', label: '选项 0' },
    { key: 'd', label: '选项 0' },
  ]}
/>
```

侧边选项卡：

```jsx
<DSTabs
  variant="side"
  orientation="vertical"
  activeKey="mobile"
  items={[
    { key: 'teacher', label: '导师模块环工', icon: <UserIcon /> },
    { key: 'mobile', label: '研究生院试用移动端', icon: <UserIcon />, more: true },
  ]}
/>
```

状态规则：

- 默认：未选中为灰色文本，选中为高亮文本并显示指示线。
- Hover：文字变深；侧边选项卡出现浅灰背景。
- Press：文字使用主色。
- Disabled：置灰且不可点击。
- 多选项卡标题数量超出区域时，使用 `overflow` 展示左右切换按钮。

## 组件清单

基础控件：

- `DSAnchor`
- `DSButton`
- `DSButtonGroup`
- `DSIconButton`
- `DSField`
- `DSInput`
- `DSSelect`
- `DSCascader`
- `DSTransfer`
- `DSUpload`
- `DSRadioGroup`
- `DSRichTextEditor`
- `DSTextarea`
- `DSTimePicker`
- `DSTag`
- `DSSwitch`

按钮专项规范：

- `docs/button.md`：MasterGo《📌【PC】基础控件 / Button》设计链接与落地规则。
- `docs/button-group.md`：MasterGo《📌【PC】基础控件 / ButtonGroup》设计链接与落地规则。
- `docs/anchor.md`：MasterGo 锚点设计链接与落地规则。
- `docs/card.md`：MasterGo 卡片设计链接、布局、状态与交互规则。
- `docs/card-list-page.md`：卡片列表页的筛选、工具栏、卡片网格、状态与分页规则。
- `docs/sub-page-header.md`：二级页面顶部导航设计链接、结构与 API。
- `docs/tag.md`：流程状态标签的阶段映射、三种形态与交互边界。
- `docs/select.md`：MasterGo 选择器设计链接与落地规则。
- `docs/cascader.md`：MasterGo 级联选择器设计链接与落地规则。
- `docs/transfer.md`：MasterGo 穿梭框设计链接、四类形态与交互规则。
- `docs/upload.md`：MasterGo 上传组件设计链接、状态、文件生命周期与 API。
- `docs/radio.md`：MasterGo 单选设计链接与落地规则。
- `docs/rich-text-editor.md`：MasterGo 富文本编辑器设计链接与落地规则。
- `docs/time-picker.md`：MasterGo 时间选择器设计链接与落地规则。

HTML 表单预览：

- 完整表单页：`ui-demo/components/form-components-page.html`
- 状态页：`ui-demo/components/form-input-states.html`、`ui-demo/components/form-select-states.html`、`ui-demo/components/form-cascader-states.html`、`ui-demo/components/transfer-components.html`、`ui-demo/components/upload-components.html`、`ui-demo/components/form-textarea-states.html`、`ui-demo/components/form-rich-text-editor-states.html`
- 选项页：`ui-demo/components/form-radio-group-states.html`、`ui-demo/components/form-checkbox-group-states.html`、`ui-demo/components/form-switch-states.html`
- 日期时间页：`ui-demo/components/form-date-picker-states.html`、`ui-demo/components/form-date-range-states.html`、`ui-demo/components/form-time-picker-states.html`、`ui-demo/components/form-time-range-states.html`、`ui-demo/components/form-datetime-picker-states.html`、`ui-demo/components/form-datetime-range-states.html`
- 上传页：`ui-demo/components/form-upload-button-states.html`、`ui-demo/components/form-upload-dragger-states.html`

布局与导航：

- `DSAppShell`
- `DSPageHeader`
- `DSSubPageHeader`
- `DSGroupTitle`
- `DSCard`
- `DSTree`
- `DSTabs`

## 二级页面顶部导航 DSSubPageHeader

用于系统二级页面顶部区域，来源为
`mastergo://getd2c/195991886967017-48-038832`。默认包含返回按钮、
20px 分隔线和必填页面标题；高度固定为 `52px`，横向内边距为 `16px`，
整体使用白底与 `12px` 圆角，适配高校人事系统清亮蓝色体系。

```jsx
<DSSubPageHeader
  title="新增异动类型"
  onBack={() => navigateBack()}
/>
```

可配置项：

- `title`：页面标题，必填，单行省略。
- `showBack`：是否展示返回按钮，默认 `true`。
- `backLabel`：返回按钮文案，默认“返回”。
- `onBack` / `backHref`：按钮回调或链接地址；未传时调用浏览器历史返回。
- `actions`：右侧扩展操作，应继续使用 `DSButton` 等设计系统组件。

## 卡片 DSCard

卡片设计与交互规则来自
`mastergo://getd2c/139272150501659-2393-033371`，完整规范见
`docs/card.md`，交互预览见 `ui-demo/components/card-components.html`。
卡片管理列表场景来自 `mastergo://getd2c/195991886967017-11-83832`，
页面模板见 `docs/card-list-page.md`。

```jsx
<DSCard
  title="主标题"
  tag="标签"
  actions={[
    { key: 'edit', label: '编辑', onClick: handleEdit },
    { key: 'detail', label: '详情', onClick: handleDetail },
    { key: 'copy', label: '复制', onClick: handleCopy },
    { key: 'delete', label: '删除', danger: true, onClick: handleDelete },
  ]}
>
  卡片内容
</DSCard>
```

- `layout="short"`：宽度 `350px - 500px`，适合网格自适应排列。
- `layout="long"`：独占一行；可配合 `actionsPlacement="header"` 和 `actionDisplay="hover"`。
- `switchable`：提供启用/停用状态，使用 `enabled` 和 `onEnabledChange` 受控。
- `selectable`：支持鼠标及 `Enter / Space` 选择，`selection` 可选 `light` 或 `prominent`。
- 操作超过 `actionLimit` 时自动折叠到“更多”菜单，默认上限为 `3`。
- `layout="image"` 支持 `image / media / mediaBadge / footer` 图片卡插槽。
- `status / fields / notice` 用于管理列表中的状态、信息行和缺失配置提示。
- `variant="list-item"` 配合 `actionAppearance="button"` 生成管理列表卡片。

## 穿梭框 DSTransfer

穿梭框设计与交互规则来自
`mastergo://getd2c/195991886967017-11-076878`，完整规范见
`docs/transfer.md`，交互预览见 `ui-demo/components/transfer-components.html`。

```jsx
<DSTransfer
  variant="grouped"
  dataSource={fields}
  value={selectedKeys}
  onChange={(keys) => setSelectedKeys(keys)}
/>
```

- `variant` 支持 `list`、`grouped`、`table` 和 `tree`。
- 左侧搜索只过滤待选项；勾选后立即加入右侧。
- 右侧支持单项移除、清空和卡片/表格两种展示。
- 使用 `sourceExtra` 与 `sourceFooter` 扩展筛选区和分页。

## 上传组件 DSUpload

上传组件设计与交互规则来自
`mastergo://getd2c/139272150501659-1259-36938`，完整规范见
`docs/upload.md`，交互预览见 `ui-demo/components/upload-components.html`。

```jsx
<DSUpload
  mode="dragger"
  listType="picture-card"
  accept="image/*,.pdf"
  multiple
  maxCount={4}
  request={uploadRequest}
/>
```

- 支持点击、拖拽和粘贴文件。
- 支持文字列表与图片/文件卡片结果。
- 覆盖上传中、成功、失败、取消和重试。
- `DSImportUpload` 继续作为导入向导专用组合组件。

数据展示：

- `DSFilterBar`
- `DSDataTable`
- `DSParentChildTable`
- `DSPagination`
- `DSEmptyState`
- `DSEmptyGuide`

缺省页应先匹配无数据、无待办、无权限、网络异常、无消息、无搜索结果、维护中或加载失败，再决定是否提供恢复操作。高级空状态使用 `DSEmptyGuide` 组合指定操作、多个步骤、推荐方案和跳过入口。完整规则见 `docs/empty-state.md`，交互预览见 `ui-demo/components/empty-state-components.html`。

审核场景：

- `DSAuditStatusTabs`
- `DSAuditToolbar`
- `DSAuditActions`
- `DSAuditOpinionModal`
- `DSAuditDetailDrawer`

导入场景：

- `DSImportSteps`
- `DSImportUpload`
- `DSImportMappingTable`
- `DSImportValidationPanel`
- `DSImportResult`

浮层：

- `DSModal`
- `DSDrawer`

页面模板：

- `DSRegularListTemplate`
- `DSCardListTemplate`
- `DSCrudTemplate`
- `DSAuditTemplate`
- `DSImportWizard`

## 列表页组合

```jsx
<DSPageHeader title="方案管理" description="维护招生方案、分组规则与审核状态。" actions={<DSButton>新增</DSButton>} />
<DSFilterBar fields={filters} onSearch={onSearch} onReset={onReset} />
<DSDataTable
  title="方案列表"
  summary="共 20 条记录"
  columns={columns}
  data={data}
  actions={[
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除', danger: true },
  ]}
  pagination={{ total: 20, current: 1, pageSize: 10 }}
/>
```

低代码系统风格列表可使用：

```jsx
<DSDataTable
  variant="lowcode"
  title="条款列表"
  summary="已选 2 条"
  draggable
  columns={[
    { key: 'code', title: '条款编号', width: 160 },
    { key: 'name', title: '条款名称', width: 230 },
    { key: 'scope', title: '适用业务', width: 210 },
    { key: 'enabled', title: '启用状态', width: 170, render: (value) => <DSSwitch checked={value} /> },
  ]}
  data={data}
  toolbarActions={<>
    <DSButton>新增</DSButton>
    <DSButton>删除</DSButton>
    <DSButton>导入</DSButton>
    <DSButton>导出</DSButton>
  </>}
  actions={[
    { key: 'edit', label: '编辑' },
    { key: 'detail', label: '详情' },
    { key: 'delete', label: '删除' },
  ]}
/>
```

`variant="lowcode"` 会按教学 6.0 低代码系统贴近 VXE 表格视觉：首列拖拽手柄、次列复选框、40px 表头、46px 行高、右侧表格工具图标、文字操作列和 `暂无数据` 空态。

### 基础表格 DSDataTable

基础表格用于 PC 端列表、配置页和低代码页面的标准数据承载。默认结构支持拖拽列、复选列、序号列、固定列、右侧操作列、多级表头、斑马纹、选中行、可编辑单元格和分页组合。

```jsx
<DSDataTable
  variant="lowcode"
  title="基础表格"
  showToolbar={false}
  draggable
  selectable
  showIndex
  striped
  selectedRowKeys={[1]}
  actions={[
    { key: 'view', label: '按钮' },
    { key: 'edit', label: '按钮' },
    { key: 'delete', label: '按钮' },
  ]}
  columns={[
    { key: 'name', title: '标题', width: 240, fixed: 'left' },
    {
      key: 'owner',
      title: '标题',
      width: 240,
      render: (value) => (
        <span className="ds-data-table__avatar-cell">
          <img className="ds-data-table__avatar" src={value.avatar} alt="" />
          <span>{value.name}</span>
        </span>
      ),
    },
    { key: 'count', title: '标题', width: 129, align: 'right' },
    {
      key: 'tag',
      title: '标题',
      width: 160,
      render: () => <span className="ds-data-table__tag">标签</span>,
    },
    {
      key: 'enabled',
      title: '标题',
      width: 160,
      render: (value) => <DSSwitch checked={value} checkedText="是" uncheckedText="否" />,
    },
    {
      key: 'progress',
      title: '标题',
      width: 200,
      render: (value) => (
        <span className="ds-data-table__progress">
          <span className="ds-data-table__progress-track">
            <span className="ds-data-table__progress-bar" style={{ width: `${value}%` }} />
          </span>
          <span className="ds-data-table__progress-text">{value}%</span>
        </span>
      ),
    },
  ]}
  data={rows}
/>
```

多级表头通过 `children` 描述分组，子列仍按普通列渲染：

HTML 预览页：`ui-demo/components/multi-level-table-page.html`。

```jsx
<DSDataTable
  showToolbar={false}
  selectable={false}
  columns={[
    { key: 'college', title: '院系所', width: 240, fixed: 'left' },
    {
      key: 'totalGroup',
      title: '总计',
      children: [
        { key: 'total', title: '总计', width: 124 },
        { key: 'fullTime', title: '全日制', width: 124 },
        { key: 'partTime', title: '非全日制', width: 124 },
      ],
    },
    {
      key: 'examGroup',
      title: '统考',
      children: [
        { key: 'examFullTime', title: '全日制', width: 124 },
        { key: 'examPartTime', title: '非全日制', width: 124 },
      ],
    },
  ]}
  data={rows}
/>
```

可编辑表格保持表格结构不变，在列上标记 `editable`，并在 `render` 内放入输入控件；`error` 可以传字符串或函数，错误行会按设计稿自动撑高展示错误文案。

```jsx
<DSDataTable
  variant="lowcode"
  showToolbar={false}
  showIndex
  striped
  columns={[
    {
      key: 'status',
      title: '标题',
      width: 240,
      editable: true,
      error: (row) => row.status ? '' : '报错',
      render: (value) => (
        <span className="ds-data-table__edit-control">{value || '请选择'}</span>
      ),
    },
  ]}
  data={rows}
  actions={[
    { key: 'save', label: '保存' },
    { key: 'cancel', label: '取消' },
  ]}
/>
```

状态规范：

- 默认行底色 `#FFFFFF`，悬浮 `#F6F6F7`。
- 斑马纹偶数行底色 `#FAFAFA`。
- 选中行底色 `#F5F5FF`，选中后悬浮 `#EBECFF`。
- 表头底色 `#FAFAFA`，边框 `#EEEEF0`，基础行高 46px。
- 操作列默认展示前 2 个文字按钮，超过后出现 `...` 更多按钮；可通过 `actionsMaxVisible` 调整。

## 状态字段

状态统一使用 `DSTag`，避免页面级重复写胶囊样式：

```jsx
<DSTag status="待审核" />
<DSTag status="已通过" variant="icon" />
<DSTag status="不通过" variant="stamp" />
```

- `filled`：待办面板和待办卡片中的 `24px` 填充标签。
- `icon`：已结事项表格中的 `16px` 状态图标与黑色文字。
- `stamp`：IM 聊天卡片中的 `48px` 斜章。
- 标签只读，状态由业务数据驱动；操作使用独立按钮或链接。
- 完整规则见 `docs/tag.md`，预览见 `ui-demo/components/tag-components.html`。

## 审核页组合

```jsx
<DSAuditStatusTabs
  activeKey="pending"
  items={[
    { key: 'pending', label: '待审核', count: 9 },
    { key: 'reviewed', label: '已审核' },
    { key: 'all', label: '全部' },
  ]}
/>
<DSDataTable
  title="审核列表"
  columns={columns}
  data={data}
  actions={[
    { key: 'pass', label: '通过' },
    { key: 'reject', label: '不通过' },
    { key: 'return', label: '退回' },
    { key: 'detail', label: '详情' },
  ]}
/>
<DSAuditOpinionModal open={opinionOpen} type="return" record={currentRecord} />
<DSAuditDetailDrawer open={detailOpen} record={currentRecord} />
```

## 导入页组合

```jsx
<DSImportWizard
  current={1}
  mappingRows={[
    { key: 'name', source: '姓名', target: '姓名', required: true, status: 'matched' },
    { key: 'college', source: '学院', target: '所属学院', required: true, status: 'matched' },
  ]}
  validationItems={[
    { row: 8, field: '手机号', message: '格式可能不正确', level: 'warning' },
  ]}
/>
```

## 父子表格组合

```jsx
<DSParentChildTable
  title="培养单位与专业方向"
  summary="共 8 个培养单位"
  parentColumns={[
    { key: 'name', title: '培养单位', width: 240 },
    { key: 'code', title: '单位代码', width: 120 },
    { key: 'status', title: '状态', width: 120 },
  ]}
  childColumns={[
    { key: 'name', title: '专业方向', width: 240 },
    { key: 'degree', title: '学位类型', width: 120 },
    { key: 'plan', title: '计划数', width: 100 },
  ]}
  data={data}
  defaultExpandedKeys={['college-1']}
  childSelectable
  childToolbarActions={<DSButton variant="default">批量设置</DSButton>}
  parentActions={[{ key: 'edit', label: '编辑' }]}
  childActions={[{ key: 'detail', label: '详情' }]}
/>
```

父子表格支持 `expandedKeys` 受控展开、`rowExpandable` 控制行是否可展开、`expandedRowRender` 自定义展开内容、`childSelectable` 子表勾选、`childToolbarActions` 子表工具栏、`emptyText` 与 `childEmptyText` 空态文案。

MasterGo「1.2.2 父子表格（分组表格）」场景使用分组布局：

```jsx
<DSParentChildTable
  layout="grouped"
  title="报名信息审核"
  summary="学生参与情况"
  groupTitleKey="college"
  showChildHeader={false}
  childColumns={[
    { key: 'name', title: '姓名', width: 100 },
    { key: 'applyNo', title: '报名号', width: 78 },
    { key: 'school', title: '就读院校', width: 120 },
    { key: 'schoolLevel', title: '学校层次', width: 123 },
    { key: 'rank', title: '成绩排名', width: 92 },
    { key: 'direction', title: '研究方向', width: 100 },
    { key: 'mentor', title: '申请导师', width: 88 },
    { key: 'status', title: '审核状态', width: 100 },
  ]}
  data={groupedData}
  defaultExpandedKeys={['industrial-design-1']}
  childActions={[{ key: 'audit', label: '审核' }]}
/>
```

`layout="grouped"` 会按「分组条 -> 父级汇总行 -> 缩进子表」渲染；父级汇总默认读取 `degree/type/tag`、`title/name`、`code/number`、`count/countText`，复杂场景可用 `renderGroupTitle` 和 `renderParentSummary` 覆盖。
