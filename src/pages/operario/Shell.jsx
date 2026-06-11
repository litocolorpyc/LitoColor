import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../App'
import Captura   from './Captura'
import Insumos   from './Insumos'
import MiResumen from './MiResumen'
import PerfilPage from '../Perfil'

const NAV = [
  { path:'/operario',          icon:'ti-clock',    label:'Captura'  },
  { path:'/operario/insumos',  icon:'ti-packages', label:'Insumos'  },
  { path:'/operario/resumen',  icon:'ti-chart-bar',label:'Mi día'   },
  { path:'/operario/perfil',   icon:'ti-user',     label:'Perfil'   },
]

export default function ShellOperario() {
  const { usuario } = useApp()
  const nav = useNavigate()
  const loc = useLocation()

  return (
    <div className="app-shell">
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-printer" style={{ fontSize:17, color:'#fff' }} aria-hidden="true" />
            </div>
            <div className="page-title">Litocolor</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="badge badge-success">Operario</span>
            <div className="avatar">{usuario.iniciales}</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'var(--ink3)', marginTop:4 }}>{usuario.nombre}</div>
      </div>

      <div className="page-content">
        <Routes>
          <Route index          element={<Captura />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="resumen" element={<MiResumen />} />
          <Route path="perfil"  element={<PerfilPage />} />
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
