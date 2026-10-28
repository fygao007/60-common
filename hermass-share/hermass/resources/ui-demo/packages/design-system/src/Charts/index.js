/**
 * Charts 图表组件统一入口
 */

import chartTheme, {
  getPaletteColors,
  getCategoryColors,
  getStatusColor,
  getStatusBgColor,
  getTrendColor,
} from './chartTheme'
import buildChartOption from './buildChartOption'
import EChartBase from './EChartBase'
import ChartCard from './ChartCard'
import LegendList from './LegendList'
import TableStatCard from './TableStatCard'
import SegmentBarCard from './SegmentBarCard'
import ColorStatCard, { COLOR_SCHEMES, DEFAULT_ICONS } from './ColorStatCard'
import DashboardGrid, { DashboardGridItem, DASHBOARD_SIZES } from './DashboardGrid'

export {
  chartTheme,
  getPaletteColors,
  getCategoryColors,
  getStatusColor,
  getStatusBgColor,
  getTrendColor,
  buildChartOption,
  EChartBase as DSEChartBase,
  ChartCard as DSChartCard,
  LegendList as DSLegendList,
  TableStatCard as DSTableStatCard,
  SegmentBarCard as DSSegmentBarCard,
  ColorStatCard as DSColorStatCard,
  COLOR_SCHEMES as DS_COLOR_SCHEMES,
  DEFAULT_ICONS as DS_DEFAULT_ICONS,
  DashboardGrid as DSDashboardGrid,
  DashboardGridItem as DSDashboardGridItem,
  DASHBOARD_SIZES as DASHBOARD_SIZES,
}

export default {
  chartTheme,
  buildChartOption,
  EChartBase,
  ChartCard,
  LegendList,
  TableStatCard,
  SegmentBarCard,
  ColorStatCard,
  DashboardGrid,
}