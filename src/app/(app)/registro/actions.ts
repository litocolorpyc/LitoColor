"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSesion } from "@/lib/auth/sesion";

export async function buscarSubordenes(query: string) {
  if (!query || query.trim().length < 1) return [];
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("v_subordenes_buscador")
    .select("id, opp, cliente, pieza, producto, numero_orden")
    .or(
      `opp.ilike.%${query}%,cliente.ilike.%${query}%,pieza.ilike.%${query}%,producto.ilike.%${query}%`
    )
    .limit(15);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export async function crearRegistro(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const supabase = supabaseAdmin();

  const fecha = String(formData.get("fecha"));
  const horaInicio = String(formData.get("hora_inicio"));
  const horaFin = String(formData.get("hora_fin"));
  const actividadId = String(formData.get("actividad_id"));
  const subordenId = String(formData.get("suborden_id") || "") || null;
  const maquinaId = String(formData.get("maquina_id") || "") || null;
  const cantidadTexto = String(formData.get("cantidad_producida_texto") || "");
  const cantidadNum = formData.get("cantidad_producida_num");
  const reproceso = formData.get("reproceso") === "si";
  const comentario = String(formData.get("comentario") || "");
  const materiaPrima = String(formData.get("materia_prima") || "");
  const consumoMateriaPrima = String(formData.get("consumo_materia_prima") || "");
  const remision = String(formData.get("remision") || "");
  const cantidadDespachada = formData.get("cantidad_despachada");
  const cantidadInventario = formData.get("cantidad_inventario");

  if (!fecha || !horaInicio || !horaFin || !actividadId) {
    redirect("/registro?error=Completa+fecha%2C+horas+y+actividad");
  }

  const { error } = await supabase.from("registros_produccion").insert({
    fecha,
    operario_id: sesion!.operarioId,
    suborden_id: subordenId,
    actividad_id: actividadId,
    maquina_id: maquinaId,
    hora_inicio: `${fecha}T${horaInicio}:00`,
    hora_fin: `${fecha}T${horaFin}:00`,
    cantidad_producida_texto: cantidadTexto || null,
    cantidad_producida_num: cantidadNum ? Number(cantidadNum) : null,
    reproceso,
    comentario: comentario || null,
    materia_prima: materiaPrima || null,
    consumo_materia_prima: consumoMateriaPrima || null,
    remision: remision || null,
    cantidad_despachada: cantidadDespachada ? Number(cantidadDespachada) : null,
    cantidad_inventario: cantidadInventario ? Number(cantidadInventario) : null,
  });

  if (error) {
    console.error(error);
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/registro");
  redirect("/registro?ok=1");
}
