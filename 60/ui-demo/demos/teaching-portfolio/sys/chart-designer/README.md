# 图表设计器（仪表盘式）

后台可视化设计器，通过**拖拽**组合多个图表到一个**仪表盘容器**，导出的配置可直接被业务页面消费。

## 功能特性

- **左栏 · 图表类型库**：10 种图表缩略图，支持拖拽到画布或双击添加
- **中栏 · 容器画布**：基于 `DSDashboardGrid` 的多图表容器，可选中、删除、重排
- **右栏 · 属性编辑**：选中图表后编辑其配置，即时生效
- **导出配置**：导出 `charts` 数组，业务页面可直接配合 `DSChartCard` 使用

## 支持的图表类型

直接对齐 `buildChartOption` 的 10 种 type：

| 分组 | 类型 | type 值 | 默认尺寸 |
|---|---|---|---|
| 占比类 | 环形图 | `donut` | small |
| 占比类 | 引导线环形图 | `donutCallout` | wide |
| 占比类 | 饼状图 | `pie` | small |
| 占比类 | 进度环 | `progressRing` | mini |
| 对比类 | 横向柱状图 | `barHorizontal` | small |
| 对比类 | 竖向柱状图 | `barVertical` | medium |
| 对比类 | 排名柱状图 | `rankBar` | medium |
| 趋势类 | 折线图 | `line` | medium |
| 趋势类 | 面积折线图 | `areaLine` | wide |
| 画像类 | 雷达图 | `radar` | medium |

## 交互方式

1. **添加图表**：从左栏拖拽图表类型到中栏画布，或双击类型卡片
2. **选中编辑**：点击画布中的图表，右栏显示属性面板
3. **编辑属性**：右栏修改标题、尺寸、数据等，画布实时更新
4. **调整位置**：在画布内拖拽图表卡片重排顺序
5. **删除图表**：选中后点击右上角删除按钮，或在右栏点击删除
6. **导出配置**：点击"导出配置"，可复制 / 下载 JSON

## 导出格式

导出的 JSON 结构：

```json
{
  "version": 1,
  "charts": [
    {
      "id": "chart-xxx",
      "title": "职称结构",
      "type": "donut",
      "size": "small",
      "total": 100,
      "unit": "人",
      "palette": "mixed",
      "data": [
        { "name": "类别A", "value": 40 },
        { "name": "类别B", "value": 30 }
      ],
      "insight": "数据洞察说明"
    }
  ]
}
```

## 业务页面集成

导出的 `charts` 数组可直接用于业务页面：

```jsx
import { DSChartCard, DSDashboardGrid, DSDashboardGridItem } from '@wisedu/design-system'

const chartConfigs = [...exportedConfig.charts]

function Dashboard() {
  return (
    <DSDashboardGrid columns={6} gap={20}>
      {chartConfigs.map(config => (
        <DSDashboardGridItem key={config.id} size={config.size}>
          <DSChartCard {...config} />
        </DSDashboardGridItem>
      ))}
    </DSDashboardGrid>
  )
}
```

## 图表配置字段说明

每个图表的配置字段与 `buildChartOption` 接口一致：

| 字段 | 适用类型 | 说明 |
|---|---|---|
| `title` | 所有 | 图表标题 |
| `type` | 所有 | 图表类型（10 种之一）|
| `size` | 所有 | 网格尺寸：mini/small/medium/wide/full |
| `palette` | 所有 | 色板：mixed/blue/cyan/yellow/purple/orange/green/red |
| `data` | 所有 | 数据数组（格式因类型而异）|
| `unit` | 除 progressRing 外 | 数值单位 |
| `total` | donut/donutCallout/pie | 环心/总数显示 |
| `xAxisData` | line/areaLine/barVertical | X 轴数据（字符串数组）|
| `indicators` | radar | 维度定义：`[{name, max}]` |
| `top` | rankBar | 显示前 N 名 |
| `insight` | 所有 | 洞察说明（可选）|

**各类型 data 格式**：

```javascript
// donut / pie / donutCallout / barHorizontal / rankBar
data: [{ name: '类别A', value: 40 }, { name: '类别B', value: 30 }]

// line / areaLine / barVertical
data: [{ name: '系列A', values: [12, 18, 24, 32, 45] }]

// radar
data: [{ name: '画像A', values: [80, 60, 90, 70, 85] }]

// progressRing
data: [{ value: 78 }]
```

## 目录结构

```
chart-designer/
├── chart-designer.html      # HTML 入口
├── chart-designer.css       # 三栏布局样式
├── chart-designer.page.jsx  # React 主组件
├── menu.json                # 菜单配置
└── README.md                # 本文档
```

## 运行方式

```bash
# 在 ui-demo 目录下
npm run build:previews   # 构建业务页 bundle
npm run validate         # 完整验证
```

页面入口：`chart-designer.html`