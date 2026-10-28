import { createRoot } from 'react-dom/client'
import { RecruitmentResumePage } from '@wisedu/shared-pages'

createRoot(document.getElementById('app')).render(
  <RecruitmentResumePage dataSource={window.RecruitmentMock} />,
)
