/**
 * 数据采集批次（教师端）唯一数据源
 * 列表页（t-data-collect）与批次详情页（t-data-detail）共用。
 * groups: 该批次需要采集的分组（basic=基本信息；其余为 5 维指标维度；timeline=成长轨迹）
 */
export const COLLECTION_BATCHES = [
  {
    id: 'B2026-01',
    name: '2026 年春季学期业绩数据采集',
    type: '业绩数据',
    deadline: '2026-07-15',
    scope: '全体专任教师',
    status: 'filling',
    progress: { filled: 12, total: 18 },
    groups: ['basic', 'ethics', 'teaching', 'research', 'development', 'contribution', 'timeline'],
    publishedAt: '2026-06-01',
  },
  {
    id: 'B2026-02',
    name: '企业实践经历专项更新',
    type: '企业实践',
    deadline: '2026-07-20',
    scope: '双师型教师',
    status: 'filling',
    progress: { filled: 5, total: 8 },
    groups: ['basic', 'development'],
    publishedAt: '2026-06-05',
  },
  {
    id: 'B2026-03',
    name: '教学成果奖申报材料采集',
    type: '教学成果',
    deadline: '2026-07-31',
    scope: '全体教师',
    status: 'pending',
    progress: { filled: 0, total: 10 },
    groups: ['basic', 'teaching'],
    publishedAt: '2026-06-10',
  },
  {
    id: 'B2026-04',
    name: '2025 年度科研数据补录',
    type: '科研成果',
    deadline: '2026-06-30',
    scope: '全体教师',
    status: 'submitted',
    progress: { filled: 18, total: 18 },
    groups: ['basic', 'research', 'timeline'],
    publishedAt: '2026-05-20',
  },
]

// 批次状态（圆点 + 文字，tone 为 StatusDot 标准色组）
export const BATCH_STATUS = {
  pending: { label: '待开始', tone: 'neutral' },
  filling: { label: '填报中', tone: 'process' },
  submitted: { label: '已提交', tone: 'done' },
  approved: { label: '已通过', tone: 'done' },
  rejected: { label: '已退回', tone: 'warn' },
}
