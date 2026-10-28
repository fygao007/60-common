# 基本信息字段—字典分析矩阵

版本：1.0.0

## 汇总

- 基本信息字段：158 个。
- 选择类字段：77 个，其中确定绑定 59 个、外部主数据 7 个、待确认 11 个。
- SQL 字典：145 套，原始 6592 行，归一后 6583 个唯一代码值。

## 全部选择字段绑定

| 原字段 | 字段名称 | 分组 | 状态 | 字典或主数据 |
|---|---|---|---|---|
| XBDM | 性别 | 01基本信息 | bound | RS.ZXBZ.XB |
| CSDDM | 出生地 | 01基本信息 | external-master-data | AdministrativeDivision |
| JGDM | 籍贯 | 01基本信息 | external-master-data | AdministrativeDivision |
| GJDQDM | 国家地区 | 01基本信息 | bound | RS.ZXBZ.GJDQ |
| MZDM | 民族 | 01基本信息 | bound | RS.ZXBZ.MZ |
| ZJLX | 证件类型 | 01基本信息 | bound | RS.ZXBZ.SFZJLX |
| GATQDM | 港澳台侨 | 01基本信息 | bound | RS.ZXBZ.GATQW |
| JKZKDM | 健康状况 | 01基本信息 | bound | RS.ZXBZ.JKZK |
| HYZKDM | 婚姻状况 | 01基本信息 | bound | RS.ZXBZ.HYZK |
| HKXZ | 户口性质 | 01基本信息 | bound | RS.ZXBZ.HKXZ |
| XYJG | 学缘结构 | 01基本信息 | bound | RS.ZXBZ.XYJG |
| SFCYLK | 是否持有绿卡 | 01基本信息 | bound | RS.ZXBZ.SFBZ |
| LKGB | 绿卡国别 | 01基本信息 | bound | RS.ZXBZ.GJDQ |
| SFBXBY | 是否本校毕业 | 01基本信息 | bound | RS.ZXBZ.SFBZ |
| HWJL | 海外经历 | 01基本信息 | bound | RS.ZXBZ.HWJL |
| SZDWDM | 所在单位 | 02人事信息 | external-master-data | Organization |
| BZLBDM | 编制类别 | 02人事信息 | bound | RS.ZXBZ.BZLX |
| HTQDQK | 合同签订情况 | 02人事信息 | bound | RS.ZXBZ.HTQDQK |
| JZGLBDM | 教职工类别 | 02人事信息 | bound | RS.ZXBZ.JZGLB |
| PRLBDM | 聘任类别 | 02人事信息 | bound | RS.ZXBZ.PRQK |
| YRFSDM | 用人方式 | 02人事信息 | bound | RS.ZXBZ.YRFS |
| GRSFDM | 个人身份 | 02人事信息 | bound | RS.ZXBZ.GRSF |
| DQZTDM | 当前状态 | 02人事信息 | bound | RS.ZXBZ.JZGDQZT |
| JSLX | 教师类型 | 02人事信息 | bound | RS.ZXBZ.JSLX |
| FHGWYQDSXZY | 符合岗位要求的所学专业 | 02人事信息 | bound | RS.ZXBZ.ZY |
| JZGLYDM | 教职工来源 | 03进出校信息 | bound | RS.ZXBZ.JZGLY |
| ZZMMDM | 政治面貌 | 04政治面貌 | bound | RS.ZXBZ.ZZMM |
| DEDPDM | 第二党派 | 04政治面貌 | bound | RS.ZXBZ.ZZMM |
| ZGXLDM | 最高学历 | 05最高学历学位信息 | bound | RS.ZXBZ.XL |
| ZGXWDM | 最高学位 | 05最高学历学位信息 | bound | RS.ZXBZ.XW |
| ZYJSZWDM | 专业技术职务 | 06专业技术职务信息 | bound | RS.ZXBZ.ZYJSZW |
| ZYJSZWJBDM | 专业技术职务级别 | 06专业技术职务信息 | bound | RS.ZXBZ.GBZWJB |
| PRZYJSZWDM | 现聘专业技术职务 | 07岗位职务信息 | bound | RS.ZXBZ.ZYJSZW |
| PRZYJSZWJBDM | 聘任专业技术职务级别 | 07岗位职务信息 | bound | RS.ZXBZ.GBZWJB |
| ZYGWDM | 主要岗位 | 07岗位职务信息 | bound | RS.ZXBZ.ZYGW |
| XPGWDM | 校内岗位 | 07岗位职务信息 | bound | RS.ZXBZ.XPGW |
| GLGW | 是否管理岗位 | 07岗位职务信息 | bound | RS.ZXBZ.SFBZ |
| ZYJSGW | 是否专技岗位 | 07岗位职务信息 | bound | RS.ZXBZ.SFBZ |
| GQGW | 是否工勤岗位 | 07岗位职务信息 | bound | RS.ZXBZ.SFBZ |
| ZYJSGWLBDM | 专业技术岗位类别 | 07岗位职务信息 | bound | RS.ZXBZ.GWLB |
| ZYJSGWLBDJDM | 专业技术岗位等级 | 07岗位职务信息 | bound | RS.ZXBZ.GWDJ |
| GLGWDJDM | 管理岗位等级 | 07岗位职务信息 | bound | RS.ZXBZ.GWDJ |
| GQGWDJDM | 工勤岗位等级 | 07岗位职务信息 | bound | RS.ZXBZ.GWDJ |
| SFSJT | 是否双肩挑 | 07岗位职务信息 | bound | RS.ZXBZ.SFBZ |
| SJTSZDWDM | 双肩挑所在单位 | 07岗位职务信息 | external-master-data | Organization |
| FDYLBDM | 辅导员类别 | 07岗位职务信息 | bound | RS.ZXBZ.FDYLB |
| GRJSGZDM | 工人技术工种 | 08工人技术信息 | review-required | — |
| GRJSDJDM | 工人技术等级 | 08工人技术信息 | review-required | — |
| DZZWJBDM | 党政职务级别 | 09党政职务职级信息 | bound | RS.ZXBZ.GBZWJB |
| XKLBDM | 学科类别 | 10资质信息 | external-master-data | Discipline |
| YJXKDM | 一级学科 | 10资质信息 | external-master-data | Discipline |
| EJXKDM | 二级学科 | 10资质信息 | external-master-data | Discipline |
| SFZZCSXLZXGZ | 是否专职从事心理咨询工作 | 10资质信息 | bound | RS.ZXBZ.SFBZ |
| SFCYXLZXZGZS | 是否持有心理咨询资格证书 | 10资质信息 | bound | RS.ZXBZ.SFBZ |
| SFJBZYJNDJZS | 是否具备职业技能等级证书 | 10资质信息 | bound | RS.ZXBZ.SFBZ |
| JSJSP | 计算机水平 | 10资质信息 | review-required | — |
| YYSP | 英语水平 | 10资质信息 | review-required | — |
| SFSSXJS | 是否双师型教师 | 11双师信息 | bound | RS.ZXBZ.SFBZ |
| QYGZSC | 企业工作(实践)时长 | 11双师信息 | bound | RS.ZXBZ.QYGZSC |
| SSRDJB | 双师认定级别 | 11双师信息 | bound | RS.ZXBZ.SSRDJB |
| DSLBDM | 导师类别 | 12导师信息 | bound | RS.ZXBZ.DSLB |
| ZXTFGZLBDM | 执行统发工资类别 | 13薪酬信息 | review-required | — |
| ZXTFGZJBDM | 执行统发工资级别 | 13薪酬信息 | review-required | — |
| ZXXJGZJBDM | 薪级 | 13薪酬信息 | bound | RS.ZXBZ.XJGZBZMX |
| ZXJCXJXLBDM | 执行基础性绩效类别 | 13薪酬信息 | review-required | — |
| ZXJCXJXJBDM | 执行基础性绩效级别 | 13薪酬信息 | review-required | — |
| XXDM | 血型 | 16其他信息 | bound | RS.ZXBZ.XX |
| SFWBKSSK | 是否为本科生上课 | 16其他信息 | bound | RS.ZXBZ.SFBZ |
| DYXLDM | 第一学历 | 16其他信息 | bound | RS.ZXBZ.XL |
| DYXWDM | 第一学位 | 16其他信息 | bound | RS.ZXBZ.XW |
| SFZZ | 在职状态 | 16其他信息 | review-required | — |
| ZCDM | 职称 | 16其他信息 | bound | RS.ZXBZ.ZYJSZW |
| RSZZZT | 人事在职状态 | 16其他信息 | review-required | — |
| QYZT | 启用状态 | 16其他信息 | bound | RS.ZXBZ.SFBZ |
| GYDJ | 雇员等级 | 16其他信息 | review-required | — |
| SFDYY | 是否调研员 | 16其他信息 | bound | RS.ZXBZ.SFBZ |
| SFCYRY | 是否产业人员 | 16其他信息 | bound | RS.ZXBZ.SFBZ |

## SQL 同码异义

| 字典 | 代码 | 冲突含义（源 ID:名称） |
|---|---|---|
| RS.ZXBZ.CGLY | 13 | 13333:教育部人文社科项目；13:与港、澳、台合作研究项目 |
| RS.ZXBZ.CGLY | 14 | 14333:国家自然科学基金项目；14:企事业单位委托项目 |
| RS.ZXBZ.CGLY | 15 | 15333:中央其它部门社科专门项目；15:外资项目 |
| RS.ZXBZ.CGLY | 16 | 16333:高校古籍整理研究项目；16:学校社科项目 |
| RS.ZXBZ.QDFS | 1 | 3:预订；4:购置 |
| RS.ZXBZ.QDFS | 9 | 17:赠送；16:其他 |

状态说明：`bound` 可直接引用；`external-master-data` 必须调用对应主数据；`review-required` 需要业务确认，禁止猜测绑定。
