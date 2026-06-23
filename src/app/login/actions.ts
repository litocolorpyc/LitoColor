"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setSesion } from "@/lib/auth/sesion";

// Acceso liviano, sin contraseña: el operario solo selecciona su nombre.
// Quién ve además el panel de administración (Órdenes, Tableros,
// Catálogos) lo decide el campo `operarios.es_admin`, editable desde
// Catálogos → Operarios. Ya no se adivina a partir del texto de `cargo`.

export async function iniciarSesion(formData: FormData) {
  const operarioId = String(formData.get("operario_id") ?? "");

  if (!operarioId) {
    redirect("/login?error=Selecciona+tu+nombre");
  }

  const supabase = supabaseAdmin();
  const { data: operario, error } = await supabase
    .from("operarios")
    .select("id, nombre, es_admin, activo")
    .eq("id", operarioId)
    .single();

  if (error || !operario || !operario.activo) {
    redirect("/login?error=Operario+no+encontrado+o+inactivo");
  }

  await setSesion({
    operarioId: operario!.id,
    nombre: operario!.nombre,
    esAdmin: Boolean(operario!.es_admin),
  });

  redirect("/registro");
}
