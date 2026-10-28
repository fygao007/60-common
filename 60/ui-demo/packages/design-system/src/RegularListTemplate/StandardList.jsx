import DSRegularListTemplate from './index'
import { resolveStandardListConfig } from './standard-list-contract.mjs'

export default function DSStandardListTemplate({ config, ...rest }) {
  if (Object.keys(rest).length) throw new Error('DSStandardListTemplate 只接受 config，禁止覆盖模板布局')
  return <DSRegularListTemplate {...resolveStandardListConfig(config)} className="ds-standard-list-template" />
}
