"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSesion } from "@/lib/auth/sesion";

export async function buscarSubordenes(query: string) {
  const supabase = supabaseAdmin();
  const texto = query.trim();

  let consulta = supabase
    .from("v_subordenes_buscador")
    .select("id, opp, cliente, pieza, producto, numero_orden")
    .order("numero_orden", { ascending: false })
    .limit(50);

  if (texto.length > 0) {
    consulta = consulta.or(
      `opp.ilike.%${texto}%,cliente.ilike.%${texto}%,pieza.ilike.%${texto}%,producto.ilike.%${texto}%`
    );
  }

  const { data, error } = await consulta;

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

  const horaInicioIso = String(formData.get("hora_inicio_iso") || "");
  const horaFinIso = String(formData.get("hora_fin_iso") || "");
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

  if (!horaInicioIso || !horaFinIso || !actividadId) {
    redirect(
      "/registro?error=Falta+marcar+Iniciar%2FFinalizar+o+seleccionar+la+actividad"
    );
  }

  const fecha = horaInicioIso.slice(0, 10);

  const { error } = await supabase.from("registros_produccion").insert({
    fecha,
    operario_id: sesion!.operarioId,
    suborden_id: subordenId,
    actividad_id: actividadId,
    maquina_id: maquinaId,
    hora_inicio: horaInicioIso,
    hora_fin: horaFinIso,
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
