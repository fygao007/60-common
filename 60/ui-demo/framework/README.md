# 框架2使用规范

框架2是智慧人事一体化服务系统的统一后台框架。业务页面只提供内容、当前功能、
左侧菜单和页签，不能定义顶部导航、角色、Logo 或框架尺寸。

## 唯一实现

| 文件 | 职责 |
| --- | --- |
| `framework-2.staff-preset.js` | 全部角色、顶部应用分组和应用 |
| `framework-2.js` | 默认配置、自动角色匹配、配置校验和统一挂载 |
| `../packages/design-system/src/AppShellV2/app-shell-v2.js` | 框架结构与交互 |
| `../packages/design-system/src/AppShellV2/app-shell-v2.css` | 框架布局与视觉 |
| `framework-2.schema.json` | 业务页面允许使用的配置字段 |
| `page-template.html` | 新页面唯一模板 |
| `validate-framework-2.mjs` | 自动检查框架是否被页面覆盖 |

禁止从首页或业务示例复制框架配置。

## 固定规则

| 规则 | 固定值 |
| --- | --- |
| 顶部导航高度 | `52px` |
| 无侧栏卡片模式顶部导航高度 | `48px` |
| 页签栏高度 | `40px` |
| 左侧菜单宽度 | `256px` |
| 左侧菜单收起宽度 | `56px` |
| 操作区四周边距 | `12px` |
| 卡片间距 | `12px` |
| 无侧栏卡片内容内边距 | `20px`，移动端 `16px` |
| 应用下拉每行上限 | 5个，仅点击展开 |
| 系统名称 | 苹方加粗，`18px/24px` |

选中页签保持顶部圆角和左右凹角，使用与工作区同源、同坐标的背景，形成从白色页签栏中镂空的效果。

## 标准引用

框架壳使用 Shadow DOM 隔离。业务页面的全局 `button`、`span`、`nav`、
`.is-active` 等选择器不能覆盖顶部导航、侧栏、页签或弹层；框架样式由
`app-shell-v2.js` 自动加载，不再暴露到业务页面的全局样式作用域。

引用顺序不可改变，三个框架脚本必须使用同一个版本号：

```html
<link rel="stylesheet" href="../packages/design-system/src/base.css" />
<link rel="stylesheet" href="../framework/theme.css" />

<div class="frame2-stage ds-scope">
  <main class="business-page">业务内容</main>
</div>

<script src="../assets/icon-registry.js"></script>
<script src="../packages/design-system/src/AppShellV2/app-shell-v2.js?v=2.2.3"></script>
<script src="../framework/framework-2.staff-preset.js?v=2.2.3"></script>
<script src="../framework/framework-2.js?v=2.2.3"></script>
```

`.frame2-stage` 根节点只能包含 `frame2-stage ds-scope` 两个类。业务页面类必须
放到内部内容节点，禁止再把 `app-page-frame`、`portal-home-frame` 等业务类
挂到框架根节点。

最小配置：

```js
WiseFramework2.mount({
  activeFeature: 'dual-qualified',
  tabs: [
    { key: 'dual-qualified', label: '双师认定', closable: true }
  ]
});
```

框架会根据 `activeFeature` 自动识别：

- 当前角色。
- 当前顶部应用。
- 顶部应用分组。
- 角色下拉列表。
- 应用搜索范围。
- 左侧菜单显示状态。

当同一个应用同时授权给多个角色时，可以额外传入一个已经存在于公共预设中的
`roleName` 进行消歧。页面仍然不能定义角色列表或该角色的应用分组。

例如：

| `activeFeature` | 自动角色 | 自动分组 |
| --- | --- | --- |
| `dual-qualified` | 师资培养发展办 | 资格认定 |
| `annual-assessment` | 岗位职称办 | 考核评价 |
| `certificate-print` | 综合办公室 | 证明预算 |

## 左侧菜单

没有左侧菜单时不配置 `appMenus`，内容区自动横向拉通。

日程、待办、消息中心等无左侧菜单的独立业务页使用卡片工作区：

```js
WiseFramework2.mount({
  activeFeature: 'task-center',
  secondaryNav: { items: [] },
  workspaceVariant: 'card',
  tabs: [
    { key: 'task-center', label: '任务中心', closable: true }
  ]
});
```

- `card`：顶部导航 `48px`；工作区左右和顶部保留 `12px`、底部保留 `4px`，白色内容区横向占满，顶部圆角 `8px`，内容内边距 `20px`。
- `canvas`：保持透明画布，适合首页、工作台和需要自定义卡片编排的页面。
- `workspaceVariant` 不控制侧栏显示；无菜单仍由 `appMenus` / `secondaryNav` 自动判断。
- 无侧栏页面模板见 `no-sidebar-page-template.html`。

有菜单时只配置当前应用菜单：

```js
WiseFramework2.mount({
  activeFeature: 'staff-list',
  appMenus: {
    'staff-list': [
      {
        key: 'staff',
        label: '教职工管理',
        icon: 'home',
        children: [
          { key: 'staff-list', label: '教职工列表' },
          { key: 'staff-change', label: '信息变更' }
        ]
      }
    ]
  },
  tabs: [
    { key: 'staff-list', label: '教职工列表', closable: true }
  ]
});
```

## 页签

- 首页页签由框架自动补齐并固定在第一位。
- 首页页签带房子图标且不可关闭。
- 普通页签可以关闭。
- 详情页不展示面包屑。
- 刷新、全屏和选中状态由框架统一处理。
- 页面不得设置页签背景、圆角或尺寸。

## 禁止配置

业务页面禁止在 `WiseFramework2.mount()` 中出现：

```text
systemName
frameworkAssetBase
frameworkLogoSrc
logoSrc
topTools
appGroups
roles
roleProfiles
```

即使外部页面传入这些字段，框架运行时也会忽略；仓库校验会直接报错。

角色和顶部应用只能修改 `framework-2.staff-preset.js`。

## 禁止覆盖

业务 CSS 只能使用自己的命名空间：

```css
.business-page {}
.business-page__toolbar {}
```

禁止覆盖任何 `.frame2-*` 类，尤其是：

```text
.frame2-topbar
.frame2-brand
.frame2-module-tabs
.frame2-sidebar
.frame2-tabsbar
.frame2-tab
.frame2-content-shell
.frame2-content
```

## 自动校验

```bash
node ui-demo/framework/validate-framework-2.mjs
```

校验内容：

- 是否加载公共角色预设。
- 是否使用统一挂载入口。
- 是否覆盖 `.frame2-*` 样式。
- 是否在页面中重复配置框架字段。
- 内联脚本是否存在语法错误。

## 给其他模型的固定指令

```text
使用 framework/page-template.html 创建业务页面，并将生成结果放入 demos/。
先读取 framework/README.md 和 framework/framework-2.schema.json。
只编写业务内容、activeFeature、appMenus 和 tabs。
禁止定义 systemName、Logo、topTools、appGroups、roles、roleProfiles。
禁止复制框架 DOM，禁止覆盖任何 .frame2-* CSS。
框架会根据 activeFeature 自动匹配角色和顶部应用。
完成后运行 node ui-demo/framework/validate-framework-2.mjs。
```
