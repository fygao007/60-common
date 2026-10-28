# 发展规划分析需求说明

> 场景：`teacher-growth-plan-analysis`　版本：`1.0.0`　由产品世界模型生成，请勿手工维护重复副本。

## 目标

1. 从发展规划文档确认规则并生成可追溯分析报表

## 用户角色

- 管理部门（manager）

## 当前痛点

1. 空状态占屏过大
2. 规则编辑区窄屏拥挤
3. 报表与配置层次不清

## 场景流程

### 前置条件

1. 使用已有演示数据快照

### 主流程

1. 选择文档或粘贴正文
2. 识别并确认规则
3. 选择已有统计范围与截止日
4. 生成冻结报表
5. 查看口径与导出报表

### 异常流程

1. 没有数字不补目标值
2. 未知数据不判为不达标
3. 规则变更后标记需重新生成

## 页面装配

- 模板：`dashboard`
- 菜单：`teacher-growth-portfolio.management:mp-plan-analysis`
- Demo：`demos/teacher-growth-portfolio/teacher/mp-plan-analysis/mp-plan-analysis.html`

### 字段

- `Business.teacher-growth.requirementName`
- `Business.teacher-growth.requirementType`
- `Business.teacher-growth.targetOperator`
- `Business.teacher-growth.targetLower`
- `Business.teacher-growth.actualValue`
- `Business.teacher-growth.gapValue`
- `Business.teacher-growth.resultState`
- `Business.teacher-growth.dataCutoff`
- `Business.teacher-growth.scopeDefinition`

### 组件

- `DSDashboardGrid`
- `DSDashboardGridItem`
- `DSCard`
- `DSAlert`
- `DSButton`
- `DSDataTable`
- `DSUpload`
- `DSInput`
- `DSSelect`
- `DSDatePicker`
- `DSTextarea`
- `DSSwitch`
- `DSDrawer`
- `DSTag`
- `DSEmptyState`

## 业务规则

1. 沿用原页面规则提取与冻结报表逻辑
2. 使用 dashboard 网格模板和设计系统卡片，不覆盖组件内部 CSS
3. 只使用已登记字段引用
4. 保留上传仅为演示且不真实解析的说明

## 验收标准

1. 示例正文可提取规则并生成报表
2. 改变规则或范围后报表标记需重新生成
3. 报表口径可查看并导出
4. 宽屏和窄屏组件不重叠

## 待确认问题

1. 真实文件解析、真实 AI 服务、全量人员数据与未登记统计范围仍待实现
2. Business.teacher-growth 字段当前为业务草案，不能视为已确认生产口径
