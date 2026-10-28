# 教学档案领域视图

教学档案的权威实体字段定义位于 `ontology/model-library/entity-field-models.json`。`packages/hr-domain/` 只是运行时调用层。本目录只定义档案袋如何编排和展示这些实体，不重新声明字段类型、字典或语义。

`portfolio-view.json` 中的 `entityType` 和 `fieldRefs` 必须引用实体模型库；人员摘要字段继续引用 `StaffBasicInformation.*`。目录名称、展示类型、显隐和排序属于产品视图配置，不属于领域数据模型。

## 权威字段源（4.0 分组及字典）

`portfolio-spec-4.0.json` 将业务侧《教师档案袋_分组及字典-4.0.xlsx》（49 个 sheet）的分组结构与字段清单原样并入本体，作为 teaching-portfolio 域字段定义的**权威业务来源**。该 xlsx 只提供字段清单与「字典」标记，**不含字典取值、不含字段编码、不含必填标记**；并入本体的具体实体字段与取值需据此在 `model-library/entity-field-models.json` 中新增/补全，并从来源系统回填字典值。

首页统计图表（业绩纵览、课程建设、指导学生、教研学术、档案完整度等）的字段覆盖判定应优先参照此文件，再对照 `mappings/rsjxdad-table-mappings.yaml` 与 `mappings/jzg-standard-model-mappings.yaml`。

主要边界：

- `EmploymentAssignment` 表示校内正式任职；`ProfessionalAppointment` 只表示校外或行业专业任职。
- `Course` 是课程主数据；`TeachingAssignment` 是某教师某学期的授课事实；`CoursePortfolio` 是该授课任务形成的档案。
- `PortfolioSubmission` 表示一次提交；`PortfolioReview` 是只追加、不覆盖的审核决定。
- 学历、职称、教师资格等人员摘要继续复用 `StaffBasicInformation`，不在教学档案领域重复定义。
