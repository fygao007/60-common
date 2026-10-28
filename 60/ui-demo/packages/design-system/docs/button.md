# Button 按钮规范

来源：MasterGo《📌【PC】基础控件 / Button》

设计文档：
https://mastergo.com/goto/T29Z6cTr?page_id=32:2475&file=139272150501659&devMode=true

## 当前落地范围

- React 组件：`src/Button/index.jsx`
- 样式文件：`src/Button/index.css`
- 按钮组：`src/ButtonGroup`
- 图标按钮：`src/IconButton`
- HTML 预览：`ui-demo/components/ant-components-page.html#official-button`

## 形态

- Primary：主按钮，用于页面主操作。
- Default：普通按钮，用于次要操作。
- Ghost：透明背景按钮。
- Text：文本按钮。
- Link：链接按钮。
- Danger：危险操作按钮。
- AI：AI 渐变按钮，保留为扩展形态。

## 尺寸

- Small：`24px` 高。
- Default：`32px` 高。
- Large：`36px` 高。
- Icon Only：宽高一致，适合工具栏图标按钮。
- Block：宽度撑满容器。

## 状态

- Default：默认可点击。
- Hover：边框或背景强化。
- Active：按下态使用更深主色。
- Focus：键盘焦点显示外发光。
- Loading：显示旋转 loading，按钮不可重复点击。
- Disabled：置灰，不可点击。

## 使用规则

- 页面主操作优先使用 Primary。
- 查询区通常使用 Primary 查询、Default 重置。
- 表格行内操作优先使用 Link 或 Text。
- 删除等高风险操作使用 Danger，但行内删除默认可先保持 Link，进入确认弹窗后再使用 Danger。
- 同一区域多个按钮按“主操作靠右、次要操作靠左或靠前”的顺序排列。

## 后续待对齐

- 从 MasterGo 设计稿继续校准具体色值、圆角、间距和多状态截图。
- 增加 Button 独立 HTML 状态页，覆盖所有形态和状态组合。
