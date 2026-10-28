import { useMemo, useState } from 'react'
import { DSButton, DSCard, DSTag } from '@wisedu/design-system'
import './relationship-graph.css'

const PATHS = [
  { industry:['i1','电子信息产业'], major:['m1','电子信息专业群'], team:['g1','智能感知创新团队'], post:['p1','嵌入式技术岗'], person:['u1','张明','副教授'] },
  { industry:['i1','电子信息产业'], major:['m1','电子信息专业群'], team:['g1','智能感知创新团队'], post:['p2','人工智能教学岗'], person:['u2','陈晓','讲师'] },
  { industry:['i1','电子信息产业'], major:['m2','集成电路专业群'], team:['g2','集成电路产教团队'], post:['p3','芯片设计岗'], person:['u3','李然','副教授'] },
  { industry:['i2','智能制造产业'], major:['m3','智能制造专业群'], team:['g3','智能制造技术团队'], post:['p4','工业机器人岗'], person:['u4','周锐','教授'] },
  { industry:['i2','智能制造产业'], major:['m3','智能制造专业群'], team:['g3','智能制造技术团队'], post:['p5','数字孪生岗'], person:['u5','王琳','讲师'] },
  { industry:['i3','现代服务产业'], major:['m4','数字商贸专业群'], team:['g4','数字商贸创新团队'], post:['p6','数字营销岗'], person:['u6','赵敏','副教授'] },
]

const VIEWS={industry:{label:'产业图谱',desc:'产业方向与专业群、团队和人才支撑关系',columns:[['industry','产业方向','INDUSTRY'],['major','支撑专业群','MAJOR GROUP'],['team','核心团队','TEAM'],['person','代表人才','PEOPLE']]},team:{label:'团队图谱',desc:'团队之间的专业协同、岗位构成与成员分布',columns:[['team','团队载体','TEAM'],['major','依托专业群','MAJOR GROUP'],['post','团队岗位','POST'],['person','团队成员','MEMBER']]},majorPost:{label:'专业群及岗位图谱',desc:'专业群面向产业设置岗位，并匹配教师能力',columns:[['industry','产业需求','INDUSTRY'],['major','专业群','MAJOR GROUP'],['post','关键岗位','POST'],['person','匹配教师','MATCHED']]},person:{label:'人员关系图谱',desc:'从教师反向查看岗位、团队与产业贡献关系',columns:[['person','教师人才','PEOPLE'],['post','承担岗位','POST'],['team','所属团队','TEAM'],['industry','服务产业','INDUSTRY']]}}

function nodesFor(key, paths) {
  const map = new Map()
  paths.forEach((path) => map.set(path[key][0], path[key]))
  return [...map.values()]
}

export default function RelationshipGraph({ compact = false, title = '产业—团队—岗位—人员关系图谱' }) {
  const [focus, setFocus] = useState(null)
  const [view, setView] = useState('industry')
  const [industry, setIndustry] = useState('all')
  const [aiOpen, setAiOpen] = useState(false)
  const visible = useMemo(() => industry === 'all' ? PATHS : PATHS.filter((p) => p.industry[0] === industry), [industry])
  const activePaths = focus ? visible.filter((p) => Object.values(p).some((n) => n[0] === focus)) : visible
  const activeIds = new Set(activePaths.flatMap((p) => Object.values(p).map((n) => n[0])))
  const currentView = VIEWS[view]

  return (
    <DSCard className={`rg-card ${compact ? 'is-compact' : ''}`} layout="long">
      <header className="rg-head">
        <div><span>RELATIONSHIP INTELLIGENCE</span><h2>{title}</h2><p>{currentView.desc}</p></div>
        <div className="rg-actions">
          <div className="rg-filter">
            {[['all','全部产业'],['i1','电子信息'],['i2','智能制造'],['i3','现代服务']].map(([id,label]) => <button className={industry === id ? 'is-active' : ''} key={id} onClick={() => { setIndustry(id); setFocus(null) }}>{label}</button>)}
          </div>
          <DSButton size="small" onClick={() => setAiOpen((v) => !v)}>AI 识别结构机会</DSButton>
        </div>
      </header>
      <nav className="rg-view-tabs" aria-label="图谱类型">{Object.entries(VIEWS).map(([key,item]) => <button key={key} className={view===key?'is-active':''} onClick={()=>{setView(key);setFocus(null)}}>{item.label}</button>)}</nav>

      {aiOpen && <div className="rg-ai"><div><DSTag tone="primary">AI 草稿</DSTag><strong>发现 3 个结构机会</strong></div><p>电子信息产业的“人工智能教学岗”仅 1 名骨干，建议从青年教师中识别 2 名培养对象；智能制造团队跨学院协作密度偏低，可引入电子信息教师共同建设数字孪生课程。</p><span>依据：岗位覆盖率 · 教师能力画像 · 团队成果关联 · 置信度 86%</span><div><DSButton size="small" variant="outline">查看取数依据</DSButton><DSButton size="small">确认并生成建议</DSButton></div></div>}

      <div className="rg-stage" onMouseLeave={() => setFocus(null)}>
        <svg className="rg-links" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
          {visible.map((path, index) => {
            const y = 46 + index * 50
            const on = !focus || activePaths.includes(path)
            return <path key={index} d={`M125 ${y} C190 ${y},190 ${y},250 ${y} S435 ${y},500 ${y} S685 ${y},750 ${y} S930 ${y},970 ${y}`} className={on ? 'is-active' : 'is-muted'} />
          })}
        </svg>
        {currentView.columns.map(([key,label,en]) => <section className="rg-column" key={key}><div className="rg-column__title"><span>{en}</span><strong>{label}</strong><em>{nodesFor(key, visible).length}</em></div><div className="rg-nodes">{nodesFor(key, visible).map((node) => <button key={node[0]} className={`${focus && !activeIds.has(node[0]) ? 'is-muted' : ''} ${focus === node[0] ? 'is-focus' : ''}`} onMouseEnter={() => setFocus(node[0])} onFocus={() => setFocus(node[0])} onClick={() => setFocus(node[0])}><i>{key==='person'?node[1].slice(0,1):key==='industry'?'产':key==='team'?'团':key==='major'?'专':'岗'}</i><span><strong>{node[1]}</strong><small>{node[2]||(key==='industry'?'重点产业方向':key==='team'?'跨专业协作团队':key==='major'?'专业群建设主体':'能力需求 3 项')}</small></span>{key === 'person' && <em>{node[2]}</em>}</button>)}</div></section>)}
      </div>
      <footer className="rg-legend"><span><i className="is-primary"/>悬停节点聚焦完整链路</span><span><i className="is-ai"/>AI 根据覆盖率与能力匹配提出建议</span><b>{visible.length} 条有效关系 · 数据更新于今日 08:30</b></footer>
    </DSCard>
  )
}
