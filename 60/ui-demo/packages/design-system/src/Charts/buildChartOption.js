/**
 * buildChartOption - 根据 chart.type 和 chart.data 自动生成 ECharts option
 * 业务页面不直接写 xAxis、yAxis、series、tooltip、grid 等底层配置
 */

import chartTheme, { getPaletteColors, getCategoryColors, getTrendColor } from './chartTheme'

/**
 * 构建图表配置
 * @param {Object} chartConfig - 图表配置对象
 * @returns {Object} ECharts option
 */
export function buildChartOption(chartConfig) {
  const { type, data, theme, total, totalLabel, unit, palette = 'blue', ...rest } = chartConfig

  // 根据图表类型调用对应的构建函数
  const builders = {
    donut: buildDonutOption,
    donutCallout: buildDonutCalloutOption,
    pie: buildPieOption,
    pieCallout: buildPieCalloutOption,
    barHorizontal: buildBarHorizontalOption,
    barVertical: buildBarVerticalOption,
    line: buildLineOption,
    areaLine: buildAreaLineOption,
    rankBar: buildRankBarOption,
    progressRing: buildProgressRingOption,
    radar: buildRadarOption,
  }

  const builder = builders[type]
  if (!builder) {
    console.warn(`Unknown chart type: ${type}`)
    return {}
  }

  return builder({ data, theme, total, totalLabel, unit, palette, ...rest })
}

/**
 * 环形图配置
 * 用于分类占比，如职称结构、获奖等级、课程类别
 *
 * 关键修改：
 * - 不使用 ECharts legend（业务 LegendList 组件处理）
 * - 使用 title 显示环心数字
 * - label/labelLine 关闭
 */
function buildDonutOption({ data, theme, total, totalLabel, unit, palette }) {
  if (!data || data.length === 0) return {}

  const colors = getPaletteColors(palette, data.length)
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percent = ((params.value / totalValue) * 100).toFixed(1)
        return `${params.name}<br/>${params.value}${unit ? ` ${unit}` : ''} (${percent}%)`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    // 不使用 ECharts legend，业务 LegendList 组件处理
    // 环心只显示一个数字：显式 show、textVerticalAlign，禁止 subtext / graphic / 中心 HTML
    title: {
      show: true,
      text: String(totalValue),
      left: '50%',
      top: '50%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 34,
        fontWeight: 700,
        color: '#1f2937',
        lineHeight: 40,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 5,
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(15, 23, 42, 0.18)',
          },
        },
        // 颜色优先用 data 自带 color（donutCallout mixed 场景），否则按阶梯色板
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color || colors[index],
          },
        })),
      },
    ],
  }
}

/**
 * 扇形图（实心饼图）+ 短引导线配置
 * 用于分类占比且希望视觉饱满的场景（如指导学生统计）
 *
 * 特点：
 * - 实心扇形，半径较大，视觉饱满
 * - 引导线很短（length/length2 都很小），标签贴近饼图
 * - 标签：名称在上、数据（占比 + 数量）在下
 * - 不显示中心总数/标题
 */
function buildPieCalloutOption({ data, theme, unit, palette, total, totalLabel }) {
  if (!data || data.length === 0) return {}

  const colors = getPaletteColors(palette, data.length)
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)

  return {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: (params) =>
        `${params.name}: ${params.value}${unit ? ` ${unit}` : ''} (${params.percent}%)`,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    // 不显示中心总数/标题
    title: {
      show: false,
    },
    series: [
      {
        type: 'pie',
        radius: '68%',
        center: ['50%', '50%'],
        minAngle: 8,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: (params) =>
            `{name|${params.name}}\n{data|${params.percent}%  ${params.value}${unit ? ` ${unit}` : ''}}`,
          rich: {
            name: {
              fontSize: 12,
              color: '#374151',
              fontWeight: 500,
              lineHeight: 18,
            },
            data: {
              fontSize: 12,
              color: '#9ca3af',
              lineHeight: 18,
            },
          },
        },
        labelLine: {
          show: true,
          length: 6,
          length2: 6,
          smooth: false,
          lineStyle: {
            width: 1.5,
            color: '#9ca3af',
          },
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color || colors[index],
          },
        })),
      },
    ],
  }
}

/**
 * 引导线环形图配置
 * 用于需要直接标注分类名称、占比和数量的结构类统计
 *
 * 与普通 donut 区别：
 * - 中心显示总数数字 + 标题（如"学生总数")
 * - 图例放在图表上方（由业务 CalloutLegend 渲染，非 ECharts legend）
 * - 每个扇区通过 labelLine 向外延伸标签（名称 + 百分比 + 数量）
 * - 引导线加粗，支持自适应
 */
