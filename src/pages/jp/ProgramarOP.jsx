import React, { useState } from 'react'
import { useApp } from '../../App'
import { CLIENTES, MAQUINAS, USUARIOS, OP_ESTADOS, fmtCOP } from '../../lib/data'

export default function ProgramarOP() {
  const { ops, updateOP } = useApp()
  const [seleccionada, setSeleccionada] = useState(null)
  const [form, setForm] = useState({})

  const opsPendientes = ops.filter(o => o.estado==='aprobada' || o.estado==='en_produccion' || o.estado==='pausada')

  function iniciarEdicion(op) {
    setSeleccionada(op)
    setForm({
      fechaEntrega: op.fechaEntrega || '',
      prioridad: op.prioridad || 'media',
      maquinas: op.maquinas || [],
      progreso: op.progreso || 0,
      estado: op.estado,
      notas: op.notas || '',
    })
  }

  function guardar() {
    updateOP(seleccionada.id, form)
    setSeleccionada(null)
  }

  const operarios = USUARIOS.filter(u=>u.rol==='operario'&&u.activo)

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Programar Producción</div>
      <div style={{ fontSize:12, color:'var(--ink3)' }}>Asigna máquinas, fechas y prioridades</div>

      {!seleccionada ? (
        opsPendientes.length === 0
          ? <div className="empty-state"><i className="ti ti-tool" /><br/>No hay órdenes pendientes de programar.</div>
          : opsPendientes.map(op => {
              const cliente = CLIENTES.find(c=>c.id===op.clienteId)
              const est = OP_ESTADOS[op.estado]||{}
              return (
                <div key={op.id} className="card" style={{ cursor:'pointer' }} onClick={() => iniciarEdicion(op)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:500 }}>{op.id}</div>
                      <div style={{ fontSize:12, color:'var(--ink2)', marginTop:2 }}>{op.descripcion}</div>
                      <div style={{ fontSize:12, color:'var(--ink3)' }}>{cliente?.nombre} · {op.cantidad?.toLocaleString()} uds</div>
                      <div style={{ marginTop:6, display:'flex', gap:6 }}>
                        <span style={{ background:est.bg, color:est.color, padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:500 }}>{est.label}</span>
                        <span className={`badge ${op.prioridad==='alta'?'badge-danger':op.prioridad==='media'?'badge-warn':'badge-legales'}`}>{op.prioridad}</span>
                      </div>
                    </div>
                    <i className="ti ti-chevron-right" style={{ fontSize:18, color:'var(--ink3)' }} />
                  </div>
                </div>
              )
            })
      ) : (
        <>
          <button className="btn-sm" onClick={() => setSeleccionada(null)} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-arrow-left" />Volver
          </button>

          <div className="card">
            <div style={{ fontWeight:500, fontSize:15, marginBottom:4 }}>{seleccionada.id}</div>
            <div style={{ fontSize:13, color:'var(--ink2)', marginBottom:12 }}>{seleccionada.descripcion}</div>

            <div className="field-group">
              <label className="field-label">Estado</label>
              <select className="field-select" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>
                {Object.entries(OP_ESTADOS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Prioridad</label>
              <div style={{ display:'flex', gap:8 }}>
                {['alta','media','baja'].map(p => (
                  <button key={p} onClick={()=>setForm(f=>({...f,prioridad:p}))} style={{
                    flex:1, padding:'0.5rem', borderRadius:'var(--rad-sm)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500,
                    background: form.prioridad===p ? (p==='alta'?'var(--danger)':p==='media'?'var(--warn)':'var(--accent)') : 'var(--surface3)',
                    color: form.prioridad===p ? '#fff' : 'var(--ink2)',
                    border: '0.5px solid var(--border2)',
                  }}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Fecha de entrega</label>
              <input type="date" className="field-input" value={form.fechaEntrega} onChange={e=>setForm(f=>({...f,fechaEntrega:e.target.value}))} />
            </div>

            <div className="field-group">
              <label className="field-label">Máquinas asignadas</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'6px 0' }}>
                {MAQUINAS.map(m => (
                  <button key={m.cod} onClick={() => setForm(f => ({
                    ...f, maquinas: f.maquinas.includes(m.cod) ? f.maquinas.filter(x=>x!==m.cod) : [...f.maquinas, m.cod]
                  }))} style={{
                    padding:'4px 10px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'inherit',
                    background: form.maquinas?.includes(m.cod) ? 'var(--info)' : 'var(--surface3)',
                    color: form.maquinas?.includes(m.cod) ? '#fff' : 'var(--ink2)',
                    border: `0.5px solid ${form.maquinas?.includes(m.cod)?'var(--info)':'var(--border2)'}`,
                  }}>{m.nombre}</button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <label className="field-label">Progreso</label>
                <span style={{ fontSize:13, fontWeight:500 }}>{form.progreso}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={form.progreso} onChange={e=>setForm(f=>({...f,progreso:parseInt(e.target.value)}))} style={{ width:'100%' }} />
            </div>

            <div className="field-group">
              <label className="field-label">Notas para operarios</label>
              <input className="field-input" placeholder="Instrucciones especiales..." value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
            </div>

            <button className="btn-primary" style={{ background:'var(--info)' }} onClick={guardar}>
              <i className="ti ti-check" />Guardar programación
            </button>
          </div>
        </>
      )}
    </>
  )
}
