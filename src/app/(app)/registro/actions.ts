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

// Inicia una tarea: queda guardada en la base de datos de inmediato,
// con hora_fin en null. Por eso sobrevive a que se cierre el navegador
// y permite que un mismo operario tenga varias tareas corriendo a la
// vez (cada una se finaliza por separado).
export async function iniciarTarea(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const supabase = supabaseAdmin();

  const fecha = String(formData.get("fecha") || new Date().toISOString().slice(0, 10));
  const actividadId = String(formData.get("actividad_id") || "");
  const subordenId = String(formData.get("suborden_id") || "") || null;
  const maquinaId = String(formData.get("maquina_id") || "") || null;

  if (!actividadId) {
    redirect("/registro?error=Selecciona+la+actividad+antes+de+iniciar");
  }

  const { error } = await supabase.from("registros_produccion").insert({
    fecha,
    operario_id: sesion!.operarioId,
    suborden_id: subordenId,
    actividad_id: actividadId,
    maquina_id: maquinaId,
    hora_inicio: new Date().toISOString(),
    hora_fin: null,
  });

  if (error) {
    console.error(error);
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/registro");
  redirect("/registro?iniciado=1");
}

// Finaliza una tarea ya iniciada: completa hora_fin y los datos que
// solo se conocen al terminar (cantidad, reproceso, materia prima...).
export async function finalizarTarea(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const supabase = supabaseAdmin();
  const registroId = String(formData.get("registro_id") || "");

  if (!registroId) {
    redirect("/registro?error=No+se+encontró+la+tarea+a+finalizar");
  }

  const cantidadTexto = String(formData.get("cantidad_producida_texto") || "");
  const cantidadNum = formData.get("cantidad_producida_num");
  const reproceso = formData.get("reproceso") === "si";
  const comentario = String(formData.get("comentario") || "");
  const materiaPrima = String(formData.get("materia_prima") || "");
  const consumoMateriaPrima = String(formData.get("consumo_materia_prima") || "");
  const remision = String(formData.get("remision") || "");
  const cantidadDespachada = formData.get("cantidad_despachada");
  const cantidadInventario = formData.get("cantidad_inventario");

  const { error } = await supabase
    .from("registros_produccion")
    .update({
      hora_fin: new Date().toISOString(),
      cantidad_producida_texto: cantidadTexto || null,
      cantidad_producida_num: cantidadNum ? Number(cantidadNum) : null,
      reproceso,
      comentario: comentario || null,
      materia_prima: materiaPrima || null,
      consumo_materia_prima: consumoMateriaPrima || null,
      remision: remision || null,
      cantidad_despachada: cantidadDespachada ? Number(cantidadDespachada) : null,
      cantidad_inventario: cantidadInventario ? Number(cantidadInventario) : null,
    })
    .eq("id", registroId)
    .eq("operario_id", sesion!.operarioId); // nadie finaliza tareas de otro operario

  if (error) {
    console.error(error);
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/registro");
  redirect("/registro?ok=1");
}

// Por si el operario se equivocó al iniciar (actividad/OPP incorrectos):
// permite cancelar una tarea iniciada sin que quede como un registro
// finalizado con datos vacíos.
export async function cancelarTarea(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const supabase = supabaseAdmin();
  const registroId = String(formData.get("registro_id") || "");

  await supabase
    .from("registros_produccion")
    .delete()
    .eq("id", registroId)
    .eq("operario_id", sesion!.operarioId)
    .is("hora_fin", null);

  revalidatePath("/registro");
  redirect("/registro?cancelado=1");
}
