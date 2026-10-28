import { createRoot } from 'react-dom/client'
import { DSStandardListTemplate } from '@wisedu/design-system'
import { usePageConfig } from './szd-standard-list-page.config.js'
import './szd-standard-list-page.css'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'standard-list-root'

function StandardListPage() {
  return <DSStandardListTemplate config={usePageConfig()} />
}
createRoot(document.getElementById('app')).render(<StandardListPage />)
