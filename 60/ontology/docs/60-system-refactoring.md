# 60 系统本体化改造清单

评估基线：人事本体 `0.1.0`  
评估范围：`demos/recruitment`、`demos/staff-info`、`demos/teaching-portfolio`、`demos/teacher-growth-portfolio`、公共框架和设计系统。

## 结论

当前 60 工程已经具备丰富的页面原型和公共组件，但业务数据主要以内嵌数组、页面私有状态和 `recruitment-mock.js` 表达，尚未形成跨应用共享的人事领域模型。改造重点不是重画页面，而是增加统一身份、领域对象、事件、词表、来源和权限层，然后让页面逐步消费这些稳定接口。

## P0：进入联调前必须完成

当前落地状态（2026-08-15）：角色清单断链、共享领域契约基础包和统一 ID 规则已完成；进校应用、存量页面路由迁移与高敏字段治理仍按后续条目推进。

### 1. 修复应用与角色清单断链

涉及：

- `demos/staff-info/app.json`
- `demos/staff-info/hr/role.json`
- `demos/recruitment/app.json`

原现状：`staff-info/app.json` 的 `roles` 为空，但目录中存在完整的 HR 角色菜单；`recruitment/app.json` 声明了 `dean` 角色，却没有可用菜单链路。

为什么要改：本体权限和知识库检索都依赖“应用—角色—组织范围”的完整链路。清单断链会让页面存在但不可治理，也无法计算谁能查看哪些人员数据。

已落地：补齐角色 manifest，并在角色配置中增加稳定 `roleId`、组织范围策略和允许访问的数据分类。未建设页面的招聘院系角色明确标记为 `enabled: false / lifecycle: planned`，避免发布无效入口。`scripts/validate-role-manifests.mjs` 负责阻止清单再次断链。

### 2. 建立统一人员身份服务

涉及：

- `demos/staff-info/hr/info-manage/`
- `demos/staff-info/hr/staff-query/`
- `demos/staff-info/hr/identity-convert/`
- `demos/teaching-portfolio/**/portfolio-detail/`
- `demos/teacher-growth-portfolio/`

现状：页面普遍使用工号、姓名或 `teacher` 查询参数定位人员；详情页以 `record.jzgbh` 拼接 URL。候选人侧又使用独立 `candidateId`。

为什么要改：工号是业务标识，可能在报到完成后才生成，也不能承担跨招聘、教务、科研系统的永久主键。姓名更不能作为身份合并依据。

建议：

- 统一使用不可变 `personId` 作为正式人员主键。
- 工号保存为 `employeeNumber`，并支持历史与生效期。
- 候选人使用 `candidateId`，通过录用/报到事件关联 `personId`。
- 页面路由由 `?teacher=工号` 改为 `?personId=...`，展示时仍可显示工号。

已落地基础：`packages/hr-domain/src/identifiers.js` 实现不可变领域 ID、格式校验和旧系统编号映射；完整治理规则见 `ontology/governance/identifier-rules.md`。存量页面路由迁移仍需按应用分批执行。

### 3. 将候选人转人员建模为显式事件

涉及：

- `demos/recruitment/hr/hiring/`
- `demos/recruitment/hr/process-audit/`
- `demos/recruitment/hr/archive-transfer/`
- `demos/recruitment/shared/recruitment-mock.js`

现状：招聘页面覆盖拟录用、分配工号和档案调转，但没有统一的 `OnboardingCase`、`PersonCreated`、`EmployeeNumberAssigned` 事件及幂等关系。

为什么要改：如果直接把候选人记录复制为教职工，会产生重复人员、材料丢失和状态不一致，无法回答“此人通过哪次招聘进入学校”。

建议：增加 `candidate-conversion` 领域服务，按以下顺序输出事件：

```text
CandidateSelected → OnboardingInitiated → OnboardingCompleted
→ PersonCreated → EmployeeNumberAssigned → AssignmentStarted
```

每个事件携带源记录、操作人、生效时间和证据材料。

### 4. 增加进校报到应用或领域模块

涉及：当前 `demos/` 应用清单中尚无独立进校报到应用。

现状：采购和需求资料要求完整进校流程，但当前 60 主要在招聘页面中停留到拟录用、档案调转或分配工号。

