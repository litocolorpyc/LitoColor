import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la Service Role Key. SOLO se importa desde Server
 * Actions / Route Handlers / Server Components — nunca desde código
 * que se ejecute en el navegador. Esto es lo que nos permite que las
 * policies de RLS sean restrictivas (ver supabase/migrations/0002_rls.sql)
 * y que toda escritura pase controlada por nuestras Server Actions.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
