# @wisedu/hr-domain

60 系统共享的人事领域契约与本地适配层。页面通过稳定的领域对象访问人员、组织、岗位、招聘、进校和事件，不再直接依赖页面私有 Mock 结构。

当前实现使用内存存储，便于原型联调；后端接入时只需实现相同的 repository 接口。

标准实体字段模型通过 `@wisedu/hr-domain/models` 导出，可查询字段元数据并校验完整记录或 PATCH 数据。唯一可编辑字段源位于 `ontology/`，包内 `data/` 目录仅是同步后的运行时产物。

页面表格、表单和详情字段统一通过 `@wisedu/hr-domain/fields` 的 `fieldRef` 调用，不得复制字段定义。

教职工基本信息字段与校标字典通过 `@wisedu/hr-domain/basic-information` 导出。业务可按稳定字段 ID 或旧字段编码查询字段、绑定和字典项，不再复制页面私有下拉数组。

关键约束：

- 正式人员使用不可变 `personId`，工号是 `employeeNumber`。
- 候选人通过录用/报到事件关联人员，不覆盖原候选人记录。
- 高敏字段默认不返回精确值。
- 所有状态变化通过事件记录，事件同时保存发生时间和生效时间。
- 领域 ID 遵循 `ontology/governance/identifier-rules.md`；外部编号通过 `LegacyIdentifier` 映射。
