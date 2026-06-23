import { cookies } from "next/headers";

const COOKIE_NAME = "lc_session";

export type Sesion = {
  operarioId: string;
  nombre: string;
  esAdmin: boolean;
};

/**
 * Sesión liviana firmada-implícitamente por estar en una cookie httpOnly
 * del propio servidor de Next. No es JWT ni Supabase Auth: para una app
 * interna de planta, el control de acceso real es "está en la red/tablet
 * de la empresa + conoce su PIN (Código de Seguridad)". Si en el futuro
 * se requiere acceso remoto o auditoría más fuerte, esto se reemplaza por
 * Supabase Auth (el campo operarios.user_id ya está previsto para eso).
 */
export async function getSesion(): Promise<Sesion | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export async function setSesion(sesion: Sesion) {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(sesion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 horas — un turno de trabajo
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
