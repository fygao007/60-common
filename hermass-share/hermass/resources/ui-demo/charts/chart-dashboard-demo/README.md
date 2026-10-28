# 图表规范演示页

本页面是教学档案袋 / 高校人事系统的**图表规范演示**，展示统一风格的图表卡片组件体系。

## 卡片清单

### 原有示例（来自 design-system）

| 卡片 | 类型 | 规范组件 | 说明 |
|---|---|---|---|
| KPI 统计卡 | 业务卡 | `KpiCard`（演示页自定义） | 顶部统计数字网格 |
| 彩色统计卡 | 图表卡 | `DSColorStatCard` | 多指标彩色统计 |
| 核心图表类型 | 图表卡 | `DSChartCard` + `DSDashboardGrid` | 环形/柱状/折线/雷达等 |
| 引导线环形图 | 图表卡 | `DSChartCard` | 带引导线标签的占比 |
| 柱状图与折线图 | 图表卡 | `DSChartCard` | 竖向柱状 + 多折线 |
| 表格形式统计 | 图表卡 | `DSTableStatCard` | 表格统计汇总 |
| 条形占比统计 | 图表卡 | `DSSegmentBarCard` | 分段占比条 |

### 教师首页卡片示例（从 teacher/t-home 复制）

| 卡片 | 类型 | 规范组件 | 演示页命名 | 说明 |
|---|---|---|---|---|
| 待办卡 | 业务卡 | 无（DSCard + th-demo-todo） | TodoAlertCard | 渐变背景通栏提醒 |
| 个人信息卡 | 业务卡 | 无（DSCard + th-demo-profile） | ProfileCard | 头像 + 姓名 + 标签 |
| 业绩纵览 | 图表卡 | `DSColorStatCard` | PerformanceStatsCard | 6 指标大数字网格 |
| 教学建设成果 | 图表卡 | `DSDashboardGrid` + `DSChartCard` | TeachingAchievementDashboard | 3 列图表看板 |
| 学期课程 | 业务卡 | 无（DSCard + th-demo-courses） | SemesterCoursesCard | 课程表格 |
| 档案完整度 | 图表卡 | `DSSegmentBarCard` | PortfolioCompletenessCard | 环形图 + 进度条列表 |

## 使用建议

- **业务卡**：无对应规范组件，保留 DSCard + 自定义 CSS（如待办/个人信息/课程表）
- **图表卡**：应使用 design-system 的规范组件（`DSChartCard`、`DSColorStatCard`、`DSSegmentBarCard` 等），避免手写 ECharts 配置

## legacy 目录

`legacy/` 目录存放被替换的历史实现：

- `legacy/kpi-card.jsx` — 原 KPI 统计卡组件
- `legacy/kpi-card.css` — 原 KPI 统计卡样式

未来其他被替换的示例也会移入此目录，作为"孤儿文档"保留参考。

## 文件结构

```
chart-dashboard-demo/
├── legacy/
│   ├── kpi-card.jsx
│   └── kpi-card.css
├── README.md
├── chart-dashboard-demo.css
├── chart-dashboard-demo.html
└── chart-dashboard-demo.page.jsx
```

## 运行方式

```bash
cd /Users/gaofeiyang/claude工程/项目/60系统/ui-demo
npm run build:previews
npm run validate
```

页面入口：`demos/chart-dashboard-demo.html`