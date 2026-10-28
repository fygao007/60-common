/**
 * 图表设计器（仪表盘式 · 支持容器分组）
 * - 左栏：图表类型库 + 容器列表
 * - 中栏：多个容器垂直堆叠，每个容器内放多个图表
 * - 右栏：选中容器/图表的属性编辑
 *
 * 数据模型：containers[] → (layout='single' | 'tabs') → charts[]
 * 导出格式：{ version: 4, charts, containers }
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSIconButton,
  DSInput,
  DSSwitch,
  DSSelect,
  DSModal,
  DSChartCard,
  DSDashboardGrid,
  DSTextarea,
  DSTabs,
  DSSegmentBarCard,
  DSColorStatCard,
} from '@wisedu/design-system'
import './chart-designer.css'

/* ═══════════════ 常量 ═══════════════ */

const CHART_TYPE_META = [
  { type: 'profileCard', name: '档案信息卡', group: '统计卡', size: 'medium', desc: '照片+姓名+基本信息的档案卡' },
  { type: 'basicInfo', name: '统计卡片', group: '统计卡', size: 'small', desc: '单个彩色统计卡片，支持图标与对比分析' },
  { type: 'segmentBar', name: '条形占比图', group: '统计卡', size: 'full', desc: '分段占比统计' },
  { type: 'donut', name: '环形图', group: '占比类', size: 'small', desc: '分类占比，环心显示总数' },
  { type: 'donutCallout', name: '引导线环形图', group: '占比类', size: 'wide', desc: '带引导线标签的占比' },
  { type: 'pie', name: '饼状图', group: '占比类', size: 'small', desc: '实心分类占比' },
  { type: 'pieCallout', name: '引导线扇形图', group: '占比类', size: 'wide', desc: '实心饼图+短引导线标签' },
  { type: 'progressRing', name: '进度环', group: '占比类', size: 'mini', desc: '完成度展示' },
  { type: 'barHorizontal', name: '横向柱状图', group: '对比类', size: 'small', desc: '横向对比' },
  { type: 'barVertical', name: '竖向柱状图', group: '对比类', size: 'medium', desc: '纵向对比' },
  { type: 'rankBar', name: '排名柱状图', group: '对比类', size: 'medium', desc: 'TOP 排名对比，带名次' },
  { type: 'line', name: '折线图', group: '趋势类', size: 'medium', desc: '趋势分析' },
  { type: 'areaLine', name: '面积折线图', group: '趋势类', size: 'wide', desc: '重点趋势展示' },
  { type: 'radar', name: '雷达图', group: '画像类', size: 'medium', desc: '多维度画像' },
]

const SIZE_OPTIONS = ['mini', 'small', 'medium', 'wide', 'full']
const SIZE_SPAN = { mini: 1, small: 2, medium: 3, wide: 4, full: 6 }

// 各图表类型的最小列跨度（基于 6 列网格）。只设最小宽度，不限制最大宽度。
const CHART_SIZE_LIMITS = {
  profileCard: { min: 2 },
  basicInfo: { min: 3 },
  segmentBar: { min: 4 },
  donut: { min: 2 },
  donutCallout: { min: 3 },
  pie: { min: 2 },
  pieCallout: { min: 3 },
  progressRing: { min: 1 },
  barHorizontal: { min: 2 },
  barVertical: { min: 2 },
  rankBar: { min: 3 },
  line: { min: 3 },
  areaLine: { min: 3 },
  radar: { min: 3 },
}

// 统计卡色系
const STAT_COLOR_OPTIONS = ['purple', 'cyan', 'blue', 'green', 'deepPurple', 'pink', 'orange']
// 统计卡图标预设
const STAT_ICON_OPTIONS = ['project', 'award', 'person', 'chart', 'book', 'money', 'time']
// 统计卡图标位置
const STAT_ICON_POSITIONS = [
  { label: '标题前', value: 'before-title' },
  { label: '卡片右下', value: 'bottom-right' },
]
// 条形占比语义色
const SEGMENT_STATUS_OPTIONS = ['excellent', 'good', 'attention', 'risk']
// 筛选：字段类型与时间粒度
const FILTER_TYPE_OPTIONS = [
  { label: '选择字段', value: 'select' },
  { label: '时间筛选', value: 'time' },
]
const FILTER_TIME_GRAINS = ['按年', '按学期', '按月', '按日']
const GRID_COLUMNS = 6

// 统一获取 chart 的列跨度：优先用 span 字段，回退到 size 映射
function getChartSpan(chart) {
  const limits = CHART_SIZE_LIMITS[chart.type] || { min: 1 }
  if (typeof chart.span === 'number') {
    return Math.max(limits.min, Math.min(GRID_COLUMNS, chart.span))
  }
  return Math.max(limits.min, Math.min(GRID_COLUMNS, SIZE_SPAN[chart.size] || 3))
}

// span → size（5 档枚举里没有 5，就近取 wide）
const SPAN_TO_SIZE = { 1: 'mini', 2: 'small', 3: 'medium', 4: 'wide', 5: 'wide', 6: 'full' }
function spanToSize(span) {
  return SPAN_TO_SIZE[span] || 'medium'
}

