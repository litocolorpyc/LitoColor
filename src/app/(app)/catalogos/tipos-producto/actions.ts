"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function crearTipoProducto(formData: FormData) {
  const supabase = supabaseAdmin();
  const nombre = String(formData.get("nombre") || "").trim();
  const descripcion = String(formData.get("descripcion") || "");

  if (!nombre) {
    redirect("/catalogos/tipos-producto?error=El+nombre+es+obligatorio");
  }

  const { error } = await supabase.from("tipos_producto").insert({
    nombre,
    descripcion: descripcion || null,
  });

  if (error) {
    redirect(`/catalogos/tipos-producto?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/catalogos/tipos-producto");
  redirect("/catalogos/tipos-producto?ok=1");
}

export async function cambiarActivoTipoProducto(formData: FormData) {
  const supabase = supabaseAdmin();
  const id = String(formData.get("id"));
  const activo = formData.get("activo") === "true";

  await supabase.from("tipos_producto").update({ activo: !activo }).eq("id", id);
  revalidatePath("/catalogos/tipos-producto");
  redirect("/catalogos/tipos-producto?ok=1");
}

export async function agregarPieza(formData: FormData) {
  const supabase = supabaseAdmin();
  const tipoProductoId = String(formData.get("tipo_producto_id"));
  const nombrePieza = String(formData.get("nombre_pieza") || "").trim();
  const ordenSugerido = Number(formData.get("orden_sugerido") || 0);

  if (nombrePieza) {
    await supabase.from("tipos_producto_piezas").insert({
      tipo_producto_id: tipoProductoId,
      nombre_pieza: nombrePieza,
      orden_sugerido: ordenSugerido,
    });
  }

  revalidatePath(`/catalogos/tipos-producto/${tipoProductoId}`);
  redirect(`/catalogos/tipos-producto/${tipoProductoId}`);
}

export async function quitarPieza(formData: FormData) {
  const supabase = supabaseAdmin();
  const id = String(formData.get("id"));
  const tipoProductoId = String(formData.get("tipo_producto_id"));

  await supabase.from("tipos_producto_piezas").delete().eq("id", id);

  revalidatePath(`/catalogos/tipos-producto/${tipoProductoId}`);
  redirect(`/catalogos/tipos-producto/${tipoProductoId}`);
}

export async function agregarCampo(formData: FormData) {
  const supabase = supabaseAdmin();
  const tipoProductoId = String(formData.get("tipo_producto_id"));
  const etiqueta = String(formData.get("etiqueta") || "").trim();
  const tipoDato = String(formData.get("tipo_dato") || "texto");
  const ordenSugerido = Number(formData.get("orden_sugerido") || 0);

  if (etiqueta) {
    const clave = etiqueta
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quitar tildes
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const { error } = await supabase.from("tipos_producto_campos").insert({
      tipo_producto_id: tipoProductoId,
      clave,
      etiqueta,
      tipo_dato: tipoDato,
      orden_sugerido: ordenSugerido,
    });
    if (error) {
      redirect(`/catalogos/tipos-producto/${tipoProductoId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/catalogos/tipos-producto/${tipoProductoId}`);
  redirect(`/catalogos/tipos-producto/${tipoProductoId}`);
}

export async function quitarCampo(formData: FormData) {
  const supabase = supabaseAdmin();
  const id = String(formData.get("id"));
  const tipoProductoId = String(formData.get("tipo_producto_id"));

  await supabase.from("tipos_producto_campos").delete().eq("id", id);

  revalidatePath(`/catalogos/tipos-producto/${tipoProductoId}`);
  redirect(`/catalogos/tipos-producto/${tipoProductoId}`);
}
