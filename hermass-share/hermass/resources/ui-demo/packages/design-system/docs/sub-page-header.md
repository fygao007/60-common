# DSSubPageHeader

来源：`mastergo://getd2c/195991886967017-48-038832`

`DSSubPageHeader` 用于系统二级页面顶部导航区域，统一返回入口、标题层级和右侧操作承载。业务页应从 `@wisedu/design-system` 导入组件，不在页面级 JSX/CSS 中复制本组件内部 DOM 或尺寸规则。

## 结构

- 返回按钮默认展示，文案为“返回”。
- 返回按钮后展示 `1px × 20px` 分隔线。
- 页面标题必填，使用单行省略。
- 右侧操作通过 `actions` 传入，按钮继续使用 `DSButton`。

## 视觉

- 容器高度：`52px`。
- 容器内边距：`12px 16px`。
- 容器圆角：`12px`，白色背景。
- 返回按钮：`14px` 图标，`14px / 22px` 文案，内边距 `5px 8px`。
- 标题：`16px / 24px`，字重 `600`。
- 分隔线：`#EEEEF0`，高度 `20px`。

## API

```jsx
<DSSubPageHeader
  title="新增异动类型"
  onBack={handleBack}
  actions={<DSButton>保存</DSButton>}
/>
```

- `title`：页面标题。
- `showBack`：是否显示返回按钮，默认 `true`。
- `showDivider`：是否显示分隔线，默认跟随 `showBack`。
- `backLabel`：返回文案，默认“返回”。
- `backHref`：返回链接；提供后渲染为链接。
- `onBack`：返回回调；未提供 `backHref` 和 `onBack` 时调用 `window.history.back()`。
- `actions`：右侧操作区。
- `surface`：是否使用白底大圆角表面，默认 `true`。
