import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSesion } from "@/lib/auth/sesion";
import { FormularioIniciarTarea } from "@/components/FormularioIniciarTarea";
import { TareaEnCurso } from "@/components/TareaEnCurso";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; iniciado?: string; cancelado?: string }>;
}) {
  const { error, ok, iniciado, cancelado } = await searchParams;
  const sesion = await getSesion();
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

  const { data: tareasEnCurso } = await supabase
    .from("registros_produccion")
    .select("id, hora_inicio, actividades(codigo_actividad), subordenes(opp)")
    .eq("operario_id", sesion!.operarioId)
    .is("hora_fin", null)
    .order("hora_inicio", { ascending: false });

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Registrar tiempo</h1>
        <p className="text-text-muted">
          Puedes tener varias actividades corriendo al mismo tiempo: inicia cada una por separado
          y finalízala cuando termines.
        </p>
      </div>

      {ok && <div className="card p-3 border-ok text-ok bg-green-50">Tarea finalizada y guardada.</div>}
      {iniciado && <div className="card p-3 border-ok text-ok bg-green-50">Tarea iniciada — su tiempo ya está corriendo.</div>}
      {cancelado && <div className="card p-3 text-text-muted">Tarea cancelada.</div>}
      {error && <div className="card p-3 border-danger text-danger bg-red-50">{error}</div>}

      {!!tareasEnCurso?.length && (
        <section className="space-y-3">
          <h2 className="font-semibold">Tus tareas en curso ({tareasEnCurso.length})</h2>
          {tareasEnCurso.map((t) => (
            <TareaEnCurso
              key={t.id}
              registroId={t.id}
              horaInicioIso={t.hora_inicio}
              actividad={
                (t.actividades as unknown as { codigo_actividad: string } | null)?.codigo_actividad ??
                "—"
              }
              opp={(t.subordenes as unknown as { opp: string } | null)?.opp ?? null}
            />
          ))}
        </section>
      )}

      <FormularioIniciarTarea actividades={actividades ?? []} maquinas={maquinas ?? []} />
    </div>
  );
}
