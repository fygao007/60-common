# DSTransfer 穿梭框

## 设计来源

- MasterGo：`mastergo://getd2c/195991886967017-11-076878`
- 原始提取：`ui-demo/.mastergo/transfer/`
- React：`ui-demo/packages/design-system/src/Transfer/index.jsx`
- 样式：`ui-demo/packages/design-system/src/Transfer/index.css`
- 预览：`ui-demo/components/transfer-components.html`

## 组件形态

- `variant="list"`：平铺字段，适合字段配置和简单选项。
- `variant="grouped"`：分组字段，分组标题支持折叠和整组选取。
- `variant="table"`：多列表格，适合包含编码、名称、类型等属性的复杂对象。
- `variant="tree"`：树形层级，适合组织、菜单和分类目录。
- `selectedVariant="cards"`：右侧以轻量卡片展示已选项。
- `selectedVariant="table"`：右侧保持表格列语义并提供删除操作。

## 布局规则

- 两个面板间距为 `12px`，右侧面板默认宽度为 `300px`。
- 面板使用 `1px #EEEEF0` 边框和 `4px` 圆角。
- 面板标题栏高度为 `48px`，内边距为 `12px`，背景为 `#FAFAFA`。
- 标题和数量使用 `14px / 22px`，标题字重为 `600`。
- 搜索框宽度为 `200px`，高度为 `32px`。
- 已选卡片使用 `#FAFAFA` 背景、`8px` 内边距和 `4px` 圆角。
- 分组标题高度为 `38px`，使用由 `#F5F5FF` 向透明色过渡的背景。
- 树节点高度为 `32px`，每级缩进增加 `20px`。
- 小屏宽度下两个面板改为上下排列。

## 交互规则

1. 左侧复选框选中后立即加入右侧，不使用中间移动按钮。
2. 搜索只过滤左侧待选项，不改变右侧已选内容。
3. “全选”只加入当前搜索结果中可选且未禁用的项目。
4. 分组全选只作用于当前分组中的可选项目。
5. 右侧关闭按钮或“删除”会将项目放回左侧。
6. “清空”移除全部可移除项目；无可移除项时按钮禁用，禁用项会保留。
7. 禁用项不能加入或移除；组件整体禁用时所有操作停止。
8. `value` 存在时组件受控；否则使用 `defaultValue` 维护内部状态。

## React 用法

```jsx
import { DSTransfer } from '@wisedu/design-system'

const fields = [
  { key: 'name', title: '姓名', group: '基本信息' },
  { key: 'number', title: '学工号', group: '基本信息' },
  { key: 'mobile', title: '手机号', group: '联系方式' },
]

<DSTransfer
  variant="grouped"
  dataSource={fields}
  value={selectedKeys}
  onChange={(keys, items, meta) => {
    setSelectedKeys(keys)
    console.log(items, meta.action)
  }}
/>
```

表格形态：

```jsx
<DSTransfer
  variant="table"
  selectedVariant="table"
  dataSource={disciplines}
  defaultValue={['081200']}
  columns={[
    { key: 'code', title: '学科编码', dataIndex: 'code' },
    { key: 'title', title: '学科名称', dataIndex: 'title' },
    { key: 'category', title: '门类', dataIndex: 'category' },
  ]}
  sourceExtra={<DisciplineFilters />}
  sourceFooter={<Pagination />}
/>
```

## 主要属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `dataSource` | 数据源；树形数据通过 `children` 嵌套 | `[]` |
| `value` | 已选 key 数组，传入后为受控模式 | - |
| `defaultValue` | 非受控默认已选 key 数组 | `[]` |
| `variant` | `list`、`grouped`、`table`、`tree` | `list` |
| `selectedVariant` | 右侧 `cards` 或 `table` | `cards` |
| `columns` | 表格列配置 | `[]` |
| `titles` | 左右面板标题 | `['待选', '已选']` |
| `searchable` | 是否显示搜索 | `true` |
| `showSelectAll` | 是否显示全选 | `true` |
| `clearable` | 是否显示清空 | `true` |
| `filterOption` | 自定义搜索匹配 | 按标题包含匹配 |
| `renderItem` | 自定义待选项内容 | 标题 |
| `renderSelectedItem` | 自定义已选卡片内容 | 跟随 `renderItem` |
| `sourceExtra` | 左侧筛选区扩展内容 | - |
| `sourceFooter` | 左侧底部扩展内容 | - |
| `onChange` | `(keys, items, meta)` | - |
