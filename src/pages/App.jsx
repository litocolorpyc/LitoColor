import React, { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { OPERARIOS } from './lib/data'
import Login from './pages/Login'
import Shell from './components/Shell'
import Captura from './pages/Captura'
import Insumos from './pages/Insumos'
import Dashboard from './pages/Dashboard'
import Informe from './pages/Informe'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export default function App() {
  const [operario, setOperario] = useState(null)
  const [registros, setRegistros] = useState([])       // Módulo 1
  const [consumos, setConsumos]   = useState([])       // Módulo 3
  const [despachos, setDespachos] = useState([])       // Módulo 4

  function login(pin) {
    const op = OPERARIOS.find(o => o.pin === pin && o.activo)
    if (op) { setOperario(op); return true }
    return false
  }
  function logout() {
    setOperario(null)
    setRegistros([])
    setConsumos([])
    setDespachos([])
  }

  function addRegistro(r)  { setRegistros(prev => [{ ...r, id: Date.now() }, ...prev]) }
  function delRegistro(id) { setRegistros(prev => prev.filter(r => r.id !== id)) }

  function addConsumo(c)  { setConsumos(prev => [{ ...c, id: Date.now() }, ...prev]) }
  function delConsumo(id) { setConsumos(prev => prev.filter(c => c.id !== id)) }

  function addDespacho(d)  { setDespachos(prev => [{ ...d, id: Date.now() }, ...prev]) }
  function delDespacho(id) { setDespachos(prev => prev.filter(d => d.id !== id)) }

  const ctx = {
    operario, login, logout,
    registros, addRegistro, delRegistro,
    consumos,  addConsumo,  delConsumo,
    despachos, addDespacho, delDespacho,
  }

  return (
    <AppCtx.Provider value={ctx}>
      <Routes>
        <Route path="/login" element={!operario ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={operario ? <Shell /> : <Navigate to="/login" replace />}>
          <Route index          element={<Captura />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="informe"   element={<Informe />} />
        </Route>
      </Routes>
    </AppCtx.Provider>
  )
}
