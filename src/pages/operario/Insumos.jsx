// Insumos.jsx
import React, { useState } from 'react'
import { useApp } from '../../App'
import { MATERIALES, MAQUINAS } from '../../lib/data'

export function Insumos() {
  const { consumos, addConsumo, ops } = useApp()
  const [tab, setTab] = useState('form')
  const BLANK = { opId:'', matCod:'', maquina:'', hEntrada:'', hSalida:'', maculatura:'', comentario:'' }
  const [form, setForm] = useState(BLANK)

  const opsActivas = ops.filter(o=>o.estado==='en_produccion'||o.estado==='aprobada')

  function save() {
    if (!form.matCod) return
    const mat = MATERIALES.find(m=>m.cod===form.matCod)
    const hE=parseInt(form.hEntrada)||0, hS=parseInt(form.hSalida)||0
    addConsumo({
      opId:form.opId, matCod:form.matCod, material:mat?.nombre||form.matCod,
      maquina:form.maquina, hEntrada:hE, hSalida:hS,
      maculatura:parseInt(form.maculatura)||0,
      merma: hE>0?Math.round((hE-hS)/hE*100):0,
      comentario:form.comentario,
    })
    setForm(BLANK); setTab('lista')
  }

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Insumos</div>
      <div className="tabs-bar">
        {[['form','Registrar','ti-plus'],['lista',`Registros (${consumos.length})`,'ti-list']].map(([id,l,ic])=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>
            <i className={`ti ${ic}`}/>{l}
          </button>
        ))}
      </div>

      {tab==='form' && (
        <div className="card">
          <div className="card-title"><i className="ti ti-packages"/>Consumo de material</div>
          <div className="field-group">
            <label className="field-label">Orden de Producción</label>
            <select className="field-select" value={form.opId} onChange={e=>setForm(f=>({...f,opId:e.target.value}))}>
              <option value="">Sin OP</option>
              {opsActivas.map(op=><option key={op.id} value={op.id}>{op.id} — {op.descripcion}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Material *</label>
            <select className="field-select" value={form.matCod} onChange={e=>setForm(f=>({...f,matCod:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {MATERIALES.map(m=><option key={m.cod} value={m.cod}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Máquina</label>
            <select className="field-select" value={form.maquina} onChange={e=>setForm(f=>({...f,maquina:e.target.value}))}>
              <option value="">Sin máquina</option>
              {MAQUINAS.map(m=><option key={m.cod} value={m.cod}>{m.nombre}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'0.875rem' }}>
            <div className="field-group" style={{ marginBottom:0 }}>
              <label className="field-label">Hojas entrada</label>
              <input type="number" className="field-input" placeholder="0" value={form.hEntrada} onChange={e=>setForm(f=>({...f,hEntrada:e.target.value}))}/>
            </div>
            <div className="field-group" style={{ marginBottom:0 }}>
              <label className="field-label">Hojas buenas</label>
              <input type="number" className="field-input" placeholder="0" value={form.hSalida} onChange={e=>setForm(f=>({...f,hSalida:e.target.value}))}/>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Maculatura</label>
            <input type="number" className="field-input" placeholder="0" value={form.maculatura} onChange={e=>setForm(f=>({...f,maculatura:e.target.value}))}/>
          </div>
          {form.hEntrada&&form.hSalida&&(
            <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'8px 12px', marginBottom:'0.875rem', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'var(--ink2)' }}>Merma</span>
              <span style={{ fontWeight:500, color: ((parseInt(form.hEntrada)-parseInt(form.hSalida))/parseInt(form.hEntrada)*100)>10?'var(--danger)':'var(--accent)' }}>
                {Math.round((parseInt(form.hEntrada)-parseInt(form.hSalida))/parseInt(form.hEntrada)*100)}%
              </span>
            </div>
          )}
          <div className="field-group">
            <label className="field-label">Comentario</label>
            <input className="field-input" placeholder="Opcional" value={form.comentario} onChange={e=>setForm(f=>({...f,comentario:e.target.value}))}/>
          </div>
          <button className="btn-primary" disabled={!form.matCod} onClick={save}><i className="ti ti-check"/>Guardar</button>
        </div>
      )}

      {tab==='lista' && (
        consumos.length===0
          ? <div className="empty-state"><i className="ti ti-packages"/><br/>Sin consumos registrados.</div>
          : consumos.map(c=>(
              <div key={c.id} className="card" style={{ padding:'0.875rem 1rem' }}>
                <div style={{ fontWeight:500, fontSize:13 }}>{c.material}</div>
                {c.opId&&<div style={{ fontSize:11, color:'var(--info)' }}>OP: {c.opId}</div>}
                <div style={{ display:'flex', gap:10, fontSize:12, marginTop:4 }}>
                  <span>E: <b>{c.hEntrada}</b></span>
                  <span>S: <b>{c.hSalida}</b></span>
                  <span style={{ color:c.merma>10?'var(--danger)':'var(--accent)' }}>Merma: <b>{c.merma}%</b></span>
                </div>
              </div>
            ))
      )}
    </>
  )
}

export default Insumos
