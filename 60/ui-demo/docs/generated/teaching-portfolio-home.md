# 教学档案袋首页需求说明

> 场景：`teaching-portfolio-home`　版本：`1.0.0`　由产品世界模型生成，请勿手工维护重复副本。

## 目标

1. 集中查看个人教学档案概况
2. 快速识别待补充的档案内容
3. 进入各类教学档案业务页面

## 用户角色

- 教师（teacher）
- 教学档案管理员（portfolio-manager）

## 当前痛点

1. 档案数据分散，教师难以判断完整度
2. 不同档案入口缺少统一导航

## 场景流程

### 前置条件

1. 教师已登录系统
2. 教师身份已关联人员主数据

### 主流程

1. 系统展示教学档案统计概况
2. 系统展示课程及档案完整度
3. 教师通过菜单进入目标档案页面

### 异常流程

1. 没有档案数据时使用统一空状态组件
2. 统计失败时展示可重试的错误状态

## 页面装配

- 模板：`dashboard`
- 菜单：`teaching-portfolio.major:t-home`
- Demo：`demos/teaching-portfolio/major/t-home/t-home.html`

### 字段

- `Person.personId`
- `Course.courseId`
- `Course.courseCode`
- `Course.name`
- `Course.totalHours`
- `CoursePortfolio.coursePortfolioId`
- `CoursePortfolio.archiveStatus`

### 组件

- `DSCard`
- `DSChartCard`
- `DSDashboardGrid`
- `DSDataTable`
- `DSEmptyState`

## 业务规则

1. 页面字段必须通过 ontology fieldRef 获取定义
2. 页面菜单必须通过 WiseMenuRegistry 获取地址
3. 页面基础控件必须使用设计系统组件

## 验收标准

1. 教师能够查看教学档案概况和完整度
2. 点击菜单能够进入对应档案页面
3. 无数据和加载失败均有明确状态反馈

## 待确认问题

1. 完整度计算口径及各类字段权重需要业务确认
2. 不同角色可见的统计卡片范围需要权限调研
