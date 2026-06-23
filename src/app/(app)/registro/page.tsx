import { supabaseAdmin } from "@/lib/supabase/admin";
import { FormularioRegistro } from "@/components/FormularioRegistro";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = supabaseAdmin();

  const { data: actividades } = await supabase
    .from("actividades")
    .select("id, codigo_actividad")
    .eq("activo", true)
    .order("codigo_actividad");

  const { data: maquinas } = await supabase
    .from("maquinas")
    .select("id, codigo, nombre")
    .eq("activo", true)
    .order("codigo");

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Registrar tiempo</h1>
      <p className="text-text-muted mb-6">
        Marca &quot;Iniciar&quot; cuando empieces la labor y &quot;Finalizar&quot; cuando termines — el tiempo
        queda marcado al segundo.
      </p>

      {ok && (
        <div className="card p-3 mb-4 border-ok text-ok bg-green-50">
          Registro guardado correctamente.
        </div>
      )}
      {error && (
        <div className="card p-3 mb-4 border-danger text-danger bg-red-50">
          {error}
        </div>
      )}

      <FormularioRegistro actividades={actividades ?? []} maquinas={maquinas ?? []} />
    </div>
  );
}
