import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function getUsuarios() {
  const { data } = await supabase.from('usuarios').select('*').eq('activo', true)
  return data || []
}

export async function getCotizaciones() {
  const { data } = await supabase.from('cotizaciones').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function saveCotizacion(c) {
  const { data } = await supabase.from('cotizaciones').upsert(c).select().single()
  return data
}

export async function getOPs() {
  const { data } = await supabase.from('ops').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function saveOP(op) {
  const { data } = await supabase.from('ops').upsert(op).select().single()
  return data
}

export async function updateOP(id, changes) {
  const { data } = await supabase.from('ops').update(changes).eq('id', id).select().single()
  return data
}

export async function getRegistros(fecha) {
  const { data } = await supabase.from('registros').select('*').eq('fecha', fecha).order('created_at', { ascending: false })
  return data || []
}

export async function saveRegistro(r) {
  const { data } = await supabase.from('registros').insert(r).select().single()
  return data
}

export async function getConsumos(fecha) {
  const { data } = await supabase.from('consumos').select('*').eq('fecha', fecha)
  return data || []
}

export async function saveConsumo(c) {
  const { data } = await supabase.from('consumos').insert(c).select().single()
  return data
}

export async function getClientes() {
  const { data } = await supabase.from('clientes').select('*').order('nombre')
  return data || []
}