const THUMBNAIL_ICONS = {
  profileCard: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.7" /><rect x="4" y="22" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.5" /><rect x="4" y="27" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" /><rect x="22" y="6" width="14" height="28" rx="2" fill="currentColor" opacity="0.15" /><rect x="24" y="10" width="10" height="2" rx="1" fill="currentColor" opacity="0.4" /><rect x="24" y="14" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" /><rect x="24" y="18" width="10" height="2" rx="1" fill="currentColor" opacity="0.4" /><rect x="24" y="22" width="6" height="2" rx="1" fill="currentColor" opacity="0.3" /></svg>,
  basicInfo: <svg viewBox="0 0 40 40" className="thumb-svg"><rect x="4" y="8" width="14" height="10" rx="2" fill="currentColor" opacity="0.8" /><rect x="22" y="8" width="14" height="10" rx="2" fill="currentColor" opacity="0.5" /><rect x="4" y="22" width="14" height="10" rx="2" fill="currentColor" opacity="0.6" /><rect x="22" y="22" width="14" height="10" rx="2" fill="currentColor" opacity="0.4" /></svg>,
  segmentBar: <svg viewBox="0 0 40 40" className="thumb-svg"><rect x="4" y="14" width="22" height="6" rx="2" fill="currentColor" opacity="0.8" /><rect x="26" y="14" width="6" height="6" rx="2" fill="currentColor" opacity="0.6" /><rect x="32" y="14" width="4" height="6" rx="2" fill="currentColor" opacity="0.4" /><rect x="4" y="24" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.2" /></svg>,
  donut: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="44 88" /><circle cx="20" cy="20" r="6" fill="currentColor" /></svg>,
  donutCallout: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="18" cy="22" r="12" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="30 45" /><line x1="26" y1="14" x2="34" y2="8" stroke="currentColor" strokeWidth="1.5" /></svg>,
  pie: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" /><path d="M20,20 L20,6 A14,14 0 0,1 33,20 Z" fill="currentColor" opacity="0.7" /><path d="M20,20 L33,20 A14,14 0 0,1 25,33 Z" fill="currentColor" opacity="0.4" /></svg>,
  pieCallout: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="16" cy="22" r="11" fill="currentColor" opacity="0.25" /><path d="M16,22 L16,11 A11,11 0 0,1 26.67,19.28 Z" fill="currentColor" opacity="0.7" /><path d="M16,22 L26.67,19.28 A11,11 0 0,1 22.52,31.46 Z" fill="currentColor" opacity="0.45" /><line x1="26" y1="17" x2="34" y2="11" stroke="currentColor" strokeWidth="1.2" /><line x1="25" y1="29" x2="33" y2="30" stroke="currentColor" strokeWidth="1.2" /></svg>,
  progressRing: <svg viewBox="0 0 40 40" className="thumb-svg"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.2" /><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="66 88" transform="rotate(-90 20 20)" /></svg>,
  barHorizontal: <svg viewBox="0 0 40 40" className="thumb-svg"><rect x="4" y="8" width="24" height="6" rx="3" fill="currentColor" /><rect x="4" y="17" width="32" height="6" rx="3" fill="currentColor" opacity="0.7" /><rect x="4" y="26" width="16" height="6" rx="3" fill="currentColor" opacity="0.4" /></svg>,
  barVertical: <svg viewBox="0 0 40 40" className="thumb-svg"><rect x="6" y="20" width="6" height="16" rx="3" fill="currentColor" /><rect x="17" y="14" width="6" height="22" rx="3" fill="currentColor" opacity="0.7" /><rect x="28" y="24" width="6" height="12" rx="3" fill="currentColor" opacity="0.4" /></svg>,
  rankBar: <svg viewBox="0 0 40 40" className="thumb-svg"><rect x="8" y="7" width="26" height="5" rx="2.5" fill="currentColor" opacity="0.4" /><rect x="8" y="15" width="22" height="5" rx="2.5" fill="currentColor" opacity="0.6" /><rect x="8" y="23" width="18" height="5" rx="2.5" fill="currentColor" opacity="0.8" /><rect x="8" y="31" width="13" height="5" rx="2.5" fill="currentColor" /></svg>,
  line: <svg viewBox="0 0 40 40" className="thumb-svg"><polyline points="6,30 14,20 22,24 30,10 36,14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="30" r="2" fill="currentColor" /><circle cx="22" cy="24" r="2" fill="currentColor" /><circle cx="36" cy="14" r="2" fill="currentColor" /></svg>,
  areaLine: <svg viewBox="0 0 40 40" className="thumb-svg"><polygon points="6,30 14,20 22,24 30,10 36,14 36,36 6,36" fill="currentColor" opacity="0.2" /><polyline points="6,30 14,20 22,24 30,10 36,14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  radar: <svg viewBox="0 0 40 40" className="thumb-svg"><polygon points="20,6 32,14 28,30 12,30 8,14" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" /><polygon points="20,11 28,16 25,26 15,26 12,16" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" /></svg>,
}

/* ═══════════════ 工具函数 ═══════════════ */

