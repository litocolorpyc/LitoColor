import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  getUsuarios, getCotizaciones, getOPs, getRegistros, getConsumos, getClientes,
  saveCotizacion, saveOP, updateOP as updateOPdb, saveRegistro, saveConsumo
} from './lib/supabase'
import { genCod, todayISO } from './lib/data'
import Login from './pages/Login'
import ShellGerente  from './pages/gerente/Shell'
import ShellJP       from './pages/jp/Shell'
import ShellOperario from './pages/operario/Shell'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export default function App() {
  const [usuario,      setUsuario]      = useState(null)
  const [usuarios,     setUsuarios]     = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [ops,          setOps]          = useState([])
  const [registros,    setRegistros]    = useState([])
  const [consumos,     setConsumos]     = useState([])
  const [clientes,     setClientes]     = useState([])
  const [cargando,     setCargando]     = useState(true)

  // Cargar datos al iniciar
  useEffect(() => {
    async function cargar() {
      const [u, cots, opsData, regs, cons, clis] = await Promise.all([
        getUsuarios(),
        getCotizaciones(),
        getOPs(),
        getRegistros(todayISO()),
        getConsumos(todayISO()),
        getClientes(),
      ])
      setUsuarios(u)
      setCotizaciones(cots)
      setOps(opsData)
      setRegistros(regs)
      setConsumos(cons)
      setClientes(clis)
      setCargando(false)
    }
    cargar()
  }, [])

  function login(pin) {
    const u = usuarios.find(u => u.pin === pin && u.activo)
    if (u) { setUsuario(u); return true }
    return false
  }
  function logout() { setUsuario(null) }

  async function addCotizacion(c) {
    const nueva = { ...c, id: genCod('COT'), fecha: todayISO(), estado: 'cotizacion' }
    const guardada = await saveCotizacion(nueva)
    if (guardada) setCotizaciones(p => [guardada, ...p])
  }

  async function updateCotizacion(id, changes) {
    await saveCotizacion({ id, ...changes })
    setCotizaciones(p => p.map(c => c.id === id ? { ...c, ...changes } : c))
  }

  async function addOP(op) {
    const nueva = { ...op, id: genCod('OP'), costo_real: 0, progreso: 0 }
    const guardada = await saveOP(nueva)
    if (guardada) setOps(p => [guardada, ...p])
  }

  async function updateOPLocal(id, changes) {
    await updateOPdb(id, changes)
    setOps(p => p.map(o => o.id === id ? { ...o, ...changes } : o))
  }

  async function addRegistro(r) {
    const nuevo = {
      ...r,
      fecha: todayISO(),
      operario_id: usuario?.id,
      operario_nombre: usuario?.nombre,
      hora_inicio: r.inicio || null,
      hora_fin: r.fin || null,
      dur_min: r.durMin || null,
      op_id: r.opId || null,
    }
    const guardado = await saveRegistro(nuevo)
    if (guardado) {
      setRegistros(p => [guardado, ...p])
      // Actualizar costo real en OP
      if (r.opId && r.durMin) {
        const op = ops.find(o => o.id === r.opId)
        if (op) {
          const costoHH = (usuario?.valor_hora || 0) * (r.durMin / 60)
          await updateOPLocal(r.opId, { costo_real: (op.costo_real || 0) + costoHH })
        }
      }
    }
  }

  function delRegistro(id) {
    setRegistros(p => p.filter(r => r.id !== id))
  }

  async function addConsumo(c) {
    const nuevo = { ...c, fecha: todayISO(), operario_id: usuario?.id }
    const guardado = await saveConsumo(nuevo)
    if (guardado) setConsumos(p => [guardado, ...p])
  }

  function RoleRouter() {
    if (!usuario) return <Navigate to="/login" replace />
    if (usuario.rol === 'gerente')  return <Navigate to="/gerente"  replace />
    if (usuario.rol === 'jp')       return <Navigate to="/jp"       replace />
    return <Navigate to="/operario" replace />
  }

  if (cargando) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', gap:16, background:'#f5f5f3' }}>
        <div style={{ width:48, height:48, background:'#1D9E75', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-printer" style={{ fontSize:24, color:'#fff' }} />
        </div>
        <div style={{ fontSize:14, color:'#888' }}>Cargando Litocolor...</div>
      </div>
    )
  }

  const ctx = {
    usuario, login, logout,
    usuarios, clientes,
    cotizaciones, addCotizacion, updateCotizacion,
    ops, addOP, updateOP: updateOPLocal,
    registros, addRegistro, delRegistro,
    consumos, addConsumo,
  }

  return (
    <AppCtx.Provider value={ctx}>
      <Routes>
        <Route path="/login"      element={!usuario ? <Login /> : <RoleRouter />} />
        <Route path="/"           element={<RoleRouter />} />
        <Route path="/gerente/*"  element={usuario?.rol==='gerente'  ? <ShellGerente />  : <Navigate to="/login" replace />} />
        <Route path="/jp/*"       element={usuario?.rol==='jp'       ? <ShellJP />       : <Navigate to="/login" replace />} />
        <Route path="/operario/*" element={usuario?.rol==='operario' ? <ShellOperario /> : <Navigate to="/login" replace />} />
      </Routes>
    </AppCtx.Provider>
  )
}
