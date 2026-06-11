import React, { useState } from 'react'
import { useApp } from '../App'
import { USUARIOS, ROL_COLOR, ROL_LABEL } from '../lib/data'

export default function Login() {
  const { login } = useApp()
  const [pin, setPin]     = useState('')
  const [err, setErr]     = useState('')
  const [shake, setShake] = useState(false)

  function press(d) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setErr('')
    if (next.length === 4) {
      if (!login(next)) {
        setShake(true)
        setTimeout(() => { setShake(false); setPin(''); setErr('PIN incorrecto') }, 500)
      }
    }
  }
  function del() { setPin(p => p.slice(0,-1)); setErr('') }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'2rem 1.5rem', gap:'1.25rem', background:'var(--surface2)', maxWidth:430, margin:'0 auto' }}>
      <div style={{ width:68, height:68, background:'var(--accent)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className="ti ti-printer" style={{ fontSize:34, color:'#fff' }} aria-hidden="true" />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:24, fontWeight:500 }}>Litocolor</div>
        <div style={{ fontSize:14, color:'var(--ink2)', marginTop:4 }}>Sistema de Producción</div>
      </div>

      <div style={{ display:'flex', gap:12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${pin.length>i?'var(--accent)':'var(--border2)'}`, background: pin.length>i?'var(--accent)':'transparent', transition:'all 0.12s', transform: shake?'translateX(4px)':'none' }} />
        ))}
      </div>
      <div style={{ fontSize:13, color:'var(--danger)', minHeight:18 }}>{err}</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, width:'100%', maxWidth:280 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))} style={{ padding:'1rem', fontSize:22, fontWeight:500, background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--rad)', color:'var(--ink)', cursor:'pointer', fontFamily:'inherit' }}>{n}</button>
        ))}
        <div />
        <button onClick={() => press('0')} style={{ padding:'1rem', fontSize:22, fontWeight:500, background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--rad)', color:'var(--ink)', cursor:'pointer', fontFamily:'inherit' }}>0</button>
        <button onClick={del} style={{ padding:'1rem', fontSize:18, background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--rad)', color:'var(--ink2)', cursor:'pointer' }}>
          <i className="ti ti-backspace" aria-hidden="true" />
        </button>
      </div>

      <div style={{ width:'100%', maxWidth:280 }}>
        <div style={{ fontSize:11, color:'var(--ink3)', textAlign:'center', marginBottom:10 }}>ACCESOS DEMO</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {USUARIOS.filter(u=>u.activo).slice(0,4).map(u => (
            <button key={u.id} onClick={() => press(u.pin[0]) || setPin(u.pin) || login(u.pin) && null}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0.75rem', background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--rad-sm)', cursor:'pointer', fontFamily:'inherit' }}
              onClick={() => { setPin(''); login(u.pin) }}>
              <span style={{ fontSize:13 }}>{u.nombre}</span>
              <span style={{ fontSize:11, fontWeight:500, color: ROL_COLOR[u.rol], background: u.rol==='gerente'?'var(--purple-l)':u.rol==='jp'?'var(--info-l)':'var(--accent-l)', padding:'2px 8px', borderRadius:20 }}>
                {ROL_LABEL[u.rol]} · {u.pin}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
