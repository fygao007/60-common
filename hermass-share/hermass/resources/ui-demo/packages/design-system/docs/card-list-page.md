# Card List Page 卡片列表页

设计来源：

`mastergo://getd2c/195991886967017-11-83832`

用于评价方案、应用中心、配置中心等“以卡片承载列表记录”的管理页面。页面组合由
`DSCardListTemplate` 提供，单条记录继续使用 `DSCard`。

## 页面结构

- 顶部为一级页签和右侧上下文选择。
- 筛选区默认展示名称输入、状态选择、重置和查询。
- 工具栏承载新增、批量操作、导入导出及显示设置。
- 卡片区在宽屏使用三列，中屏两列，窄屏单列；列间距 `16px`。
- 底部保留总数、页码、跳页和每页条数。

## 卡片规则

- 使用 `variant="list-item"`、`layout="short"`，宽度范围为 `350px - 500px`。
- 发布状态使用 `status` 和 `statusTone`，不要复用业务标签 `tag`。
- 元数据通过 `fields` 传入，长管理员名称单行省略并保留完整 `title`。
- 配置不完整时使用 `notice`，提示条不能替代发布状态。
- 管理操作使用 `actionAppearance="button"`；本场景固定展示四个操作，不折叠。
- 已发布记录显示“取消发布”，未发布记录显示“发布”。

## React 用法

```jsx
<DSCardListTemplate
  cards={schemes}
  filterProps={{
    fields: filterFields,
    onSearch: handleSearch,
    onReset: handleReset,
  }}
  onCardAction={(action, card) => {
    if (action === 'publish') publish(card.id)
    if (action === 'unpublish') unpublish(card.id)
  }}
  pagination={pagination}
/>
```

自定义单卡：

```jsx
<DSCard
  title="教师数据中心"
  variant="list-item"
  status="已发布"
  statusTone="success"
  fields={[
    { key: 'updatedAt', label: '最近修改时间：', value: '2025-06-03 00:00:00' },
    { key: 'admin', label: '管理员：', value: '张老师、李老师' },
  ]}
  notice={{ content: '对象未设置完整', actionLabel: '设置对象', onAction: openConfig }}
  actions={actions}
  actionAppearance="button"
  actionLimit={4}
/>
```

交互预览：`ui-demo/scenarios/card-list-page.html`。
