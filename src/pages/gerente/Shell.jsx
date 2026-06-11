import React from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useApp } from '../../App'
import Cotizador    from './Cotizador'
import OPsGerente   from './OPs'
import Costos       from './Costos'
import PerfilPage   from '../Perfil'

const NAV = [
  { path:'/gerente',        icon:'ti-file-invoice',  label:'Cotizar'   },
  { path:'/gerente/ops',    icon:'ti-clipboard-list', label:'Órdenes'  },
  { path:'/gerente/costos', icon:'ti-chart-pie',      label:'Costos'   },
  { path:'/gerente/perfil', icon:'ti-user',           label:'Perfil'   },
]

export default function ShellGerente() {
  const { usuario, logout } = useApp()
  const nav = useNavigate()
  const loc = useLocation()

  return (
    <div className="app-shell">
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:'var(--purple)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-printer" style={{ fontSize:17, color:'#fff' }} aria-hidden="true" />
            </div>
            <div>
              <div className="page-title">Litocolor</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="badge badge-purple">Gerencia</span>
            <div className="avatar" style={{ background:'var(--purple-l)', color:'var(--purple)' }}>{usuario.iniciales}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Routes>
          <Route index        element={<Cotizador />} />
          <Route path="ops"   element={<OPsGerente />} />
          <Route path="costos" element={<Costos />} />
          <Route path="perfil" element={<PerfilPage />} />
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
