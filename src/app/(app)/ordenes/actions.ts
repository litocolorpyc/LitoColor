"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function crearOrden(formData: FormData) {
  const supabase = supabaseAdmin();
  const numeroOrden = Number(formData.get("numero_orden"));
  const clienteNombre = String(formData.get("cliente") || "").trim();
  const fecha = String(formData.get("fecha"));
  const descripcion = String(formData.get("descripcion_general") || "");

  if (!numeroOrden || !clienteNombre) {
    redirect("/ordenes/nueva?error=Falta+número+de+orden+o+cliente");
  }

  let { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("nombre", clienteNombre)
    .maybeSingle();

  if (!cliente) {
    const { data: nuevo, error: errCliente } = await supabase
      .from("clientes")
      .insert({ nombre: clienteNombre })
      .select("id")
      .single();
    if (errCliente) redirect(`/ordenes/nueva?error=${encodeURIComponent(errCliente.message)}`);
    cliente = nuevo;
  }

  const { data: orden, error } = await supabase
    .from("ordenes")
    .insert({
      numero_orden: numeroOrden,
      cliente_id: cliente!.id,
      fecha: fecha || new Date().toISOString().slice(0, 10),
      descripcion_general: descripcion || null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/ordenes/nueva?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/ordenes");
  redirect(`/ordenes/${orden!.id}`);
}

export async function crearSuborden(formData: FormData) {
  const supabase = supabaseAdmin();
  const ordenId = String(formData.get("orden_id"));
  const numeroOrden = String(formData.get("numero_orden"));
  const numeroSuborden = Number(formData.get("numero_suborden"));
  const producto = String(formData.get("producto") || "");
  const pieza = String(formData.get("pieza") || "");
  const cantidadSolicitada = formData.get("cantidad_solicitada");
  const cantidadProgramada = formData.get("cantidad_programada");
  const tintasTiro = formData.get("tintas_tiro");
  const tintasRetiro = formData.get("tintas_retiro");
  const notasAcabados = String(formData.get("notas_acabados") || "");
  const tiposAcabadoIds = formData.getAll("tipos_acabado_id").map(String).filter(Boolean);

  const { data: suborden, error } = await supabase
    .from("subordenes")
    .insert({
      orden_id: ordenId,
      numero_suborden: numeroSuborden,
      opp: `${numeroOrden}-${numeroSuborden}`,
      producto: producto || null,
      pieza: pieza || null,
      cantidad_solicitada: cantidadSolicitada ? Number(cantidadSolicitada) : null,
      cantidad_programada: cantidadProgramada ? Number(cantidadProgramada) : null,
      tintas_tiro: tintasTiro ? Number(tintasTiro) : null,
      tintas_retiro: tintasRetiro ? Number(tintasRetiro) : null,
      acabados: notasAcabados ? { notas: notasAcabados } : {},
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/ordenes/${ordenId}?error=${encodeURIComponent(error.message)}`);
  }

  if (tiposAcabadoIds.length) {
    const filas = tiposAcabadoIds.map((tipoAcabadoId) => ({
      suborden_id: suborden!.id,
      tipo_acabado_id: tipoAcabadoId,
    }));
    const { error: errAcabados } = await supabase.from("subordenes_acabados").insert(filas);
    if (errAcabados) {
      redirect(`/ordenes/${ordenId}?error=${encodeURIComponent(errAcabados.message)}`);
    }
  }

  revalidatePath(`/ordenes/${ordenId}`);
  redirect(`/ordenes/${ordenId}`);
}

export async function cerrarOrden(formData: FormData) {
  const ordenId = String(formData.get("orden_id"));
  const supabase = supabaseAdmin();

  const { error } = await supabase.rpc("fn_cerrar_orden", { p_orden_id: ordenId });

  if (error) {
    redirect(`/ordenes/${ordenId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/ordenes/${ordenId}`);
  redirect(`/ordenes/${ordenId}`);
}