为什么要改：招聘录用不等于正式入职。延期、放弃、三方协议、单位审核、人事终审、合同、一卡通和起薪都属于独立流程与状态。

建议：新增 `demos/onboarding/`，核心对象统一使用 `OnboardingCase`，不要把报到字段继续塞入招聘候选人对象。

### 5. 敏感字段禁止页面裸值和通用导出

涉及重点：

- `demos/staff-info/hr/info-manage/detail/detail.page.jsx`
- `demos/recruitment/hr/process-audit/process-audit.page.jsx`
- `demos/recruitment/hr/resume-info/resume-info.page.jsx`
- `demos/recruitment/hr/monitor/monitor.page.jsx`
- `demos/recruitment/hr/talent-pool/talent-pool.page.jsx`

现状：部分页面直接展示完整身份证号，或将身份证号、联系电话直接拼入文本/CSV；原型中还生成稳定的18位模拟身份证号。

为什么要改：证件号码属于高敏数据，不应进入通用前端状态、日志、URL、全文索引、向量库或无审批导出。

建议：

- API 默认只返回脱敏值和权限标志。
- 精确值使用单独授权接口并记录审计。
- 导出任务执行字段权限、用途校验和水印。
- 示例数据改用明显虚构且不符合真实证件校验的占位符。

### 6. 建立正式领域接口，隔离页面 Mock

涉及：`demos/recruitment/shared/recruitment-mock.js` 以及各业务页内嵌常量。

现状：招聘的大量候选人、计划、岗位和状态由一个大型 mock 文件生成；教职工、教师档案页面又维护各自独立的人员样例。

为什么要改：同一个人的组织、岗位和状态会在不同应用产生不同版本，无法共享、追溯或做知识图谱。

建议建立统一接口：

```text
/domain/persons
/domain/organizations
/domain/positions
/domain/assignments
/domain/recruitment-plans
/domain/recruitment-positions
/domain/candidates
/domain/applications
/domain/onboarding-cases
/domain/events
```

页面 Mock 应实现这些接口的数据契约，而不是让页面直接读取任意对象结构。

## P1：核心业务模型改造

### 7. 分离正式岗位、招聘岗位和岗位编制

涉及：

- `demos/recruitment/hr/position/`
- `demos/recruitment/hr/position-adjust/`
- `demos/recruitment/hr/position-req-dict/`
- `demos/recruitment/hr/plan-manage/`

现状：页面中的“岗位”同时承担岗位字典、招聘需求、招聘人数、申请条件和发布状态。

为什么要改：正式岗位是长期定义；招聘岗位是某批次的需求；岗位编制表达资源和空缺。混在一起会导致每次招聘重复定义岗位，也无法分析实际空缺。

建议：页面表单和接口分别绑定 `Position`、`PositionSlot`、`RecruitmentPosition`，招聘岗位通过 `basedOnPosition` 引用正式岗位。

### 8. 将组织建为带生效期的主数据

涉及所有出现学院、部门、单位、专业、专业群的页面和筛选器。

现状：组织通常是页面数组或字符串选项，教务数据又使用学院代码/名称。

为什么要改：字符串无法表达组织层级、合并撤销、历史归属和数据权限范围。

建议：统一使用 `organizationId + organizationCode + name + type + parent + validPeriod`；业务记录保存组织 ID 和当时名称快照。

### 9. 将身份转换改造为任职/分类事件

涉及：`demos/staff-info/hr/identity-convert/identity-convert.page.jsx`。

现状：“身份转换”容易同时修改人员类别、用人方式、岗位和教师类型。

为什么要改：这些是不同维度，生效日期和审批依据也可能不同。一次覆盖会破坏历史事实。

建议：把操作拆为人员分类变更、任职变更、用人方式变更等事件；页面可以提供统一办理入口，但后端必须产生独立事实。

### 10. 统一业务词表，停止页面私有枚举

涉及招聘种类、人员类别、岗位类别、岗位等级、流程状态、审核状态等所有下拉和标签。

现状：多个 JSX 文件直接声明中文数组，类似概念存在不同写法。

为什么要改：AI、统计和跨系统映射无法判断同义词与不同概念。

建议：新增词表服务，返回 `conceptId`、显示名、有效期、上位概念和映射码；页面只保存 concept ID。当前 `ontology/vocabularies/` 作为第一版依据。

