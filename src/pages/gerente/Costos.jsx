import React from 'react'
import { useApp } from '../../App'
import { CLIENTES, fmtCOP, fmtMin } from '../../lib/data'

export default function Costos() {
  const { ops, registros, cotizaciones } = useApp()

  const totalCotizado  = cotizaciones.filter(c=>c.estado==='aprobada').reduce((s,c)=>s+c.total,0)
  const totalCostoReal = ops.reduce((s,o)=>s+(o.costoReal||0),0)
  const totalEstimado  = ops.reduce((s,o)=>s+(o.costoEstimado||0),0)
  const margenReal     = totalCotizado>0 ? Math.round((totalCotizado-totalCostoReal)/totalCotizado*100) : 0

  const minDir  = registros.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
  const minParo = registros.filter(r=>r.tipo==='paro').reduce((s,r)=>s+(r.durMin||0),0)
  const totProd = registros.reduce((s,r)=>s+(r.cantidad||0),0)

  // Por OP
  const costosPorOP = ops.map(op => {
    const regs = registros.filter(r=>r.opId===op.id)
    const minTrab = regs.reduce((s,r)=>s+(r.durMin||0),0)
    const uds = regs.reduce((s,r)=>s+(r.cantidad||0),0)
    const cliente = CLIENTES.find(c=>c.id===op.clienteId)
    return { ...op, minTrab, uds, cliente }
  }).filter(o=>o.minTrab>0||o.costoReal>0)

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Análisis de Costos</div>
      <div style={{ fontSize:12, color:'var(--ink3)' }}>Rentabilidad y control de gastos</div>

      <div className="section-label">Resumen financiero</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Facturado</div>
          <div className="stat-val" style={{ fontSize:16, color:'var(--accent)' }}>{fmtCOP(totalCotizado)}</div>
          <div className="stat-sub">{cotizaciones.filter(c=>c.estado==='aprobada').length} OP(s)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Costo real</div>
          <div className="stat-val" style={{ fontSize:16, color: totalCostoReal>totalEstimado?'var(--danger)':'var(--ink)' }}>{fmtCOP(totalCostoReal)}</div>
          <div className="stat-sub">estimado {fmtCOP(totalEstimado)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Margen real</div>
          <div className="stat-val" style={{ color: margenReal>=30?'var(--accent)':margenReal>=15?'var(--warn)':'var(--danger)' }}>{margenReal}%</div>
          <div className="progress-bar" style={{ marginTop:6 }}>
            <div className="progress-fill" style={{ width:margenReal+'%', background: margenReal>=30?'var(--accent)':margenReal>=15?'var(--warn)':'var(--danger)' }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Eficiencia</div>
          <div className="stat-val">{(minDir+minParo)>0?Math.round(minDir/(minDir+minParo)*100):0}%</div>
          <div className="stat-sub">tiempo productivo</div>
        </div>
      </div>

      <div className="section-label">Producción del período</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tiempo directo</div>
          <div className="stat-val" style={{ fontSize:16 }}>{fmtMin(minDir)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unidades</div>
          <div className="stat-val" style={{ fontSize:16 }}>{totProd.toLocaleString()}</div>
        </div>
      </div>

      {costosPorOP.length > 0 && (
        <>
          <div className="section-label">Costo por orden</div>
          {costosPorOP.map(op => (
            <div key={op.id} className="card" style={{ padding:'0.875rem 1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:13 }}>{op.id}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)' }}>{op.cliente?.nombre}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4 }}>
                    {fmtMin(op.minTrab)} trabajados · {op.uds.toLocaleString()} uds
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{fmtCOP(op.costoReal)}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)' }}>est. {fmtCOP(op.costoEstimado||0)}</div>
                  {op.costoReal > 0 && op.costoEstimado > 0 && (
                    <div style={{ fontSize:11, color: op.costoReal<=op.costoEstimado?'var(--accent)':'var(--danger)' }}>
                      {op.costoReal<=op.costoEstimado?'✓ Dentro del presupuesto':'⚠ Sobre presupuesto'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {costosPorOP.length===0 && (
        <div className="empty-state"><i className="ti ti-chart-pie" /><br/>Los costos aparecerán cuando los operarios registren actividades en órdenes de producción.</div>
      )}
    </>
  )
}
