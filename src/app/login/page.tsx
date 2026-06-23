import { supabaseAdmin } from "@/lib/supabase/admin";
import { iniciarSesion } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = supabaseAdmin();
  const { data: operarios } = await supabase
    .from("operarios")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="card overflow-hidden">
          <div className="registro-bar">
            <span /><span /><span /><span />
          </div>
          <div className="p-8">
            <p className="codigo text-xs text-text-muted mb-1">LITOCOLOR / PLANTA</p>
            <h1 className="text-2xl font-bold mb-6">Iniciar turno</h1>

            <form action={iniciarSesion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="operario_id">
                  Tu nombre
                </label>
                <select
                  id="operario_id"
                  name="operario_id"
                  required
                  className="input-field w-full"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona tu nombre
                  </option>
                  {operarios?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button type="submit" className="btn-primary w-full py-3">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
