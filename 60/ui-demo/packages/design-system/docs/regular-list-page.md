# 常规列表页模板

来源：`mastergo://getd2c/195991886967017-11-041340`

原始 D2C 落盘：

- HTML：`.mastergo/regular-list/195991886967017-11-041340.html`
- 图标：`.mastergo/regular-list/asset/icons/`

常规列表页用于有筛选、有数据、有批量操作和分页的后台管理场景。业务实现优先复用 `DSRegularListTemplate`，只替换页签、字段、操作、列定义和数据。

## 无框架根容器表格页（强制规范）

本节适用于只输出页面根容器内部内容的标准表格页；**不适用于**包含一级导航、侧栏、页签条、面包屑等框架壳的业务页。`scenarios/szd-standard-list-page.html` 是该模式的唯一参考实现。后续生成同类页面必须遵守以下规则，不得以业务 CSS 覆盖设计系统内部选择器替代。

### 组件与布局结构

页面必须使用 `DSRegularListTemplate` 组合，根容器内的顺序固定为：

1. `DSFilterBar` 筛选区；
2. `DSButton` 工具栏；
3. `DSDataTable` 表格；
4. `DSPagination` 分页（由模板 footer 输出）。

不得在业务 JSX 手写 `button`、`input`、`select`、`table`，不得复制 `.ds-*` 内部 DOM，也不得渲染或挂载框架壳。

### 必填模板参数

```jsx
<DSRegularListTemplate
  inset={12}
  contentGap={12}
  toolbarGap={8}
  filterProps={{ /* DSFilterBar 配置 */ }}
  tableProps={{
    /* DSDataTable 配置 */
    variant: 'lowcode',
    bordered: true,
  }}
  pagination={{ /* DSPagination 配置 */ }}
/>
```

- `inset={12}`：筛选、工具栏、表格和分页相对根容器四边均保持 `12px` 内边距；不得依赖肉眼不可见的外层背景或业务页额外 margin 伪造。
- `contentGap={12}`：筛选区与工具栏之间固定 `12px`；表格位于同一弹性内容区，随剩余高度自适应。
- `toolbarGap={8}`：工具栏内所有按钮间距固定 `8px`；业务页面不得自行修改 `.ds-regular-list-template__toolbar-actions`。
- 根容器最小高度为当前视口高度（`100vh`）；内容超过视口时自然向下延展，禁止写死页面或表格高度。

### 待提示表格页差异

当列表需要在筛选前展示提示条时，使用 `noticeNode` 传入 `DSAlert`，不要手写提示条 DOM。`noticeNode` 处于模板的弹性内容区，继承 `inset` 和 `contentGap`，因此提示条、筛选区、工具栏会保持同一根容器的对齐逻辑。

```jsx
<DSRegularListTemplate
  inset={12}
  contentGap={12}
  tableGap={8}
  toolbarGap={8}
  notice=""
  noticeNode={<DSAlert tone="info">此处是描述文本</DSAlert>}
  // 其余筛选、表格与分页配置
/>
```

- `noticeNode` 与筛选区间距为 `12px`。
- `tableGap={8}` 使工具栏与表格间距为 `8px`，同时不改变筛选区与工具栏的 `12px` 间距。
- 提示文案、标题和操作必须来自已确认的业务规则；设计稿未提供文案时保留为空，不得编造。

### 顶部带页签表格页差异

当根容器首行是业务页签时，使用基础 `DSTabs` 默认一级页签，由 `DSRegularListTemplate` 的页签区统一承载；不得在业务页面复刻页签按钮或覆盖其内部样式。

```jsx
<DSRegularListTemplate
  tabs={tabs}
  tabVariant="default"
  headerHeight={52}
  headerInset={16}
  inset={12}
  contentGap={12}
  tableGap={8}
  toolbarGap={8}
  // 其余筛选、表格与分页配置
/>
```

- 页签区高度为 `52px`，使用默认一级页签的下划线选中态。
- 页签下方的筛选、工具栏、表格和分页继续执行无框架列表页强约束；不得因页签存在取消表格自适应或底部分页。

### 表格与分页

- 表格必须通过 `DSDataTable` 输出，且最终 DOM 必须包含：`ds-data-table ds-card ds-data-table--lowcode ds-data-table--bordered`。
- 表格区域必须处于 `DSRegularListTemplate` 的弹性内容区，使用剩余可用高度；表格内部按组件标准处理纵向与横向滚动，不得另包一层业务滚动容器。
- 表格区域必须设置 `min-height: 0` 并作为弹性项占满筛选、工具栏之后的剩余空间；窗口高度变化时表格随之伸缩。
- 分页必须使用 `DSPagination`，由 `DSRegularListTemplate` 的 footer 承载。模板根容器使用纵向 flex 布局，footer 自然贴齐页面底部；禁止用 `position: fixed`、`position: absolute` 或空白占位把分页钉在底部。
- 嵌入式列表的父容器必须提供明确高度并使用纵向 flex 布局；模板本身设置 `flex: 1`、`min-height: 0`，确保分页始终位于父容器底部。
- 禁止传入或渲染 `ds-regular-list-template__summary` 汇总条。总数、筛选结果等信息由分页组件或业务提示条表达。