function buildDonutCalloutOption({ data, theme, unit, palette, total, totalLabel }) {
  if (!data || data.length === 0) return {}

  const paletteColors = getPaletteColors(palette, data.length)
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)

  return {
    // 每项 color 优先，保证图例色点与扇区/引导线色一致
    color: data.map((item, index) => item.color || paletteColors[index]),
    tooltip: {
      trigger: 'item',
      formatter: (params) =>
        `${params.name}: ${params.value}${unit ? ` ${unit}` : ''} (${params.percent}%)`,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    // 中心显示总数数字 + 标题（如"学生总数")
    title: {
      show: true,
      text: String(totalValue),
      subtext: totalLabel || '总数',
      left: '50%',
      top: '50%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 34,
        fontWeight: 700,
        color: '#1f2937',
        lineHeight: 40,
      },
      subtextStyle: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 18,
      },
    },
    // 不使用 ECharts 内置 legend（图例在图表上方由业务渲染）
    series: [
      {
        type: 'pie',
        radius: ['42%', '58%'],
        center: ['50%', '56%'],
        minAngle: 8,
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          alignTo: 'labelLine',
          bleedMargin: 10,
          distanceToLabelLine: 8,
          formatter: (params) =>
            `${params.name}\n${params.percent}%  ${params.value}${unit ? ` ${unit}` : ''}`,
          color: '#1f2937',
          fontSize: 12,
          lineHeight: 18,
        },
        labelLine: {
          show: true,
          length: 28, // 第一段稍长
          length2: 80, // 第二段更长，让标签更远离中心
          smooth: false,
          lineStyle: {
            width: 2.5, // 再加粗一点
            color: '#9ca3af', // 给引导线一个明显的灰色
          },
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 3,
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color || paletteColors[index],
          },
        })),
      },
    ],
  }
}

/**
 * 横向柱状图配置
 * 用于横向对比，如学历结构、课程数量、成果数量
 *
 * 关键修改：
 * - grid: left 48, right 56, top 12, bottom 12
 * - yAxis inverse: true
 * - barWidth: 14
 * - borderRadius: [0, 8, 8, 0]
 *//**
 * 饼状图配置
 * 用于实心分类占比，如学院分布、学科分布
 *
 * 与 donut 区别：
 * - 实心饼图，无环心文字
 * - 显示百分比 label
 * - 业务 LegendList 处理图例
 */
function buildPieOption({ data, theme, total, totalLabel, unit, palette }) {
  if (!data || data.length === 0) return {}

  const colors = getPaletteColors(palette, data.length)
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percent = ((params.value / totalValue) * 100).toFixed(1)
        return `${params.name}<br/>${params.value}${unit ? ` ${unit}` : ''} (${percent}%)`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    // 不使用 ECharts legend，业务 LegendList 组件处理
    series: [
      {
        type: 'pie',
        radius: '72%',
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          color: '#4b5563',
          fontSize: 12,
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 8,
          lineStyle: {
            color: '#d1d5db',
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 600,
          },
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: colors[index],
          },
        })),
      },
    ],
  }
}

/**
 * 用于横向对比，如学历结构、课程数量、成果数量
 *
 * 关键修改：
 * - grid: left 24, right 56（右侧留出数值 label 空间），top/bottom 12
 * - yAxis inverse: true
 * - yAxis.axisLabel: fontSize 14, 不加粗, 深灰色
 */
function buildBarHorizontalOption({ data, theme, unit, palette }) {
  if (!data || data.length === 0) return {}

  const colors = getPaletteColors(palette, data.length)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const item = params[0]
        return `${item.name}<br/>${item.value}${unit ? ` ${unit}` : ''}`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    grid: {
      left: 24,
      right: 56,
      top: 16,
      bottom: 16,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4b5563', // 深灰色
        fontSize: 14,
        fontWeight: 'normal',
        margin: 12,
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: colors[index],
            borderRadius: [0, 10, 10, 0],
          },
        })),
        barWidth: 16,
        showBackground: true,
        backgroundStyle: {
          color: '#f1f5f9',
          borderRadius: [0, 10, 10, 0],
        },
        label: {
          show: true,
          position: 'right',
          distance: 8,
          formatter: (params) => `${params.value}${unit ? ` ${unit}` : ''}`,
          color: '#0f172a',
          fontSize: 15,
          fontWeight: 600,
        },
      },
    ],
  }
}

