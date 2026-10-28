# 统一人员与领域标识规则

规则版本：`1.0.0`

## 核心规则

1. `personId` 是人员主体的永久技术主键，一经创建不得修改、复用或由工号推导。
2. `candidateId` 与 `personId` 分离。候选人完成报到后新建人员，通过事件和关联字段建立映射，候选人记录不得被覆盖。
3. `employeeNumber` 是可展示、可变更的业务编号，不是主键。编号变更必须保留历史有效期；离职后不得把原编号映射给另一 `personId`。
4. 姓名、身份证号、手机号、邮箱不得作为领域主键，也不得出现在 URL 主定位参数中。
5. 所有领域 ID 由可信服务随机生成，格式为 `<类型前缀>_<UUID>`；客户端可暂存但不能自行按业务字段拼接。
6. 外部系统编号存入 `LegacyIdentifier` 映射，记录来源系统、字段、值和有效期，不改变领域主键。
7. 合并重复人员时保留主 `personId`，被合并 ID 写入重定向/合并记录；禁止原地改号。

## 前缀

| 字段 | 前缀 |
|---|---|
| `personId` | `per` |
| `candidateId` | `can` |
| `organizationId` | `org` |
| `positionId` | `pos` |
| `slotId` | `slot` |
| `assignmentId` | `asg` |
| `recruitmentPlanId` | `rpl` |
| `recruitmentPositionId` | `rps` |
| `applicationId` | `app` |
| `onboardingCaseId` | `onb` |
| `contractId` | `con` |
| `eventId` | `evt` |

示例：`per_018f6f52-4d7e-7b28-9b6a-b9f4353f58f2`。

## 人员创建边界

- 招聘报名时只创建 `Candidate`。
- 拟录用和报到流程仍以 `candidateId`、`applicationId`、`onboardingCaseId` 关联。
- 仅在报到完成且完成防重校验后创建 `Person`，随后分配 `employeeNumber` 和 `EmploymentAssignment`。
- 防重校验使用受控的证件指纹或主数据匹配服务，不向通用页面暴露证件原值。

实现参考：`packages/hr-domain/src/identifiers.js`。
