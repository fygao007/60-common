# Anchor / 锚点

MasterGo 设计来源：

```text
mastergo://getd2c/139272150501659-4096-83194
```

## 用途

`DSAnchor` 用于长页面目录导航、详情章节定位、复杂表单分组跳转和帮助文档目录。

## 结构

- 容器：`.ds-anchor`
- 列表：`.ds-anchor__list`
- 项：`.ds-anchor__item`
- 链接：`.ds-anchor__link`

## 状态

- 默认：次级文字色。
- Hover：正文文字色，浅灰背景。
- Active：主色文字、浅主色背景、加粗。
- Disabled：禁用文字色，不可点击。
- Bordered：显示竖向基线；Active 显示空心主色圆点和连接短线，文字使用主色浅底并加粗；层级项逐级缩进。
- Offset：用于贴合侧栏目录的紧凑布局；无外框和容器底色，一级缩进 `16px`、二级再缩进 `16px`，行高 `34px`、间距 `4px`。与 Bordered 组合时，选中态只显示对齐竖线的 `8px` 圆点，不显示连接短线。
- Right：右侧显示竖向基线，空心圆点和连接短线靠右，文本右对齐。
- 垂直 Bordered 锚点支持 `--ds-anchor-rail-inset`、`--ds-anchor-label-indent`、`--ds-anchor-indent`、`--ds-anchor-marker-size` 和 `--ds-anchor-connector-length` CSS 自定义属性，用于适配容器留白与层级间距。

## React 用法

```jsx
<DSAnchor
  activeKey="overview"
  bordered
  placement="right"
  items={[
    { key: 'overview', href: '#overview', title: '组件概览' },
    {
      key: 'usage',
      href: '#usage',
      title: '使用方式',
      children: [
        { key: 'basic', href: '#basic', title: '基础锚点' },
        { key: 'horizontal', href: '#horizontal', title: '横向锚点' },
      ],
    },
  ]}
/>
```

## HTML 预览用法

```html
<link rel="stylesheet" href="./packages/design-system/src/Anchor/index.css" />

<nav class="ds-anchor ds-anchor--bordered ds-anchor--right" aria-label="锚点导航">
  <ol class="ds-anchor__list">
    <li class="ds-anchor__item is-active" style="--ds-anchor-depth: 0">
      <a class="ds-anchor__link" href="#overview"><span>组件概览</span></a>
    </li>
  </ol>
</nav>
```

预览页：`ui-demo/components/anchor-components.html`。
