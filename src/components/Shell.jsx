import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../App'

const NAV = [
  { path:'/',          icon:'ti-clock',       label:'Captura'   },
  { path:'/insumos',   icon:'ti-packages',    label:'Insumos'   },
  { path:'/dashboard', icon:'ti-chart-bar',   label:'Dashboard' },
  { path:'/informe',   icon:'ti-file-report', label:'Informe'   },
]

export default function Shell() {
  const { operario, logout } = useApp()
  const nav  = useNavigate()
  const loc  = useLocation()

  return (
    <div className="app-shell">
      {/* Top header */}
      <div className="page-header">
        <div className="page-header-row">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              width:32,height:32,background:'var(--accent)',
              borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'
            }}>
              <i className="ti ti-printer" style={{fontSize:17,color:'#fff'}} aria-hidden="true" />
            </div>
            <div>
              <div className="page-title">Litocolor</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="avatar">{operario.iniciales}</div>
            <button className="btn-icon" onClick={logout} title="Salir">
              <i className="ti ti-logout" style={{fontSize:20}} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div style={{fontSize:12,color:'var(--ink3)',marginTop:4}}>
          {operario.nombre} · {operario.cargo}
        </div>
      </div>

      {/* Page content */}
      <div className="page-content">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(item => (
          <button
            key={item.path}
            className={`nav-btn${loc.pathname === item.path ? ' active' : ''}`}
            onClick={() => nav(item.path)}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
