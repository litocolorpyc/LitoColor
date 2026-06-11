import React, { useState } from 'react'
import { useApp } from '../../App'
import { CLIENTES, OP_ESTADOS, fmtCOP, fmtMin } from '../../lib/data'

export default function OPsGerente() {
  const { ops, registros } = useApp()
  const [filtro, setFiltro] = useState('todos')

  const FILTROS = [
    ['todos','Todas'],['en_produccion','En producción'],['aprobada','Aprobadas'],['terminada','Terminadas']
  ]

  const opsFiltradas = filtro==='todos' ? ops : ops.filter(o=>o.estado===filtro)

  function getRegistrosOP(opId) {
    return registros.filter(r => r.opId === opId)
  }

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Órdenes de Producción</div>

      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
        {FILTROS.map(([val,label]) => (
          <button key={val} onClick={() => setFiltro(val)} style={{
            padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
            background: filtro===val ? 'var(--accent)' : 'var(--surface)',
            color: filtro===val ? '#fff' : 'var(--ink2)',
            border: `0.5px solid ${filtro===val?'var(--accent)':'var(--border2)'}`,
          }}>{label}</button>
        ))}
      </div>

      {opsFiltradas.length === 0
        ? <div className="empty-state"><i className="ti ti-clipboard-list" /><br/>No hay órdenes con este estado.</div>
        : opsFiltradas.map(op => {
            const cliente = CLIENTES.find(c=>c.id===op.clienteId)
            const est = OP_ESTADOS[op.estado] || {}
            const regsOP = getRegistrosOP(op.id)
            const minTrabajados = regsOP.reduce((s,r) => s+(r.durMin||0), 0)
            const unidadesProd  = regsOP.reduce((s,r) => s+(r.cantidad||0), 0)
            const costoRealActual = op.costoReal || 0

            return (
              <div key={op.id} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:14 }}>{op.id}</div>
                    <div style={{ fontSize:12, color:'var(--ink2)', marginTop:2 }}>{op.descripcion}</div>
                    <div style={{ fontSize:12, color:'var(--ink3)' }}>{cliente?.nombre}</div>
                  </div>
                  <span style={{ background:est.bg, color:est.color, padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:500, flexShrink:0, marginLeft:8 }}>
                    {est.label}
                  </span>
                </div>

                {/* Progreso */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink3)', marginBottom:4 }}>
                    <span>Progreso</span><span>{op.progreso}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:op.progreso+'%' }} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                  <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'6px 10px' }}>
                    <div style={{ color:'var(--ink3)', fontSize:11 }}>Costo estimado</div>
                    <div style={{ fontWeight:500 }}>{fmtCOP(op.costoEstimado||0)}</div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'6px 10px' }}>
                    <div style={{ color:'var(--ink3)', fontSize:11 }}>Costo real</div>
                    <div style={{ fontWeight:500, color: costoRealActual > (op.costoEstimado||0) ? 'var(--danger)' : 'var(--accent)' }}>
                      {fmtCOP(costoRealActual)}
                    </div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'6px 10px' }}>
                    <div style={{ color:'var(--ink3)', fontSize:11 }}>Tiempo trabajado</div>
                    <div style={{ fontWeight:500 }}>{fmtMin(minTrabajados)}</div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'6px 10px' }}>
                    <div style={{ color:'var(--ink3)', fontSize:11 }}>Unidades</div>
                    <div style={{ fontWeight:500 }}>{unidadesProd.toLocaleString()} / {op.cantidad?.toLocaleString()}</div>
                  </div>
                </div>

                {op.fechaEntrega && (
                  <div style={{ marginTop:8, fontSize:12, color:'var(--ink3)', display:'flex', gap:4 }}>
                    <i className="ti ti-calendar" style={{ fontSize:14 }} />
                    Entrega: {op.fechaEntrega}
                  </div>
                )}
              </div>
            )
          })
      }
    </>
  )
}