function createDefaultChart(type) {
  const meta = CHART_TYPE_META.find(t => t.type === type)
  const base = { id: `chart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: meta?.name || type, type, size: meta?.size || 'medium', sql: '', enableFilter: false, filters: [], enableDrilldown: false, drilldownUrl: '' }
  switch (type) {
    case 'profileCard': return { ...base, photo: '', name: '张三', fields: [{ id: 'f1', label: '性别', value: '男' }, { id: 'f2', label: '职工号', value: 'T2024001' }, { id: 'f3', label: '所在单位', value: '电子与通信工程学院' }, { id: 'f4', label: '职称', value: '副教授' }] }
    case 'basicInfo': return { ...base, stat: { label: '项目数', value: '120', unit: '个', compare: '环比 +12%', icon: 'project', iconPosition: 'before-title', color: 'purple' } }
    case 'segmentBar': return { ...base, stats: [{ value: '120', label: '总数' }, { value: '89%', label: '达标率' }], segments: [{ label: '优秀', value: 35, status: 'excellent' }, { label: '良好', value: 45, status: 'good' }, { label: '关注', value: 30, status: 'attention' }, { label: '风险', value: 10, status: 'risk' }], statsSql: '', segmentsSql: '' }
    case 'donut': case 'pie': return { ...base, unit: '人', data: [{ name: '类别A', value: 40 }, { name: '类别B', value: 30 }, { name: '类别C', value: 20 }, { name: '类别D', value: 10 }] }
    case 'donutCallout': return { ...base, unit: '人', data: [{ name: '类别A', value: 35 }, { name: '类别B', value: 25 }, { name: '类别C', value: 20 }, { name: '类别D', value: 12 }, { name: '类别E', value: 8 }] }
    case 'pieCallout': return { ...base, unit: '人', data: [{ name: '类别A', value: 38 }, { name: '类别B', value: 26 }, { name: '类别C', value: 18 }, { name: '类别D', value: 12 }, { name: '类别E', value: 6 }] }
    case 'progressRing': return { ...base, data: [{ value: 78 }] }
    case 'barHorizontal': return { ...base, unit: '人', data: [{ name: '类别A', value: 45 }, { name: '类别B', value: 60 }, { name: '类别C', value: 30 }] }
    case 'rankBar': return { ...base, unit: '篇', data: [{ name: '张研究员', value: 28 }, { name: '李教授', value: 22 }, { name: '王副教授', value: 17 }, { name: '赵讲师', value: 12 }, { name: '钱老师', value: 9 }] }
    case 'barVertical': case 'line': case 'areaLine': return { ...base, unit: '项', xAxisData: ['2021', '2022', '2023', '2024', '2025'], data: [{ name: '系列A', values: [12, 18, 24, 32, 45] }] }
    case 'radar': return { ...base, indicators: [{ name: '维度一', max: 100 }, { name: '维度二', max: 100 }, { name: '维度三', max: 100 }, { name: '维度四', max: 100 }, { name: '维度五', max: 100 }], data: [{ name: '画像A', values: [80, 60, 90, 70, 85] }] }
    default: return { ...base, data: [] }
  }
}

function createDefaultContainer() {
  return { id: `container-${Date.now()}`, title: `分组`, collapsed: false, enableFilter: false, filters: [], charts: [], layout: 'single', tabs: [], activeTabId: null }
}

// 取容器当前应渲染的 charts（layout='tabs' 时取激活页签，否则取 c.charts）
function getActiveCharts(c) {
  if (c.layout === 'tabs') {
    const t = (c.tabs || []).find(x => x.id === c.activeTabId) || c.tabs?.[0]
    return t ? t.charts : []
  }
  return c.charts || []
}

// 取容器内图表总数（tabs 模式求和所有页签）
function getContainerChartCount(c) {
  return c.layout === 'tabs'
    ? (c.tabs || []).reduce((s, t) => s + (t.charts?.length || 0), 0)
    : (c.charts?.length || 0)
}

/* ═══════════════ 左栏 · 类型库 + 容器列表 ═══════════════ */

function LeftPanel({ containers, selectedContainerId, onSelectContainer, onAddContainer, onDeleteContainer, onDragStartType }) {
  const groups = useMemo(() => {
    const map = {}
    CHART_TYPE_META.forEach(m => { if (!map[m.group]) map[m.group] = []; map[m.group].push(m) })
    return map
  }, [])

  return (
    <aside className="cd-left-panel" onClick={(e) => e.stopPropagation()}>
      <div className="cd-panel-header">图表类型</div>

      {/* 容器列表 */}
      <div className="cd-container-list">
        <div className="cd-container-list__header">
          <span>容器列表</span>
          <DSButton size="sm" onClick={onAddContainer}>+ 添加容器</DSButton>
        </div>
        {containers.map(c => (
          <div
            key={c.id}
            className={`cd-container-item ${selectedContainerId === c.id ? 'active' : ''}`}
            onClick={() => onSelectContainer(c.id)}
          >
            <span className="cd-container-item__title">{c.title || '未命名'}</span>
            <span className="cd-container-item__count">{getContainerChartCount(c)} 图</span>
            <DSIconButton onClick={(e) => { e.stopPropagation(); onDeleteContainer(c.id) }} label="删除">×</DSIconButton>
          </div>
        ))}
      </div>

      {/* 类型库 */}
      <div className="cd-type-list">
        {Object.entries(groups).map(([groupName, types]) => (
          <div key={groupName} className="cd-type-group">
            <div className="cd-type-group__title">{groupName}</div>
            {types.map(meta => (
              <div
                key={meta.type}
                className="cd-type-card"
                draggable
                onDragStart={(e) => onDragStartType(e, meta.type)}
                title={meta.desc}
              >
                <div className="cd-type-card__thumb">{THUMBNAIL_ICONS[meta.type]}</div>
                <div className="cd-type-card__info">
                  <div className="cd-type-card__name">{meta.name}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ═══════════════ 中栏 · 容器画布 ═══════════════ */

// 按 type 分发到不同组件
function ChartRenderer({ chart }) {
  // 档案信息卡：照片 + 姓名 + 自定义字段
  if (chart.type === 'profileCard') {
    return (
      <div className="cd-profile-card">
        {chart.photo && <img className="cd-profile-card__photo" src={chart.photo} alt={chart.name} />}
        <div className="cd-profile-card__body">
          <div className="cd-profile-card__name">{chart.name}</div>
          <dl className="cd-profile-card__fields">
            {(chart.fields || []).map(f => (
              <div className="cd-profile-card__field" key={f.id}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }
  // 条形占比图：DSSegmentBarCard
  if (chart.type === 'segmentBar') {
    return <DSSegmentBarCard title={chart.title} stats={chart.stats} segments={chart.segments} actionLabel="" />
  }
  // 统计卡片：单卡模式，支持 icon 位置 + 对比分析
  if (chart.type === 'basicInfo') {
    const s = chart.stat || {}
    const scheme = {
      purple: { bg: '#EBEDFF', text: '#060C77' },
      cyan: { bg: '#E9FAFB', text: '#0F4A68' },
      blue: { bg: '#EBF2FF', text: '#0F2C67' },
      green: { bg: '#F1FDF8', text: '#083A25' },
      deepPurple: { bg: '#EEEBFF', text: '#1A0F67' },
      pink: { bg: '#FFF0F7', text: '#470A27' },
      orange: { bg: '#FFF7EB', text: '#67450F' },
    }[s.color] || { bg: '#EBEDFF', text: '#060C77' }

    const iconNode = s.icon && {
      project: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="10" height="10" rx="2" /><path d="M5 7h4M7 5v4" /></svg>,
      award: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="5" r="3" /><path d="M5 8l-1 4 3-2 3 2-1-4" /></svg>,
      person: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="4" r="2.5" /><path d="M3 12c0-2.5 2-4 4-4s4 1.5 4 4" /></svg>,
      chart: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V6M7 11V4M11 11V8" /></svg>,
      book: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h10v9H2z" /><path d="M7 3v9M2 6h5" /></svg>,
      money: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M7 4v6M5 6h4M5 8h4" /></svg>,
      time: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 2" /></svg>,
    }[s.icon]

    return (
      <div className="cd-stat-card" style={{ backgroundColor: scheme.bg, color: scheme.text }}>
        {s.iconPosition === 'before-title' && iconNode && <div className="cd-stat-card__icon-before">{iconNode}</div>}
        <div className="cd-stat-card__body">
          <div className="cd-stat-card__header">
            <span className="cd-stat-card__label">{s.label || '指标'}</span>
          </div>
          <div className="cd-stat-card__value-row">
            <span className="cd-stat-card__value">{s.value || '0'}</span>
            <span className="cd-stat-card__unit">{s.unit || ''}</span>
          </div>
          {s.compare && <div className="cd-stat-card__compare">{s.compare}</div>}
        </div>
        {s.iconPosition === 'bottom-right' && iconNode && <div className="cd-stat-card__icon-corner">{iconNode}</div>}
      </div>
    )
  }
  // 其余：DSChartCard（buildChartOption 支持）
  return <DSChartCard {...chart} />
}

// 拖拽调整大小手柄
function ResizeHandle({ chart, onResize }) {
  const startXRef = useRef(0)
  const startSpanRef = useRef(0)
  const lastSpanRef = useRef(0)
  const colWidthRef = useRef(0)
  const draggingRef = useRef(false)

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    const wrapper = e.currentTarget.closest('.cd-chart-wrapper')
    if (!wrapper) return

    const grid = wrapper.closest('.ds-dashboard-grid')
    if (!grid) return

    // 计算单列宽度（含 gap）。从 grid 元素的实际尺寸与 CSS 变量推导。
    const gridWidth = grid.offsetWidth
    const gridStyle = window.getComputedStyle(grid)
    const columns = parseInt(gridStyle.getPropertyValue('--ds-dashboard-grid-columns')) || 6
    const gap = parseInt(gridStyle.getPropertyValue('--ds-dashboard-grid-gap')) || 20
    colWidthRef.current = (gridWidth - gap * (columns - 1)) / columns

    startXRef.current = e.clientX
    const startSpan = getChartSpan(chart)
    startSpanRef.current = startSpan
    lastSpanRef.current = startSpan
    draggingRef.current = true

    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [chart])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return
      const deltaX = e.clientX - startXRef.current
      const deltaCols = Math.round(deltaX / colWidthRef.current)
      const limits = CHART_SIZE_LIMITS[chart.type] || { min: 1 }
      const newSpan = Math.max(limits.min, Math.min(GRID_COLUMNS, startSpanRef.current + deltaCols))
      if (newSpan !== lastSpanRef.current) {
        lastSpanRef.current = newSpan
        onResize(newSpan)
      }
    }
    const handleMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [chart.type, onResize])  // 不依赖 chart.size，避免拖拽过程中重新绑定

  return (
    <div
      className="cd-chart-resize-handle"
      draggable={false}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      aria-label="拖拽调整大小"
    />
  )
}

function CanvasArea({
  charts,
  containers,
  selectedChartId,
  onSelectChart,
  onSelectContainer,
  onDeleteChart,
  onToggleCollapse,
  onDropType,
  onDropTypeOnEmpty,
  onSortChart,
  onResizeChart,
  onSelectNone,
  onSelectTab,
}) {
  const totalCharts = charts.length + containers.reduce((s, c) => s + getContainerChartCount(c), 0)

  return (
    <section className="cd-canvas-panel" onClick={onSelectNone}>
      <div className="cd-canvas-toolbar" onClick={(e) => e.stopPropagation()}>
        <span className="cd-canvas-toolbar__title">画布</span>
        <span className="cd-canvas-toolbar__count">{totalCharts} 个图表 / {containers.length} 个容器</span>
      </div>
      <div
        className="cd-canvas-body"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
        onDrop={onDropTypeOnEmpty}
      >
        {charts.length === 0 && containers.length === 0 ? (
          <div className="cd-canvas-empty">
            <div className="cd-canvas-empty__icon">📊</div>
            <div className="cd-canvas-empty__text">拖拽左侧图表类型到此处，或点击「+ 添加容器」</div>
          </div>
        ) : (
          <>
            {/* 顶层图表 */}
            {charts.length > 0 && (
              <div className="cd-top-charts">
                <DSDashboardGrid columns={6} gap={20}>
                  {charts.map((chart, index) => (
                    <div
                      key={chart.id}
                      className={`cd-chart-wrapper ${selectedChartId === chart.id ? 'selected' : ''}`}
                      style={{ '--ds-dashboard-grid-item-span': getChartSpan(chart) }}
                      onClick={(e) => { e.stopPropagation(); onSelectChart(chart.id) }}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/sort', JSON.stringify({ containerId: null, index }))}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move' }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation()
                        const data = e.dataTransfer.getData('text/sort')
                        if (!data) return
                        try {
                          onSortChart(JSON.parse(data), { containerId: null, index })
                        } catch { /* 非法排序数据，忽略 */ }
                      }}
                    >
                      {selectedChartId === chart.id && (
                        <DSIconButton className="cd-chart-wrapper__delete" onClick={(e) => { e.stopPropagation(); onDeleteChart(chart.id) }} label="删除">×</DSIconButton>
                      )}
                      <ResizeHandle
                        chart={chart}
                        onResize={(newSpan) => onResizeChart(null, chart.id, newSpan)}
                      />
                      <ChartRenderer chart={chart} />
                    </div>
                  ))}
                </DSDashboardGrid>
              </div>
            )}

            {/* 容器分组 */}
            {containers.map(container => (
              <div key={container.id} className="cd-container">
                <div className="cd-container__header" onClick={(e) => { e.stopPropagation(); onSelectContainer(container.id) }}>
                  <span className="cd-container__title">{container.title}</span>
                  <DSIconButton
                    className="cd-container__toggle"
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(container.id) }}
                    label="折叠/展开"
                  >
                    {container.collapsed ? '▸' : '▾'}
                  </DSIconButton>
                </div>
                {!container.collapsed && (
                  <>
                    {container.layout === 'tabs' && (container.tabs || []).length > 0 && (
                      <div className="cd-container__tabs" onClick={(e) => e.stopPropagation()}>
                        <DSTabs
                          items={(container.tabs || []).map(t => ({ key: t.id, label: t.title }))}
                          activeKey={container.activeTabId}
                          onChange={(key) => onSelectTab(container.id, key)}
                          overflow
                        />
                      </div>
                    )}
                    <div
                      className="cd-container__body"
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy' }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropType(e, container.id, container.activeTabId) }}
                    >
                      {getActiveCharts(container).length === 0 ? (
                        <div className="cd-container__empty">
                          {container.layout === 'tabs' && !(container.tabs || []).length ? '请在右栏添加页签后拖入图表' : '拖拽左侧图表类型到此处'}
                        </div>
                      ) : (
                        <DSDashboardGrid columns={6} gap={20}>
                          {getActiveCharts(container).map((chart, index) => (
                            <div
                              key={chart.id}
                              className={`cd-chart-wrapper ${selectedChartId === chart.id ? 'selected' : ''}`}
                              style={{ '--ds-dashboard-grid-item-span': getChartSpan(chart) }}
                              onClick={(e) => { e.stopPropagation(); onSelectChart(chart.id) }}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/sort', JSON.stringify({ containerId: container.id, tabId: container.layout === 'tabs' ? container.activeTabId : undefined, index }))}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move' }}
                              onDrop={(e) => {
                                e.preventDefault(); e.stopPropagation()
                                const data = e.dataTransfer.getData('text/sort')
                                if (!data) return
                                try {
                                  onSortChart(JSON.parse(data), { containerId: container.id, tabId: container.layout === 'tabs' ? container.activeTabId : undefined, index })
                                } catch { /* 非法排序数据，忽略 */ }
                              }}
                            >
                              {selectedChartId === chart.id && (
                                <DSIconButton className="cd-chart-wrapper__delete" onClick={(e) => { e.stopPropagation(); onDeleteChart(chart.id) }} label="删除">×</DSIconButton>
                              )}
                              <ResizeHandle
                                chart={chart}
                                onResize={(newSpan) => onResizeChart(container.id, chart.id, newSpan, container.layout === 'tabs' ? container.activeTabId : undefined)}
                              />
                              <ChartRenderer chart={chart} />
                            </div>
                          ))}
                        </DSDashboardGrid>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}

/* ═══════════════ 右栏 · 属性编辑 ═══════════════ */

function PropertyEditor({ target, onUpdateChart, onReplaceChart, onUpdateContainer, onAddContainerFilter, onRemoveContainerFilter, onUpdateContainerFilter, onDeleteChart, onToggleTabLayout, onAddTab, onUpdateTab, onDeleteTab }) {
  const [dataError, setDataError] = useState('')
  const [activeTab, setActiveTab] = useState('style') // 'style' | 'data'

  if (!target) {
    return (
      <aside className="cd-right-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cd-panel-header">属性</div>
        <div className="cd-right-empty">
          <div className="cd-right-empty__icon">⚙️</div>
          <div className="cd-right-empty__text">选中容器或图表以编辑属性</div>
        </div>
      </aside>
    )
  }

  // 容器属性
  if (target.kind === 'container') {
    const c = target.container
    return (
      <aside className="cd-right-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cd-panel-header">容器属性</div>
        <div className="cd-property-body">
          <FieldGroup title="基础">
            <Field label="标题">
              <DSInput value={c.title} onChange={(e) => onUpdateContainer(c.id, 'title', e.target.value)} />
            </Field>
            <Field label="多页签布局">
              <DSSwitch checked={c.layout === 'tabs'} checkedText="开启" uncheckedText="关闭" onChange={(v) => onToggleTabLayout(c.id, v)} />
            </Field>
          </FieldGroup>

          {c.layout === 'tabs' && (
            <FieldGroup title="页签管理">
              <div className="cd-filter-section">
                {(c.tabs || []).map((tab) => (
                  <div key={tab.id} className="cd-filter-item">
                    <div className="cd-filter-item__row">
                      <DSInput
                        value={tab.title}
                        placeholder="页签名"
                        onChange={(e) => onUpdateTab(c.id, tab.id, 'title', e.target.value)}
                      />
                      <DSIconButton onClick={() => onDeleteTab(c.id, tab.id)} label="删除">×</DSIconButton>
                    </div>
                  </div>
                ))}
                <DSButton size="sm" onClick={() => onAddTab(c.id)}>+ 添加页签</DSButton>
              </div>
            </FieldGroup>
          )}

          <FieldGroup title="筛选配置">
            <Field label="是否筛选"><DSSwitch checked={c.enableFilter} checkedText="开启" uncheckedText="关闭" onChange={(v) => onUpdateContainer(c.id, 'enableFilter', v)} /></Field>
            {c.enableFilter && (
              <div className="cd-filter-section">
                <div className="cd-series-editor__header">
                  <span>筛选字段</span>
                  <DSButton size="sm" onClick={() => onAddContainerFilter(c.id)}>+ 添加筛选</DSButton>
                </div>
                {(c.filters || []).map(flt => (
                  <div key={flt.id} className="cd-filter-item">
                    <div className="cd-filter-item__row">
                      <DSInput
                        value={flt.field}
                        placeholder="字段名（如：学院）"
                        onChange={(e) => onUpdateContainerFilter(c.id, flt.id, 'field', e.target.value)}
                      />
                      <DSIconButton onClick={() => onRemoveContainerFilter(c.id, flt.id)} label="删除">×</DSIconButton>
                    </div>
                    <div className="cd-filter-item__row2">
                      <Field label="类型">
                        <DSSelect
                          options={FILTER_TYPE_OPTIONS}
                          value={flt.type}
                          onChange={(v) => onUpdateContainerFilter(c.id, flt.id, 'type', v)}
                        />
                      </Field>
                      {flt.type === 'time' && (
                        <Field label="粒度">
                          <DSSelect
                            options={FILTER_TIME_GRAINS}
                            value={flt.timeGrain || '按年'}
                            onChange={(v) => onUpdateContainerFilter(c.id, flt.id, 'timeGrain', v)}
                          />
                        </Field>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FieldGroup>

          <div className="cd-type-badge">容器 · {getContainerChartCount(c)} 个图表</div>
        </div>
      </aside>
    )
  }

  // 图表属性
  const chart = target.chart
  const update = (field, value) => onUpdateChart(target.containerId, chart.id, field, value, target.tabId)

  const onChangeType = (newType) => {
    const next = { ...createDefaultChart(newType), id: chart.id, title: chart.title, sql: chart.sql || '', filters: chart.filters || [] }
    onReplaceChart(target.containerId, chart.id, next, target.tabId)
    setDataError('')
  }

  const onDataChange = (jsonStr) => {
    try { update('data', JSON.parse(jsonStr)); setDataError('') } catch { setDataError('JSON 格式有误') }
  }

  const onIndicatorsChange = (namesStr) => {
    const names = namesStr.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    const oldMap = new Map((chart.indicators || []).map(i => [i.name, i.max]))
    update('indicators', names.map(name => ({ name, max: oldMap.get(name) ?? 100 })))
  }

  // 筛选条件操作
  const addFilter = () => {
    update('filters', [...(chart.filters || []), { id: `flt${Date.now()}`, field: '', type: 'select', timeGrain: '按年' }])
  }
  const removeFilter = (id) => update('filters', (chart.filters || []).filter(f => f.id !== id))
  const updateFilter = (id, field, value) => {
    update('filters', (chart.filters || []).map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const meta = CHART_TYPE_META.find(t => t.type === chart.type)

  return (
    <aside className="cd-right-panel" onClick={(e) => e.stopPropagation()}>
      <div className="cd-panel-header">
        <span>图表属性</span>
        <DSIconButton onClick={() => onDeleteChart(chart.id)} label="删除">×</DSIconButton>
      </div>

      {/* Tab 切换（档案信息卡只有基础属性，不显示数据设置） */}
      {chart.type !== 'profileCard' && (
        <div className="cd-tabs">
          <DSButton className={`cd-tabs__tab ${activeTab === 'style' ? 'is-active' : ''}`} variant="text" onClick={() => setActiveTab('style')}>图形属性</DSButton>
          <DSButton className={`cd-tabs__tab ${activeTab === 'data' ? 'is-active' : ''}`} variant="text" onClick={() => setActiveTab('data')}>数据设置</DSButton>
        </div>
      )}

      <div className="cd-property-body">
        {/* Tab: 图形属性 */}
        {activeTab === 'style' && (
          <>
            <FieldGroup title="基础属性">
              <Field label="标题"><DSInput value={chart.title} onChange={(e) => update('title', e.target.value)} /></Field>
              <Field label="图表类型"><DSSelect searchable options={CHART_TYPE_META.map(t => ({ label: t.name, value: t.type }))} value={chart.type} onChange={onChangeType} /></Field>
              <Field label="标识ID"><DSInput value={chart.id} readOnly className="cd-input--readonly" /></Field>
            </FieldGroup>

            {/* 档案信息卡无需配置额外属性 */}

            {/* 统计卡片专属编辑（单卡模式） */}
            {chart.type === 'basicInfo' && (
              <FieldGroup title="统计卡片">
                <Field label="标签"><DSInput value={chart.stat?.label || ''} onChange={(e) => update('stat', { ...chart.stat, label: e.target.value })} /></Field>
                <Field label="数值"><DSInput value={chart.stat?.value || ''} onChange={(e) => update('stat', { ...chart.stat, value: e.target.value })} /></Field>
                <div className="cd-stat-item__row2">
                  <Field label="单位"><DSInput value={chart.stat?.unit || ''} onChange={(e) => update('stat', { ...chart.stat, unit: e.target.value })} /></Field>
                  <Field label="对比"><DSInput value={chart.stat?.compare || ''} placeholder="如：环比 +12%" onChange={(e) => update('stat', { ...chart.stat, compare: e.target.value })} /></Field>
                </div>
                <div className="cd-stat-item__row2">
                  <Field label="色系"><DSSelect options={STAT_COLOR_OPTIONS} value={chart.stat?.color || 'purple'} onChange={(v) => update('stat', { ...chart.stat, color: v })} /></Field>
                  <Field label="图标"><DSSelect options={STAT_ICON_OPTIONS} value={chart.stat?.icon || 'project'} onChange={(v) => update('stat', { ...chart.stat, icon: v })} /></Field>
                </div>
                <Field label="图标位置"><DSSelect options={STAT_ICON_POSITIONS} value={chart.stat?.iconPosition || 'before-title'} onChange={(v) => update('stat', { ...chart.stat, iconPosition: v })} /></Field>
              </FieldGroup>
            )}

            {/* 条形占比图专属编辑 */}
            {chart.type === 'segmentBar' && (
              <FieldGroup title="分段数据">
                <div className="cd-series-editor__header"><span>分段</span><DSButton size="sm" onClick={() => update('segments', [...(chart.segments || []), { label: '新分段', value: 0, status: 'good' }])}>添加分段</DSButton></div>
                {(chart.segments || []).map((seg, idx) => (
                  <div key={idx} className="cd-series-item">
                    <div className="cd-series-item__row">
                      <DSInput value={seg.label} placeholder="分段名" onChange={(e) => update('segments', chart.segments.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} />
                      <DSIconButton onClick={() => update('segments', chart.segments.filter((_, i) => i !== idx))} label="删除">×</DSIconButton>
                    </div>
                    <div className="cd-stat-item__row2">
                      <Field label="数值"><DSInput type="number" value={String(seg.value ?? 0)} onChange={(e) => update('segments', chart.segments.map((x, i) => i === idx ? { ...x, value: Number(e.target.value) || 0 } : x))} /></Field>
                      <Field label="状态色"><DSSelect options={SEGMENT_STATUS_OPTIONS} value={seg.status} onChange={(v) => update('segments', chart.segments.map((x, i) => i === idx ? { ...x, status: v } : x))} /></Field>
                    </div>
                  </div>
                ))}
              </FieldGroup>
            )}

            {/* 通用图表数据配置（预览用） */}
            {chart.type !== 'basicInfo' && chart.type !== 'segmentBar' && chart.type !== 'profileCard' && (
              <FieldGroup title="数据配置">
                {chart.type === 'progressRing' ? (
                  <Field label="完成度"><DSInput type="number" value={String(chart.data[0]?.value ?? 0)} min="0" max="100" onChange={(e) => update('data', [{ value: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }])} /></Field>
                ) : (
                  <>
                    {chart.unit !== undefined && <Field label="单位"><DSInput value={chart.unit || ''} onChange={(e) => update('unit', e.target.value)} /></Field>}
                    {chart.xAxisData && <Field label="X轴数据"><DSInput value={chart.xAxisData.join(', ')} onChange={(e) => update('xAxisData', e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean))} /></Field>}
                    {chart.indicators && <Field label="维度"><DSInput value={chart.indicators.map(i => i.name).join(', ')} onChange={(e) => onIndicatorsChange(e.target.value)} /></Field>}
                    <Field label="数据（JSON）">
                      <DSTextarea rows={6} value={JSON.stringify(chart.data, null, 2)} onChange={(e) => onDataChange(e.target.value)} />
                      {dataError && <div className="cd-field-error">{dataError}</div>}
                    </Field>
                  </>
                )}
              </FieldGroup>
            )}

            <div className="cd-type-badge">{meta?.name} · {chart.type}</div>
          </>
        )}

        {/* Tab: 数据设置 */}
        {activeTab === 'data' && (
          <>
            {/* 条形占比图：数据统计 + 分段统计 两个 SQL */}
            {chart.type === 'segmentBar' ? (
              <>
                <FieldGroup title="数据统计来源">
                  <Field label="数据统计 SQL">
                    <DSTextarea
                      rows={6}
                      value={chart.statsSql || ''}
                      placeholder={'SELECT stat_label AS label, stat_value AS value\nFROM kpi_summary\nWHERE kpi_code = :code'}
                      onChange={(e) => update('statsSql', e.target.value)}
                    />
                    <div className="cd-field-hint">取数值统计区（总数、达标率等），列：label, value</div>
                  </Field>
                </FieldGroup>
                <FieldGroup title="分段统计来源">
                  <Field label="分段统计 SQL">
                    <DSTextarea
                      rows={6}
                      value={chart.segmentsSql || ''}
                      placeholder={'SELECT seg_label AS label, seg_value AS value, seg_status AS status\nFROM distribution\nORDER BY seg_value DESC'}
                      onChange={(e) => update('segmentsSql', e.target.value)}
                    />
                    <div className="cd-field-hint">取占比分段，列：label, value, status</div>
                  </Field>
                </FieldGroup>
              </>
            ) : chart.type === 'basicInfo' ? (
              <FieldGroup title="数据来源">
                <Field label="SQL 数据来源（可选）">
                  <DSTextarea
                    rows={6}
                    value={chart.sql || ''}
                    placeholder={'SELECT label, value, unit, compare\nFROM kpi\nWHERE kpi_code = :code'}
                    onChange={(e) => update('sql', e.target.value)}
                  />
                  <div className="cd-field-hint">留空则使用图形属性中的静态值；填写则运行时覆盖</div>
                </Field>
              </FieldGroup>
            ) : (
              <FieldGroup title="数据来源">
                <Field label="SQL 数据来源">
                  <DSTextarea
                    rows={8}
                    value={chart.sql || ''}
                    placeholder={'SELECT year, series_name, value\nFROM chart_data\nWHERE chart_id = :id\nORDER BY year'}
                    onChange={(e) => update('sql', e.target.value)}
                  />
                  <div className="cd-field-hint">运行时由后端执行，图表预览使用示例数据</div>
                </Field>
              </FieldGroup>
            )}

            <FieldGroup title="交互配置">
              <Field label="是否筛选"><DSSwitch checked={chart.enableFilter} checkedText="开启" uncheckedText="关闭" onChange={(v) => update('enableFilter', v)} /></Field>
              {chart.enableFilter && (
                <div className="cd-filter-section">
                  <div className="cd-series-editor__header">
                    <span>筛选字段</span>
                    <DSButton size="sm" onClick={addFilter}>+ 添加筛选</DSButton>
                  </div>
                  {(chart.filters || []).map(flt => (
                    <div key={flt.id} className="cd-filter-item">
                      <div className="cd-filter-item__row">
                        <DSInput
                          value={flt.field}
                          placeholder="字段名（如：学院）"
                          onChange={(e) => updateFilter(flt.id, 'field', e.target.value)}
                        />
                        <DSIconButton onClick={() => removeFilter(flt.id)} label="删除">×</DSIconButton>
                      </div>
                      <div className="cd-filter-item__row2">
                        <Field label="类型">
                          <DSSelect
                            options={FILTER_TYPE_OPTIONS}
                            value={flt.type}
                            onChange={(v) => updateFilter(flt.id, 'type', v)}
                          />
                        </Field>
                        {flt.type === 'time' && (
                          <Field label="粒度">
                            <DSSelect
                              options={FILTER_TIME_GRAINS}
                              value={flt.timeGrain || '按年'}
                              onChange={(v) => updateFilter(flt.id, 'timeGrain', v)}
                            />
                          </Field>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Field label="是否下钻"><DSSwitch checked={chart.enableDrilldown} checkedText="开启" uncheckedText="关闭" onChange={(v) => update('enableDrilldown', v)} /></Field>
              {chart.enableDrilldown && <Field label="下钻URL"><DSInput value={chart.drilldownUrl || ''} placeholder="https://..." onChange={(e) => update('drilldownUrl', e.target.value)} /></Field>}
            </FieldGroup>
          </>
        )}
      </div>
    </aside>
  )
}

function FieldGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="cd-field-group">
      <div className="cd-field-group__header" onClick={() => setOpen(!open)}><span>{title}</span><span className="cd-field-group__arrow">{open ? '▾' : '▸'}</span></div>
      {open && <div className="cd-field-group__body">{children}</div>}
    </div>
  )
}
function Field({ label, children }) {
  return (<div className="cd-field"><label className="cd-field__label">{label}</label><div className="cd-field__control">{children}</div></div>)
}

/* ═══════════════ 主组件 ═══════════════ */

function ChartDesignerPage() {
  const [charts, setCharts] = useState([]) // 顶层图表（不在容器里）
  const [containers, setContainers] = useState([])
  const [selectedContainerId, setSelectedContainerId] = useState(null)
  const [selectedChartId, setSelectedChartId] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [message, setMessage] = useState('')
  const dragTypeRef = useRef(null)

  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 1600) }

  // 找到当前选中的图表及其容器
  const selectedTarget = useMemo(() => {
    // 先在顶层图表里找
    if (selectedChartId) {
      const topChart = charts.find(ch => ch.id === selectedChartId)
      if (topChart) return { kind: 'chart', containerId: null, chart: topChart }
      // 再在容器里找（tabs 模式遍历各页签）
      for (const c of containers) {
        if (c.layout === 'tabs') {
          for (const t of (c.tabs || [])) {
            const chart = (t.charts || []).find(ch => ch.id === selectedChartId)
            if (chart) return { kind: 'chart', containerId: c.id, tabId: t.id, chart }
          }
        } else {
          const chart = (c.charts || []).find(ch => ch.id === selectedChartId)
          if (chart) return { kind: 'chart', containerId: c.id, tabId: undefined, chart }
        }
      }
    }
    if (selectedContainerId) {
      const container = containers.find(c => c.id === selectedContainerId)
      if (container) return { kind: 'container', container }
    }
    return null
  }, [charts, containers, selectedContainerId, selectedChartId])

  // 容器操作
  const addContainer = useCallback(() => {
    const c = createDefaultContainer()
    setContainers(prev => [...prev, c])
    setSelectedContainerId(c.id)
    setSelectedChartId(null)
    notify('已添加容器')
  }, [])

  const deleteContainer = useCallback((id) => {
    setContainers(prev => prev.filter(c => c.id !== id))
    if (selectedContainerId === id) { setSelectedContainerId(null); setSelectedChartId(null) }
    notify('已删除容器')
  }, [selectedContainerId])

  const updateContainer = useCallback((id, field, value) => {
    setContainers(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)))
  }, [])

  // 容器筛选操作
  const addContainerFilter = useCallback((containerId) => {
    setContainers(prev => prev.map(c => c.id === containerId ? {
      ...c,
      filters: [...(c.filters || []), { id: `cf${Date.now()}`, field: '', type: 'select', timeGrain: '按年' }],
    } : c))
  }, [])

  const removeContainerFilter = useCallback((containerId, filterId) => {
    setContainers(prev => prev.map(c => c.id === containerId ? {
      ...c,
      filters: (c.filters || []).filter(f => f.id !== filterId),
    } : c))
  }, [])

  const updateContainerFilter = useCallback((containerId, filterId, field, value) => {
    setContainers(prev => prev.map(c => c.id === containerId ? {
      ...c,
      filters: (c.filters || []).map(f => f.id === filterId ? { ...f, [field]: value } : f),
    } : c))
  }, [])

  const toggleCollapse = useCallback((id) => {
    setContainers(prev => prev.map(c => (c.id === id ? { ...c, collapsed: !c.collapsed } : c)))
  }, [])

  // —— 多页签布局 ——
  // 切换布局：开启即建 2 个页签；关闭则按页签顺序合并所有 charts 回 c.charts
  const toggleTabLayout = useCallback((containerId, enabled) => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c
      if (enabled) {
        const t1 = { id: `tab-${Date.now()}`, title: '页签1', charts: c.charts || [] }
        const t2 = { id: `tab-${Date.now()}-2`, title: '页签2', charts: [] }
        return { ...c, layout: 'tabs', tabs: [t1, t2], activeTabId: t1.id }
      }
      const merged = (c.tabs || []).flatMap(t => t.charts || [])
      return { ...c, layout: 'single', tabs: [], activeTabId: null, charts: merged }
    }))
    notify(enabled ? '已切换为多页签布局' : '已合并为单页布局')
  }, [])

  const addTab = useCallback((containerId) => {
    const tab = { id: `tab-${Date.now()}`, title: `页签`, charts: [] }
    setContainers(prev => prev.map(c => (c.id === containerId ? { ...c, tabs: [...(c.tabs || []), tab], activeTabId: tab.id } : c)))
  }, [])

  const updateTab = useCallback((containerId, tabId, field, value) => {
    setContainers(prev => prev.map(c => (c.id === containerId ? { ...c, tabs: (c.tabs || []).map(t => (t.id === tabId ? { ...t, [field]: value } : t)) } : c)))
  }, [])

  const deleteTab = useCallback((containerId, tabId) => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c
      const remaining = (c.tabs || []).filter(t => t.id !== tabId)
      const nextActive = remaining.length ? remaining[Math.min((c.tabs || []).findIndex(t => t.id === tabId), remaining.length - 1)].id : null
      return { ...c, tabs: remaining, activeTabId: nextActive }
    }))
  }, [])

  const selectTab = useCallback((containerId, tabId) => {
    updateContainer(containerId, 'activeTabId', tabId)
  }, [updateContainer])

  // 图表操作（containerId === null 表示顶层图表；tabId 仅 tabs 布局有意义）
  // mapContainerCharts：在容器内定位目标 charts 数组（single 取 c.charts，tabs 取 tabId 页签）并 transform
  const mapContainerCharts = (c, tabId, transform) => {
    if (c.layout === 'tabs') {
      const tabs = (c.tabs || []).map(t => (t.id === tabId ? { ...t, charts: transform(t.charts || []) } : t))
      return { ...c, tabs }
    }
    return { ...c, charts: transform(c.charts || []) }
  }

  const addChart = useCallback((containerId, type, tabId) => {
    const chart = createDefaultChart(type)
    if (containerId) {
      setContainers(prev => prev.map(c => (c.id === containerId ? mapContainerCharts(c, tabId, list => [...list, chart]) : c)))
    } else {
      setCharts(prev => [...prev, chart])
    }
    setSelectedChartId(chart.id)
    notify(`已添加 ${CHART_TYPE_META.find(t => t.type === type)?.name}`)
  }, [])

  const updateChart = useCallback((containerId, chartId, field, value, tabId) => {
    if (containerId) {
      setContainers(prev => prev.map(c => (c.id === containerId ? mapContainerCharts(c, tabId, list => list.map(ch => (ch.id === chartId ? { ...ch, [field]: value } : ch))) : c)))
    } else {
      setCharts(prev => prev.map(ch => (ch.id === chartId ? { ...ch, [field]: value } : ch)))
    }
  }, [])

  const replaceChart = useCallback((containerId, chartId, nextChart, tabId) => {
    if (containerId) {
      setContainers(prev => prev.map(c => (c.id === containerId ? mapContainerCharts(c, tabId, list => list.map(ch => (ch.id === chartId ? nextChart : ch))) : c)))
    } else {
      setCharts(prev => prev.map(ch => (ch.id === chartId ? nextChart : ch)))
    }
  }, [])

  // 拖拽调整大小：直接写 span，同时同步 size 为最接近的档位
  const resizeChart = useCallback((containerId, chartId, newSpan, tabId) => {
    const apply = ch => (ch.id === chartId ? { ...ch, span: newSpan, size: spanToSize(newSpan) } : ch)
    if (containerId) {
      setContainers(prev => prev.map(c => (c.id === containerId ? mapContainerCharts(c, tabId, list => list.map(apply)) : c)))
    } else {
      setCharts(prev => prev.map(apply))
    }
  }, [])

  const deleteChart = useCallback((chartId) => {
    setContainers(prev => prev.map(c => {
      if (c.layout === 'tabs') return { ...c, tabs: (c.tabs || []).map(t => ({ ...t, charts: (t.charts || []).filter(ch => ch.id !== chartId) })) }
      return { ...c, charts: (c.charts || []).filter(ch => ch.id !== chartId) }
    }))
    setCharts(prev => prev.filter(ch => ch.id !== chartId))
    if (selectedChartId === chartId) setSelectedChartId(null)
    notify('已删除图表')
  }, [selectedChartId])

  // 拖拽
  const handleDragStartType = useCallback((e, type) => {
    dragTypeRef.current = type
    e.dataTransfer.setData('text/chart-type', type)
  }, [])

  const handleDropType = useCallback((e, containerId, tabId) => {
    e.preventDefault()
    // 排序拖动（已存在图表）不在此处理
    if (e.dataTransfer.getData('text/sort')) return
    const type = e.dataTransfer.getData('text/chart-type') || dragTypeRef.current
    if (type) addChart(containerId, type, tabId)
    dragTypeRef.current = null
  }, [addChart])

  // 拖到空白画布：添加为顶层图表（不建容器）。排除排序拖动。
  const handleDropTypeOnEmpty = useCallback((e) => {
    e.preventDefault()
    if (e.dataTransfer.getData('text/sort')) return
    const type = e.dataTransfer.getData('text/chart-type') || dragTypeRef.current
    dragTypeRef.current = null
    if (!type) return
    addChart(null, type)
  }, [addChart])

  // 排序拖拽 helper：取/写容器内指定 tab 的 charts（single 模式忽略 tabId 走 c.charts）
  const getChartsOf = (c, tabId) => c.layout === 'tabs' ? ((c.tabs || []).find(t => t.id === tabId)?.charts || []) : (c.charts || [])
  const setChartsOf = (c, tabId, next) => {
    if (c.layout === 'tabs') {
      return { ...c, tabs: (c.tabs || []).map(t => (t.id === tabId ? { ...t, charts: next } : t)) }
    }
    return { ...c, charts: next }
  }

  const handleSortChart = useCallback((from, to) => {
    // 同位置：无需移动
    if (from.containerId === to.containerId && from.tabId === to.tabId && from.index === to.index) return

    // 顶层图表之间排序
    if (from.containerId === null && to.containerId === null) {
      setCharts(prev => {
        const next = [...prev]
        const [chart] = next.splice(from.index, 1)
        next.splice(to.index, 0, chart)
        return next
      })
      return
    }

    // 从顶层拖入容器（落点：to.tabId 页签，或 single 的 c.charts）
    if (from.containerId === null && to.containerId) {
      setCharts(prev => {
        const [chart] = prev.splice(from.index, 1)
        setContainers(conts => conts.map(c => {
          if (c.id !== to.containerId) return c
          const list = getChartsOf(c, to.tabId)
          return setChartsOf(c, to.tabId, [...list, chart])
        }))
        return [...prev]
      })
      return
    }

    // 从容器拖到顶层
    if (from.containerId && to.containerId === null) {
      let picked = null
      setContainers(prev => prev.map(c => {
        if (c.id !== from.containerId) return c
        const list = [...getChartsOf(c, from.tabId)]
        ;[picked] = list.splice(from.index, 1)
        return setChartsOf(c, from.tabId, list)
      }))
      if (picked) {
        setCharts(chs => {
          const nextCharts = [...chs]
          nextCharts.splice(to.index, 0, picked)
          return nextCharts
        })
      }
      return
    }

    // 容器之间或容器内排序
    if (from.containerId !== to.containerId) {
      // 跨容器移动（源用 from.tabId，目标用 to.tabId）
      setContainers(prev => {
        const byId = id => prev.find(c => c.id === id)
        const fromContainer = byId(from.containerId)
        const toContainer = byId(to.containerId)
        if (!fromContainer || !toContainer) return prev
        const fromList = [...getChartsOf(fromContainer, from.tabId)]
        const [chart] = fromList.splice(from.index, 1)
        const toList = [...getChartsOf(toContainer, to.tabId)]
        toList.splice(to.index, 0, chart)
        return prev.map(c => {
          if (c.id === from.containerId) return setChartsOf(c, from.tabId, fromList)
          if (c.id === to.containerId) return setChartsOf(c, to.tabId, toList)
          return c
        })
      })
    } else {
      // 同容器；跨 tab v1 不支持
      if (from.tabId !== to.tabId) return
      setContainers(prev => prev.map(c => {
        if (c.id !== from.containerId) return c
        const next = [...getChartsOf(c, from.tabId)]
        const [chart] = next.splice(from.index, 1)
        next.splice(to.index, 0, chart)
        return setChartsOf(c, from.tabId, next)
      }))
    }
  }, [])

  // 导出
  const exportData = useMemo(() => ({ version: 4, charts, containers }), [charts, containers])
  const handleCopyJson = useCallback(() => { navigator.clipboard?.writeText(JSON.stringify(exportData, null, 2)); notify('已复制') }, [exportData])
  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'chart-dashboard-config.json'; a.click()
    URL.revokeObjectURL(url)
    notify('已下载')
  }, [exportData])

  return (
    <main className="chart-designer-page" data-ds-business-page="chart-designer">
      <LeftPanel
        containers={containers}
        selectedContainerId={selectedContainerId}
        onSelectContainer={setSelectedContainerId}
        onAddContainer={addContainer}
        onDeleteContainer={deleteContainer}
        onDragStartType={handleDragStartType}
      />

      <div className="cd-canvas-section">
        <div className="cd-toolbar" onClick={(e) => e.stopPropagation()}>
          <span className="cd-toolbar__title">图表设计器</span>
          <div className="cd-toolbar__actions">
            <DSButton size="sm" variant="primary" onClick={() => setShowExport(true)} disabled={charts.length === 0 && containers.length === 0}>导出配置</DSButton>
          </div>
        </div>
        <CanvasArea
          charts={charts}
          containers={containers}
          selectedChartId={selectedChartId}
          onSelectChart={setSelectedChartId}
          onDeleteChart={deleteChart}
          onToggleCollapse={toggleCollapse}
          onDropType={handleDropType}
          onDropTypeOnEmpty={handleDropTypeOnEmpty}
          onSortChart={handleSortChart}
          onResizeChart={resizeChart}
          onSelectContainer={(id) => { setSelectedContainerId(id); setSelectedChartId(null) }}
          onSelectNone={() => { setSelectedContainerId(null); setSelectedChartId(null) }}
          onSelectTab={selectTab}
        />
      </div>

      <PropertyEditor
        target={selectedTarget}
        onUpdateChart={updateChart}
        onReplaceChart={replaceChart}
        onUpdateContainer={updateContainer}
        onAddContainerFilter={addContainerFilter}
        onRemoveContainerFilter={removeContainerFilter}
        onUpdateContainerFilter={updateContainerFilter}
        onDeleteChart={deleteChart}
        onToggleTabLayout={toggleTabLayout}
        onAddTab={addTab}
        onUpdateTab={updateTab}
        onDeleteTab={deleteTab}
      />

      {message && <div className="cd-message" role="status">{message}</div>}

      <DSModal open={showExport} title="导出图表配置" width={680} okText="关闭" showCancel={false} onOk={() => setShowExport(false)}>
        <div className="cd-export-modal">
          <div className="cd-export-modal__desc">导出的 <code>containers</code> 数组可直接用于业务页面。</div>
          <pre className="cd-export-modal__code">{JSON.stringify(exportData, null, 2)}</pre>
          <div className="cd-export-modal__actions">
            <DSButton variant="primary" onClick={handleCopyJson}>复制 JSON</DSButton>
            <DSButton onClick={handleDownloadJson}>下载文件</DSButton>
          </div>
        </div>
      </DSModal>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ChartDesignerPage />)