/**
 * 竖向柱状图配置
 * 用于年度对比或月度对比
 */
function buildBarVerticalOption({ data, theme, unit, xAxisData, palette }) {
  if (!data || data.length === 0) return {}

  // 支持两种格式：
  // 1. [{values: [12,18,24]}] 单系列多数据点（配合 xAxisData）
  // 2. [{value: 12}, {value: 18}] 多系列单数据点（传统分类柱状）
  const seriesData = Array.isArray(data) ? data : [data]
  const isValuesFormat = seriesData[0] && seriesData[0].values !== undefined

  // values 格式：按系列着色，颜色数量 = 系列数；单值格式：颜色数量 = 分类数
  const colors = getPaletteColors(palette, isValuesFormat ? seriesData.length : seriesData.length)

  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        if (!params || params.length === 0) return ''
        const time = params[0].name
        const lines = params.map(param => {
          const seriesName = param.seriesName
          const value = param.value
          return `${seriesName}: ${value}${unit ? ` ${unit}` : ''}`
        })
        return `${time}<br/>${lines.join('<br/>')}`
      },
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1); border-radius: 12px;',
    },
    grid: {
      left: 36,
      right: 24,
      top: 24,
      bottom: 36,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData || (isValuesFormat ? [] : seriesData.map(item => item.name)),
      axisLine: {
        lineStyle: { color: '#e2e8f0' },
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#eef2f7',
          type: 'dashed',
        },
      },
    },
    series: isValuesFormat
      ? seriesData.map((series, seriesIndex) => ({
          type: 'bar',
          name: series.name || `系列${seriesIndex + 1}`,
          barWidth: 16,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
          },
          // 多系列 values 格式：按系列着色（同一类型的所有柱颜色一致）
          data: (series.values || []).map((value) => ({
            value,
            itemStyle: {
              color: colors[seriesIndex % colors.length],
            },
          })),
        }))
      : [{
          type: 'bar',
          barWidth: 16,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
          },
          data: seriesData.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: colors[index],
            },
          })),
        }],
  }
}

/**
 * 折线图配置
 * 用于趋势分析，如教学评价趋势、成果增长趋势
 *
 * 关键修改：
 * - grid: left 36, right 24, top 24, bottom 36
 * - boundaryGap: false
 * - lineStyle width: 3
 */
function buildLineOption({ data, unit, xAxisData, palette }) {
  if (!data || data.length === 0) return {}

  const seriesData = Array.isArray(data) ? data : [data]
  // 使用 blue 色板的第2个颜色作为主线（blue2: #3D4AF5）
  const colors = seriesData.map((_, index) => {
    const paletteColors = getPaletteColors(palette || 'blue', 5)
    return paletteColors[index % paletteColors.length]
  })

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        if (!params || params.length === 0) return ''
        const time = params[0].name
        const lines = params.map(param => {
          const seriesName = param.seriesName
          const value = param.value
          return `${seriesName}: ${value}${unit ? ` ${unit}` : ''}`
        })
        return `${time}<br/>${lines.join('<br/>')}`
      },
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1); border-radius: 12px;',
    },
    grid: {
      left: 36,
      right: 24,
      top: 24,
      bottom: 36,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData || [],
      axisLine: {
        lineStyle: { color: '#e2e8f0' },
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#eef2f7',
          type: 'dashed',
        },
      },
    },
    series: seriesData.map((series, index) => ({
      type: 'line',
      name: series.name || `趋势${index + 1}`,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: {
        width: 3,
        color: colors[index],
        shadowColor: 'rgba(61, 74, 245, 0.25)',
        shadowBlur: 10,
      },
      itemStyle: {
        color: colors[index],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      emphasis: {
        focus: 'series',
      },
      data: series.values || [],
    })),
  }
}

/**
 * 面积折线图配置
 * 用于重点趋势展示
 *
 * 关键修改：
 * - 同 line 配置
 * - areaStyle 浅蓝渐变
 */
