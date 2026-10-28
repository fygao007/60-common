/**
 * 图表视觉 token 配置
 * 用于教学档案袋、高校人事系统看板页面
 */

// 阶梯色板 - 原始定义顺序：颜色1 → 颜色2 → 颜色3 → 颜色4 → 颜色5
// 取色规则（见 getPaletteColors）：
//   - 单色系：按原始顺序 颜色1→颜色5 取该色系阶梯色（如 blue: #6D77F7,#9EA4FA,#3D4AF5,#CFD2FC,#0D1DF2）
//   - mixed 跨色系竖向取色：颜色3→4→2→5→1，每档内按 蓝→青→黄→紫→橙→绿→红
export const CHART_PALETTES = {
  blue: ['#6D77F7', '#9EA4FA', '#3D4AF5', '#CFD2FC', '#0D1DF2'],
  cyan: ['#2ED2CC', '#53DDD9', '#20AAA3', '#72E2DF', '#16847E'],
  yellow: ['#FDBA4B', '#FFD28A', '#FFA51F', '#FFE4B8', '#E99400'],
  purple: ['#9270E8', '#B39DF0', '#7649E6', '#D8CDF8', '#5522D9'],
  orange: ['#FF895F', '#FFB095', '#FF612F', '#FFD1C0', '#E93800'],
  green: ['#5CDA7D', '#8AE4A2', '#35D462', '#B7EFC6', '#22B64C'],
  red: ['#FF7379', '#FFA4A8', '#FF454D', '#FFD4D6', '#F4161F'],
}

// 状态色 - 语义色（用于健康度、完成状态等）
export const STATUS_COLORS = {
  success: '#16a34a',  // 正常/达标
  info: '#3167ff',     // 信息/进行中
  warning: '#f59e0b',  // 注意/待完善
  danger: '#ef4444',   // 风险/逾期
}

// 状态色浅底（用于标签背景）
export const STATUS_BG_COLORS = {
  success: '#dcfce7',
  info: '#dbeafe',
  warning: '#fef3c7',
  danger: '#fee2e2',
}

export const chartTheme = {
  // 阶梯色板
  palettes: CHART_PALETTES,

  // 状态色
  statusColors: STATUS_COLORS,
  statusBgColors: STATUS_BG_COLORS,

  // UI 基础色
  colors: {
    ui: {
      background: '#f5f7fb',
      cardBackground: '#ffffff',
      cardBorder: '#e5e7eb',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      gridLine: '#e5e7eb',
      axisLine: '#d1d5db',
    },
  },

  // 字体规范
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizes: {
      title: 20,
      subtitle: 12,
      label: 12,
      tooltip: 13,
      legend: 16,
      insight: 13,
      kpiTitle: 18,
      kpiValue: 42,
      kpiSubtext: 14,
    },
    weights: {
      title: 700,
      normal: 400,
      label: 500,
      kpiValue: 700,
    },
  },

  // 间距规范
  spacing: {
    cardPadding: 24,
    cardPaddingLarge: 28,
    cardGap: 16,
    sectionGap: 24,
    titleHeight: 56,
    chartPadding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },

  // 圆角规范
  borderRadius: {
    card: 16,
    iconContainer: 10,
    bar: 6,
    button: 6,
    segmentBar: 10,
  },

  // 阴影规范
  shadows: {
    card: '0 8px 24px rgba(15, 23, 42, 0.04)',
    hover: '0 12px 32px rgba(15, 23, 42, 0.08)',
  },

  // 图表尺寸规范
  chartSizes: {
    mini: { width: 240, height: 240 },
    small: { width: 320, height: 360 },
    medium: { width: 480, height: 420 },
    wide: { width: 640, height: 420 },
    full: { width: '100%', height: 400 },
  },

  // 图表默认配置
  chartDefaults: {
    // 网格配置
    grid: {
      top: 40,
      right: 20,
      bottom: 40,
      left: 60,
      containLabel: true,
    },

    // Tooltip 配置
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      extraCssText: 'box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border-radius: 8px;',
    },

    // 坐标轴配置
    axis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: '#d1d5db',
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e5e7eb',
          width: 1,
          type: 'dashed',
        },
      },
    },

    // 柱状图配置
    bar: {
      barWidth: 14,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
      },
    },

    // 折线图配置
    line: {
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
      },
    },

    // 环形图配置
    donut: {
      radius: ['62%', '82%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
    },

    // 进度环配置
    progressRing: {
      radius: ['68%', '86%'],
      center: ['50%', '50%'],
    },
  },

  // 图标容器规范
  iconContainer: {
    size: 32,
    borderRadius: 10,
    background: '#eef4ff',
    iconColor: '#3167ff',
    iconSize: 18,
  },
}

/**
 * mixed 跨色系固定 5 色板
 * 取每色系的「颜色3」（bold 档），保证图例色 / 扇区色 / 引导线色一致且对比清晰
 * 用法：palette='mixed' 时按顺序循环取色
 */
export const MIXED_PALETTE = [
  '#6D77F7', // blue3
  '#2ED2CC', // cyan3
  '#FDBA4B', // yellow3
  '#9270E8', // purple3
  '#FF895F', // orange3
]

/**
 * 获取阶梯色数组
 * - 单色系模式：palette 指定具体色系时，按原始顺序（颜色1→颜色2→颜色3→颜色4→颜色5）取色
 * - mixed 模式：palette='mixed' 时，使用 MIXED_PALETTE 固定 5 色循环（蓝3→青3→黄3→紫3→橙3）
 * @param {string} palette - 色板名称，如 'blue', 'mixed'
 * @param {number} count - 需要的颜色数量
 * @returns {string[]} 颜色数组
 */
export function getPaletteColors(palette = 'blue', count = 5) {
  if (palette === 'mixed') {
    // 固定 5 色跨色系循环
    const result = []
    for (let i = 0; i < count; i++) {
      result.push(MIXED_PALETTE[i % MIXED_PALETTE.length])
    }
    return result
  }

  // 单色系：按原始顺序（颜色1→颜色2→颜色3→颜色4→颜色5）取色
  const colors = CHART_PALETTES[palette] || CHART_PALETTES.blue
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

/**
 * 获取分类色（默认使用 blue 色板）
 * @param {number} count - 需要的颜色数量
 * @returns {string[]} 颜色数组
 */
export function getCategoryColors(count = 5) {
  return getPaletteColors('blue', count)
}

/**
 * 获取状态色
 * @param {string} status - 状态名称
 * @returns {string} 颜色值
 */
export function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.info
}

/**
 * 获取状态背景色
 * @param {string} status - 状态名称
 * @returns {string} 颜色值
 */
export function getStatusBgColor(status) {
  return STATUS_BG_COLORS[status] || STATUS_BG_COLORS.info
}

/**
 * 获取趋势色
 * @param {number} index - 趋势线索引
 * @returns {string} 颜色值
 */
export function getTrendColor(index = 0) {
  const colors = CHART_PALETTES.blue
  return colors[index % colors.length]
}

export default chartTheme