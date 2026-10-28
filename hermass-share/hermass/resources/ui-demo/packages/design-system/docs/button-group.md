# ButtonGroup 按钮组规范

来源：MasterGo《📌【PC】基础控件 / ButtonGroup》

设计文档：
https://mastergo.com/goto/T2gSeoDg?page_id=1052:03015&file=139272150501659&devMode=true

## 当前落地范围

- React 组件：`src/ButtonGroup/index.jsx`
- 样式文件：`src/ButtonGroup/index.css`
- 依赖组件：`src/Button`
- HTML 预览：`ui-demo/components/button-group-states.html`

## 形态

- Default Group：相同优先级的普通按钮组合，按钮之间保留固定间距。
- Primary Mixed：次要按钮 + 主按钮的操作组合。
- Segment Group：相邻按钮合并边框，用于互斥切换类操作。
- Text / Link Group：表格行内操作或轻量操作组合。
- Icon Group：工具栏图标按钮组合。
- Block Group：撑满容器的按钮组。

## 状态

- Default：默认状态。
- Hover：普通按钮文字变主色，背景使用浅蓝底，边框变主色；主按钮使用亮一级品牌色。
- Active：普通按钮文字和边框使用按下主色，背景使用更深浅蓝底；主按钮使用深一级品牌色。
- Focus：按钮保留主色边框，并增加浅蓝外发光聚焦环。
- Disabled：支持单项禁用和整组禁用，文字、边框、底色统一降级。
- Loading：通常用于提交类主按钮，按钮禁用并显示加载图标，避免重复提交。

## 使用规则

- 查询区：常用 `重置` + `查询`。
- 工具栏：常用 `新增`、`导入`、`导出`、`删除`。
- 表格行内：使用 Link / Text Group，避免占用过多宽度。
- 主按钮通常放在组内最后一个或右侧。
- 默认按钮组之间保留间距，不做共边框。
- 仅分段按钮组使用共边框；悬浮按钮需要提高层级，避免边框被覆盖。
- 状态样例必须覆盖普通按钮、主按钮、Link 操作按钮、分段按钮四类，避免只展示单一按钮类型。

## 后续待对齐

- 从 MasterGo 设计稿继续校准按钮组间距、共边框、圆角和状态截图。
