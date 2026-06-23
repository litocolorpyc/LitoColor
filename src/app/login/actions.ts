"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setSesion } from "@/lib/auth/sesion";

// Acceso liviano, sin contraseña: el operario solo selecciona su nombre.
// Pensado para tablets/equipos compartidos dentro de la planta. El campo
// `cargo` decide si ve además el panel de administración.
const CARGOS_ADMIN = ["Administrador", "Jefe de Producción", "Producción"];

export async function iniciarSesion(formData: FormData) {
  const operarioId = String(formData.get("operario_id") ?? "");

  if (!operarioId) {
    redirect("/login?error=Selecciona+tu+nombre");
  }

  const supabase = supabaseAdmin();
  const { data: operario, error } = await supabase
    .from("operarios")
    .select("id, nombre, cargo, activo")
    .eq("id", operarioId)
    .single();

  if (error || !operario || !operario.activo) {
    redirect("/login?error=Operario+no+encontrado+o+inactivo");
  }

  await setSesion({
    operarioId: operario!.id,
    nombre: operario!.nombre,
    esAdmin: CARGOS_ADMIN.includes(operario!.cargo ?? ""),
  });

  redirect("/registro");
}
