# Card 卡片

设计来源：

`mastergo://getd2c/139272150501659-2393-033371`

管理列表场景来源：

`mastergo://getd2c/195991886967017-11-83832`

用于在独立容器中聚合标题、状态、业务信息和操作。

## 基础规格

- 短卡片宽度范围为 `350px - 500px`，根据容器宽度自适应排列。
- 长卡片使用 `layout="long"`，独占一行。
- 标题区最小高度 `44px`，横向内边距 `16px`。
- 内容区内边距 `16px`，标题与正文默认使用 `14px / 22px`。
- 圆角 `8px`，默认边框 `#EEEEF0`。
- 悬浮边框 `#D6D9FF`，阴影 `0 4px 16px rgba(70,79,105,0.08)`。
- 标题区背景从 `#F7F6FF`、`#F4F6FF` 到 `#F5FAFF` 水平渐变。

## 通用规则

- 标题占用标签、状态和操作以外的剩余空间；超出时单行省略，并通过 `title` 显示全称。
- 操作数量不超过 3 个；超过时保留前置操作并将剩余项收进“更多”菜单。
- `actionDisplay="hover"` 时，操作只在卡片悬浮或内部元素聚焦时显示。
- 可选卡片必须支持鼠标点击和 `Enter / Space` 键切换。
- 卡片内按钮、链接和表单控件的点击不会触发卡片选择。

## 管理列表场景

- 使用 `variant="list-item"` 展示方案、应用或配置记录。
- 发布状态使用 `status` 与 `statusTone`；业务标签仍使用 `tag`，两者语义不混用。
- `fields` 提供结构化信息行，值超长时单行省略。
- `notice` 用于对象、权限等配置不完整提示，可附带修复操作。
- `actionAppearance="button"` 将底部操作切换为描边按钮；场景中可通过 `actionLimit={4}` 固定展示四项操作。
- 完整页面组合使用 `DSCardListTemplate`，见 `docs/card-list-page.md`。

## 状态

### 启用开关

- 未启用：标题区灰色，标题黑色，标签灰色，开关为 `#B9BAC2`。
- 已启用：标题区彩色渐变，标题为 `#1F2699`，标签使用蓝紫渐变，开关为主色。
- 使用 `switchable`、`enabled` 和 `onEnabledChange` 实现受控状态。

### 轻量选择

- `selection="light"`。
- 默认边框 `#EEEEF0`，悬浮边框 `#D6D9FF`，选中边框为主色。
- 内容区使用由上至下的轻量主色渐变。

### 突出选择

- `selection="prominent"`。
- 选中和悬浮使用主色边框。
- 选中时右上角显示 `selectedLabel`，默认文案为“当前选择”。

## React 用法

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

带开关的长卡片：

```jsx
<DSCard
  layout="long"
  title="培养方案"
  tag="启用中"
  switchable
  enabled={enabled}
  onEnabledChange={setEnabled}
  actionsPlacement="header"
  actionDisplay="hover"
  actions={actions}
>
  卡片内容
</DSCard>
```

可选择图片卡：

```jsx
<DSCard
  layout="image"
  image="/room.png"
  imageAlt="实验室"
  mediaBadge="空闲"
  selectable
  selected={selected}
  selection="prominent"
  onSelect={setSelected}
  footer={<RoomDevices />}
>
  <strong>实验 1-20</strong>
  <p>普通教室 · 69 人 · 北校区</p>
</DSCard>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `layout` | `'short' \| 'long' \| 'image'` | `'short'` | 卡片布局 |
| `title` | `ReactNode` | - | 标题 |
| `tag` | `ReactNode` | - | 标题后标签 |
| `status` | `ReactNode \| { label, tone }` | - | 业务状态 |
| `statusTone` | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | 状态色 |
| `extra` | `ReactNode` | - | 标题区扩展内容 |
| `fields` | `{ key, label, value, title }[]` | - | 结构化信息行 |
| `notice` | `string \| { content, actionLabel, onAction, tone }` | - | 卡片内提示条 |
| `actions` | `CardAction[]` | `[]` | 操作列表 |
| `actionLimit` | `number` | `3` | 操作展示上限，超出后折叠 |
| `actionAppearance` | `'link' \| 'button'` | `'link'` | 操作视觉样式 |
| `actionsPlacement` | `'header' \| 'footer'` | `'footer'` | 操作位置 |
| `actionDisplay` | `'always' \| 'hover'` | `'always'` | 操作显示方式 |
| `variant` | `'default' \| 'list-item'` | `'default'` | 业务场景样式 |
| `switchable` | `boolean` | `false` | 是否显示启用开关 |
| `enabled` | `boolean` | `false` | 启用状态 |
| `selectable` | `boolean` | `false` | 是否允许选择 |
| `selected` | `boolean` | `false` | 选择状态 |
| `selection` | `'light' \| 'prominent'` | `'light'` | 选择样式 |
| `media / image` | `ReactNode / string` | - | 图片或自定义媒体 |
| `mediaBadge` | `ReactNode` | - | 图片角标 |
| `footer` | `ReactNode` | - | 底部扩展内容 |
