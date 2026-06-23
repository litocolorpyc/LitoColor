"use server";

import { redirect } from "next/navigation";
import { cerrarSesion } from "@/lib/auth/sesion";

export async function cerrarSesionAction() {
  await cerrarSesion();
  redirect("/login");
}
