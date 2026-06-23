"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CATALOGOS } from "@/lib/catalogos/config";

function configOConError(slug: string) {
  const config = CATALOGOS[slug];
  if (!config) throw new Error(`Catálogo desconocido: ${slug}`);
  return config;
}

function valoresDesdeFormulario(formData: FormData, config: ReturnType<typeof configOConError>) {
  const valores: Record<string, string | number | boolean | null> = {};
  for (const campo of config.campos) {
    if (campo.type === "boolean") {
      valores[campo.key] = formData.get(campo.key) === "on";
      continue;
    }
    const raw = formData.get(campo.key);
    if (raw === null || raw === "") {
      valores[campo.key] = null;
      continue;
    }
    valores[campo.key] = campo.type === "number" || campo.type === "fk" ? Number(raw) : String(raw);
  }
  // Para "actividades" generamos codigo_actividad automáticamente,
  // para que coincida con lo que ya usan ("1503 - Plastificar") sin
  // que el usuario tenga que escribirlo dos veces.
  if (config.tabla === "actividades") {
    valores["codigo_actividad"] = `${valores["codigo"]} - ${valores["nombre"]}`;
  }
  return valores;
}

export async function crearItemCatalogo(slug: string, formData: FormData) {
  const config = configOConError(slug);
  const valores = valoresDesdeFormulario(formData, config);

  const { error } = await supabaseAdmin().from(config.tabla).insert(valores);

  if (error) {
    redirect(`/catalogos/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/catalogos/${slug}`);
  redirect(`/catalogos/${slug}?ok=1`);
}

export async function actualizarItemCatalogo(slug: string, id: string, formData: FormData) {
  const config = configOConError(slug);
  const valores = valoresDesdeFormulario(formData, config);

  const { error } = await supabaseAdmin().from(config.tabla).update(valores).eq("id", id);

  if (error) {
    redirect(`/catalogos/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/catalogos/${slug}`);
  redirect(`/catalogos/${slug}?ok=1`);
}

export async function cambiarActivoCatalogo(slug: string, id: string, activo: boolean) {
  const config = configOConError(slug);

  const { error } = await supabaseAdmin().from(config.tabla).update({ activo }).eq("id", id);

  if (error) {
    redirect(`/catalogos/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/catalogos/${slug}`);
  redirect(`/catalogos/${slug}?ok=1`);
}