### 11. 当前状态改为事件派生，保留有效期

涉及人员信息、聘岗、合同、招聘流程、报到流程。

现状：大多页面直接修改 `status` 字段，缺少发生时间与业务生效时间的区分。

为什么要改：无法回看历史，也无法正确回答某个日期的任职状态。

建议：写操作产生领域事件；读模型可以继续返回便于页面展示的 `currentStatus`，但必须能追溯到事件。

### 12. 教师档案统一引用人员和任职

涉及：

- `demos/teaching-portfolio/`
- `demos/teacher-growth-portfolio/`

现状：两个档案应用分别维护教师资料、组织、职称、画像和成果数据，存在重复的工作台、档案和画像概念。

为什么要改：教师是 `Person` 在特定任职和人员分类下的角色，不应创建另一套教师主数据。

建议：两个应用统一引用 `personId`、当前 `EmploymentAssignment` 和组织主数据；课程、成果、证据保留各自领域模型。后续再决定两个档案袋的产品边界是否合并。

## P2：知识库和AI准备

### 13. 文档知识库增加条款、有效期和适用范围

涉及首页政策文件、通知、资料下载以及教师档案规则库。

要求：文档切分到章节/条款，并记录发布机构、生效日期、废止日期、适用人员、来源文件和替代关系。向量切片不能脱离这些元数据。

### 14. 规则与指标从页面代码中迁出

涉及资格审查、招聘筛选、教师画像、诊断预警、数据监控。

要求：规则和指标具有 `ruleId/indicatorId`、版本、生效期、输入、输出、政策依据和执行记录。页面只负责展示规则结果和证据链。

### 15. 增加来源与证据组件

涉及人员详情、审核、画像、预警和AI回答。

建议公共设计系统增加“数据来源/更新时间/可信状态/证据材料”展示组件，使用户能区分人事主数据、教务同步、科研同步、个人填报和人工修正。

### 16. 知识检索实施字段级权限

涉及未来全局搜索、人事AI助手和关系图谱。

要求：检索前执行角色、组织范围、字段分级和业务用途过滤。身份证、薪酬、社保、银行卡、家庭关系、工伤和保密人才信息禁止进入通用向量索引。

## 工程整理建议

### 17. 收敛招聘外网版本

现状同时存在 `portal`、`招聘外网1`、`招聘外网2`、`招聘外网3`、多个副本和 `招聘外网4`，`app.json` 当前入口指向 `招聘外网3/index.html`。

风险：字段校验、身份规则和页面内容在多个副本中漂移，后续无法确认哪套页面对应正式数据契约。

建议：保留一个正式源目录和一个归档区；构建产物不与源码并列；清除业务副本中的独立身份校验实现。

### 18. 页面导航改用统一路由对象

现状大量页面通过 `window.location.href` 和相对路径跳转，并把工号、教师代码等业务标识直接拼入 URL。

建议：公共框架提供路由服务，路由参数使用稳定实体 ID；敏感信息不进入 URL；菜单 manifest 声明目标实体类型和页面能力。

### 19. 为本体契约增加自动校验

建议新增构建校验：

- YAML 语法、实体和关系引用完整性。
- 页面不得新增未登记的人员分类、岗位分类和流程状态。
- 高敏字段不得出现在 URL、日志和普通导出定义中。
- app/role/menu manifest 链路完整。
- Mock 数据必须符合领域契约并标记为虚构。

## 推荐实施顺序

1. 修复角色 manifest，建立 `personId/organizationId/positionId` 标识规范。
2. 定义领域接口与统一词表，让现有 Mock 先适配接口。
3. 改造招聘计划、招聘岗位、候选人和应聘申请。
4. 新增进校报到模块和候选人转人员事件链。
5. 改造教职工信息与任职历史。
6. 让两个教师档案应用统一引用人员、组织和任职主数据。
7. 接入政策条款知识库、规则指标和受控AI问答。

## 需要校方确认的决策

- 人员永久主键由哪个系统生成，工号是否允许变更或重用。
- 组织机构的权威数据源、编码和历史变更处理方式。
- 岗位、岗位编制、岗位类别和等级的正式字典。
- 候选人跨批次重复识别及录用转人员规则。
- 主要任职、兼任、挂职、借调的并存规则。
- 各角色的组织范围、字段权限和敏感数据使用目的。