### 生成验收清单

- [ ] 页面没有框架壳、菜单、面包屑或框架工具。
- [ ] 根容器四边到第一个可见组件均为 `12px`。
- [ ] 筛选区与工具栏间距为 `12px`，工具栏按钮间距为 `8px`。
- [ ] 根容器及表格没有硬编码高度；窗口高度改变后表格伸缩、分页仍在底部。
- [ ] 表格上方未出现 `ds-regular-list-template__summary` 汇总条。
- [ ] 表格满足指定四个 class，分页由模板 footer 输出。

## 页面结构

1. 页面画布基准为 `1196px × 820px`，四周留白 `12px`。
2. 内容卡片使用 `12px` 圆角，白色背景，纵向布局。
3. 顶部为一级页签和右侧状态选择，高度 `52px`。
4. 提示条位于页签下方，左右边距 `16px`，背景 `#EBECFF`。
5. 主内容依次为筛选区、批量工具栏、表格。
6. 底部操作区高度 `64px`，左侧分页，右侧场景操作。

## 组件映射

| 模板区域 | 设计系统组件 | 配置 |
|---|---|---|
| 一级页签 | `DSTabs variant="section"` | 多页签时展示，选中态使用 8px 色块 |
| 筛选区 | `DSFilterBar` | 7 个字段、默认展开、支持收起 |
| 筛选字段 | `DSField` + `DSInput` / `DSSelect` | 标签宽 `94px`，控件高 `32px` |
| 查询操作 | `DSButton` | 更多、重置、查询、展开/收起 |
| 批量操作 | `DSButton` | 普通按钮和带下拉箭头按钮 |
| 表格工具 | `DSIconButton` | 全屏、列设置 |
| 数据表格 | `DSDataTable variant="lowcode"` | 复选框、序号、4 个业务列、固定操作列 |
| 分页 | `DSPagination` | 总数、页码、跳页、每页条数 |
| 底部操作 | `DSButton` | 40px 高次按钮和主按钮 |

## 交互规则

- 一级页签切换后刷新当前列表条件与数据。
- 筛选项超过首行时使用“展开/收起”，操作按钮始终位于筛选区末尾。
- “查询”提交当前条件；“重置”恢复默认条件并重新查询。
- 工具栏允许换行，表格工具保持在右侧。
- 勾选行后批量操作只作用于已选数据。
- 表格宽度不足时横向滚动；复选框、序号和操作列保持固定。
- 底部分页和场景操作不随表格横向滚动。
- 小屏下筛选区降为两列和一列，底部操作允许分行，不压缩表格列。
- 当业务页面已有统一页边距时，可开启 `flush`，去掉模板内容区和底部分页区的左右内边距，只保留页面容器边距。

## 尺寸与视觉

| 项目 | 数值 |
|---|---:|
| 页面外边距 | `12px` |
| 顶部页签高度 | `52px` |
| 主内容水平内边距 | `16px` |
| 提示条高度 | `40px` |
| 筛选区内边距 | `16px 16px 8px` |
| 字段间距 | `8px` |
| 字段最小宽度 | `240px` |
| 字段标签宽度 | `94px` |
| 控件和按钮高度 | `32px` |
| 工具栏按钮间距 | `4px` |
| 表头高度 | `40px` |
| 数据行高度 | `46px` |
| 底部操作区高度 | `64px` |
| 底部按钮高度 | `40px` |

### 字段最小列宽

业务表格的字段列按下表声明 `width` 或 `minWidth`；内容更长时可在此基础上增加，不得小于该值。

| 字段类型 | 最小列宽 |
|---|---:|
| 序号 | `52px` |
| 默认文本（显示 10 字） | `196px` |
| 备注内容 | `196px` |
| 年月日时分秒 | `166px` |
| 年月日 | `103px` |
| 年月／年月日 | `126px` |
| 字典字段值 | `126px` |
| 数字类型 | `136px` |
| 开关 | `80px` |
| 审核状态 | `100px` |

- 主色：`#333FFF`。
- 提示条背景：`#EBECFF`。
- 表头背景：`#FAFAFA`。
- 控件边框：`#DCDCE0`。
- 表格边框：`#EEEEF0`。

## React 示例

```jsx
<DSRegularListTemplate
  flush
  tabs={[
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待提交' },
  ]}
  activeTab="all"
  notice="列表数据每小时同步一次"
  filterProps={{
    fields: [
      { key: 'name', label: '姓名', placeholder: '请输入姓名' },
      { key: 'department', label: '部门', type: 'select', options: ['人事处', '教务处'] },
    ],
    onSearch: handleSearch,
    onReset: handleReset,
  }}
  tableProps={{
    columns,
    data,
    selectedRowKeys,
    onSelectRow: handleSelectRow,
  }}
  pagination={{ total: 100, totalPages: 10, current: 1, pageSize: 10 }}
/>
```
