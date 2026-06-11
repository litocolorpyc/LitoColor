import React from 'react'
import { useApp } from '../App'
import { ROL_LABEL, ROL_COLOR } from '../lib/data'

export default function PerfilPage() {
  const { usuario, logout } = useApp()
  return (
    <div style={{ paddingTop:4 }}>
      <div style={{ fontSize:16, fontWeight:500, marginBottom:'1rem' }}>Mi perfil</div>
      <div className="card" style={{ textAlign:'center', padding:'2rem 1rem' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-l)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:500, color:'var(--accent-d)', margin:'0 auto 12px' }}>
          {usuario.iniciales}
        </div>
        <div style={{ fontSize:18, fontWeight:500 }}>{usuario.nombre}</div>
        <div style={{ marginTop:6 }}>
          <span style={{ background: usuario.rol==='gerente'?'var(--purple-l)':usuario.rol==='jp'?'var(--info-l)':'var(--accent-l)', color:ROL_COLOR[usuario.rol], padding:'3px 12px', borderRadius:20, fontSize:13, fontWeight:500 }}>
            {ROL_LABEL[usuario.rol]}
          </span>
        </div>
      </div>

      <div className="card" style={{ marginTop:'0.875rem' }}>
        {[
          ['Cargo', usuario.cargo||ROL_LABEL[usuario.rol]],
          ['Valor/hora', `$${(usuario.valorHora||0).toLocaleString('es-CO')}`],
          ['PIN', '****'],
        ].map(([k,v])=>(
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid var(--border)', fontSize:14 }}>
            <span style={{ color:'var(--ink3)' }}>{k}</span>
            <span style={{ fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary btn-danger" style={{ marginTop:'1rem' }} onClick={logout}>
        <i className="ti ti-logout"/>Cerrar sesión
      </button>
    </div>
  )
}
