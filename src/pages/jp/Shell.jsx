import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../App'
import Monitor    from './Monitor'
import ProgramarOP from './ProgramarOP'
import InformesJP  from './InformesJP'
import PerfilPage  from '../Perfil'

const NAV = [
  { path:'/jp',           icon:'ti-layout-dashboard', label:'Monitor'  },
  { path:'/jp/programar', icon:'ti-tool',             label:'Programar'},
  { path:'/jp/informes',  icon:'ti-chart-bar',        label:'Informes' },
  { path:'/jp/perfil',    icon:'ti-user',             label:'Perfil'   },
]

export default function ShellJP() {
  const { usuario } = useApp()
  const nav = useNavigate()
  const loc = useLocation()

  return (
    <div className="app-shell">
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:'var(--info)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-printer" style={{ fontSize:17, color:'#fff' }} aria-hidden="true" />
            </div>
            <div className="page-title">Litocolor</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="badge badge-info">Producción</span>
            <div className="avatar" style={{ background:'var(--info-l)', color:'var(--info)' }}>{usuario.iniciales}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Routes>
          <Route index           element={<Monitor />} />
          <Route path="programar" element={<ProgramarOP />} />
          <Route path="informes"  element={<InformesJP />} />
          <Route path="perfil"    element={<PerfilPage />} />
        </Routes>
      </div>

      <nav className="bottom-nav">
        {NAV.map(item => (
          <button key={item.path} className={`nav-btn${loc.pathname===item.path?' active':''}`} onClick={() => nav(item.path)}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