function buildAreaLineOption({ data, unit, xAxisData, palette }) {
  if (!data || data.length === 0) return {}

  const seriesData = Array.isArray(data) ? data : [data]
  // 主线使用 blue 色板第 2 个颜色（#3D4AF5），多线则阶梯取色
  const colors = seriesData.map((_, index) => {
    const paletteColors = getPaletteColors(palette || 'blue', 5)
    return paletteColors[index % paletteColors.length]
  })

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        if (!params || params.length === 0) return ''
        const time = params[0].name
        const lines = params.map(param => {
          const seriesName = param.seriesName
          const value = param.value
          return `${seriesName}: ${value}${unit ? ` ${unit}` : ''}`
        })
        return `${time}<br/>${lines.join('<br/>')}`
      },
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1); border-radius: 12px;',
    },
    grid: {
      left: 36,
      right: 24,
      top: 24,
      bottom: 36,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData || [],
      axisLine: {
        lineStyle: { color: '#e2e8f0' },
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#eef2f7',
          type: 'dashed',
        },
      },
    },
    series: seriesData.map((series, index) => ({
      type: 'line',
      name: series.name || `趋势${index + 1}`,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: {
        width: 3,
        color: colors[index],
        shadowColor: 'rgba(61, 74, 245, 0.25)',
        shadowBlur: 10,
      },
      itemStyle: {
        color: colors[index],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${colors[index]}45` },
            { offset: 1, color: `${colors[index]}05` },
          ],
        },
      },
      emphasis: {
        focus: 'series',
      },
      data: series.values || [],
    })),
  }
}

/**
 * 排名柱状图配置
 * 用于排名展示
 */
function buildRankBarOption({ data, unit, top = 5, palette }) {
  if (!data || data.length === 0) return {}

  const displayData = data.slice(0, top)
  const colors = getPaletteColors(palette, displayData.length)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const item = params[0]
        const rank = displayData.findIndex(d => d.name === item.name) + 1
        return `第${rank}名: ${item.name}<br/>${item.value}${unit ? ` ${unit}` : ''}`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    grid: {
      left: 100,
      right: 56,
      top: 12,
      bottom: 12,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: displayData.map((item, index) => `${index + 1}. ${item.name}`),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4b5563',
        fontSize: 13,
        margin: 12,
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params) => `${params.value}${unit ? ` ${unit}` : ''}`,
          color: '#1f2937',
          fontSize: 13,
        },
        data: displayData.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: colors[index],
          },
        })),
      },
    ],
  }
}

/**
 * 进度环配置
 * 用于完成度展示
 *
 * 关键修改：
 * - 使用 title 显示百分比
 * - 不显示 legend
 * - radius: ['68%', '86%']
 */
function buildProgressRingOption({ data, unit }) {
  if (!data || data.length === 0) return {}

  const percent = data[0].value || data[0].percent || 0
  // 进度色使用 blue 色板第 2 个颜色（#3D4AF5）
  const color = '#3D4AF5'

  return {
    tooltip: {
      trigger: 'item',
      formatter: () => `完成度: ${percent}%`,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1); border-radius: 12px;',
    },
    title: {
      show: true,
      text: `${percent}%`,
      left: '50%',
      top: '50%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 40,
        fontWeight: 800,
        color: '#0f172a',
        lineHeight: 48,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['70%', '86%'],
        center: ['50%', '50%'],
        startAngle: 90,
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: false,
        },
        data: [
          {
            value: percent,
            name: '已完成',
            itemStyle: {
              color: color,
              borderRadius: 8,
            },
          },
          {
            value: 100 - percent,
            name: '未完成',
            itemStyle: {
              color: '#e5e7eb',
            },
          },
        ],
      },
    ],
  }
}

/**
 * 雷达图配置
 * 用于能力画像
 */
function buildRadarOption({ data, indicators, palette }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return {}

  // 使用 blue 色板的第2个颜色
  const paletteColors = getPaletteColors(palette || 'blue', 5)
  const color = paletteColors[1] // blue2: #3D4AF5
  const seriesData = Array.isArray(data) ? data : [data]

  const radarIndicators = indicators && indicators.length > 0
    ? indicators
    : seriesData[0].values.map((_, i) => ({ name: `维度${i + 1}`, max: 100 }))

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#1f2937',
        fontSize: 13,
      },
    },
    radar: {
      indicator: radarIndicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#6b7280',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(49, 103, 255, 0.02)', 'rgba(49, 103, 255, 0.04)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#d1d5db',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: seriesData.map((item, index) => ({
          value: item.values || [],
          name: item.name || `画像${index + 1}`,
          areaStyle: {
            color: `${color}30`,
          },
          lineStyle: {
            color: color,
            width: 2,
          },
          itemStyle: {
            color: color,
          },
        })),
      },
    ],
  }
}

export default buildChartOption