import React, { useState } from 'react'
import { useApp } from '../App'

export default function Login() {
  const { login } = useApp()
  const [pin, setPin]   = useState('')
  const [err, setErr]   = useState('')
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

  function del() { setPin(p => p.slice(0, -1)); setErr('') }

  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'100dvh',
      padding:'2rem 1.5rem', gap:'1.5rem',
      background:'var(--surface2)', maxWidth:420, margin:'0 auto'
    }}>
      {/* Logo */}
      <div style={{
        width:68, height:68, background:'var(--accent)',
        borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <i className="ti ti-printer" style={{fontSize:34,color:'#fff'}} aria-hidden="true" />
      </div>

      <div style={{textAlign:'center'}}>
        <div style={{fontSize:22,fontWeight:500}}>Litocolor</div>
        <div style={{fontSize:14,color:'var(--ink2)',marginTop:4}}>Control de Producción</div>
      </div>

      {/* Dots */}
      <div style={{display:'flex',gap:12,justifyContent:'center'}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:16, height:16, borderRadius:'50%',
            border:`2px solid ${pin.length > i ? 'var(--accent)' : 'var(--border2)'}`,
            background: pin.length > i ? 'var(--accent)' : 'transparent',
            transition:'all 0.12s',
            transform: shake ? 'translateX(4px)' : 'none',
          }} />
        ))}
      </div>

      <div style={{fontSize:13,color:'var(--danger)',minHeight:18}}>{err}</div>

      {/* Numpad */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,width:'100%',maxWidth:280}}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))} style={{
            padding:'1rem', fontSize:22, fontWeight:500,
            background:'var(--surface)', border:'0.5px solid var(--border)',
            borderRadius:'var(--rad)', color:'var(--ink)', cursor:'pointer',
            fontFamily:'inherit',
          }}>{n}</button>
        ))}
        <div />
        <button onClick={() => press('0')} style={{
          padding:'1rem', fontSize:22, fontWeight:500,
          background:'var(--surface)', border:'0.5px solid var(--border)',
          borderRadius:'var(--rad)', color:'var(--ink)', cursor:'pointer',
          fontFamily:'inherit',
        }}>0</button>
        <button onClick={del} style={{
          padding:'1rem', fontSize:18,
          background:'var(--surface)', border:'0.5px solid var(--border)',
          borderRadius:'var(--rad)', color:'var(--ink2)', cursor:'pointer',
        }}>
          <i className="ti ti-backspace" aria-hidden="true" />
        </button>
      </div>

      <div style={{fontSize:12,color:'var(--ink3)',textAlign:'center'}}>
        Ingresa tu PIN de 4 dígitos
      </div>
    </div>
  )
}
