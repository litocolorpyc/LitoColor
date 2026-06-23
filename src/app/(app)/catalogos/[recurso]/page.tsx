import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CATALOGOS, type CampoConfig } from "@/lib/catalogos/config";
import {
  crearItemCatalogo,
  actualizarItemCatalogo,
  cambiarActivoCatalogo,
} from "../actions";

type Fila = Record<string, unknown>;

async function cargarOpcionesFk(campo: CampoConfig) {
  if (campo.type !== "fk" || !campo.fkTabla) return [];
  const { data } = await supabaseAdmin()
    .from(campo.fkTabla)
    .select(`id, ${campo.fkEtiqueta ?? "nombre"}`)
    .order(campo.fkEtiqueta ?? "nombre");
  return (data ?? []) as unknown as { id: string; [k: string]: unknown }[];
}

export default async function CatalogoRecursoPage({
  params,
  searchParams,
}: {
  params: Promise<{ recurso: string }>;
  searchParams: Promise<{ error?: string; ok?: string; editar?: string }>;
}) {
  const { recurso } = await params;
  const { error, ok, editar } = await searchParams;
  const config = CATALOGOS[recurso];
  if (!config) notFound();

  const supabase = supabaseAdmin();

  const selectCols = config.campos.map((c) => c.key).join(", ");
  const { data: filas } = await supabase
    .from(config.tabla)
    .select(`id, ${selectCols}, activo`)
    .order(config.ordenarPor);

  const opcionesFk: Record<string, { id: string; [k: string]: unknown }[]> = {};
  for (const campo of config.campos) {
    if (campo.type === "fk") {
      opcionesFk[campo.key] = (await cargarOpcionesFk(campo)) as { id: string }[];
    }
  }

  const filaEnEdicion = editar ? (filas as Fila[] | null)?.find((f) => f.id === editar) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/catalogos" className="text-sm text-text-muted hover:underline">
          ← Todos los catálogos
        </Link>
        <h1 className="text-2xl font-bold mt-1">{config.titulo}</h1>
        <p className="text-text-muted">{config.descripcion}</p>
      </div>

      {error && <div className="card p-3 border-danger text-danger bg-red-50">{error}</div>}
      {ok && <div className="card p-3 border-ok text-ok bg-green-50">Guardado correctamente.</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              {config.campos.map((c) => (
                <th key={c.key} className="px-3 py-2">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(filas as Fila[] | null)?.map((fila) => (
              <tr key={String(fila.id)} className="border-b border-line last:border-0">
                {config.campos.map((c) => (
                  <td key={c.key} className="px-3 py-2">
                    {c.type === "fk"
                      ? opcionesFk[c.key]?.find((o) => o.id === fila[c.key])?.[c.fkEtiqueta ?? "nombre"] as string ?? "—"
                      : c.type === "boolean"
                      ? (fila[c.key] ? "Sí" : "No")
                      : (fila[c.key] as string) ?? "—"}
                  </td>
                ))}
                <td className="px-3 py-2">{fila.activo ? "Sí" : "No"}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/catalogos/${recurso}?editar=${fila.id}`}
                    className="text-accent text-sm underline mr-3"
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await cambiarActivoCatalogo(recurso, String(fila.id), !fila.activo);
                    }}
                    className="inline"
                  >
                    <button type="submit" className="text-sm underline text-text-muted">
                      {fila.activo ? "Retirar" : "Reactivar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!filas?.length && (
              <tr>
                <td colSpan={config.campos.length + 2} className="px-3 py-4 text-text-muted text-center">
                  Aún no hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-5 max-w-lg">
        <h2 className="font-semibold mb-4">
          {filaEnEdicion ? "Editar registro" : "Agregar nuevo"}
        </h2>
        <form
          action={
            filaEnEdicion
              ? async (formData: FormData) => {
                  "use server";
                  await actualizarItemCatalogo(recurso, String(filaEnEdicion.id), formData);
                }
              : async (formData: FormData) => {
                  "use server";
                  await crearItemCatalogo(recurso, formData);
                }
          }
          className="space-y-4"
        >
          {config.campos.map((campo) => (
            <div key={campo.key}>
              <label className="block text-sm font-medium mb-1">{campo.label}</label>
              {campo.type === "fk" ? (
                <select
                  name={campo.key}
                  required={campo.requerido}
                  defaultValue={(filaEnEdicion?.[campo.key] as string) ?? ""}
                  className="input-field w-full"
                >
                  <option value="" disabled>
                    Selecciona {campo.label.toLowerCase()}
                  </option>
                  {opcionesFk[campo.key]?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o[campo.fkEtiqueta ?? "nombre"] as string}
                    </option>
                  ))}
                </select>
              ) : campo.type === "boolean" ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={campo.key}
                    defaultChecked={Boolean(filaEnEdicion?.[campo.key])}
                  />
                  <span className="text-sm text-text-muted">Sí</span>
                </label>
              ) : (
                <input
                  type={campo.type === "number" ? "number" : "text"}
                  step={campo.type === "number" ? "0.01" : undefined}
                  name={campo.key}
                  required={campo.requerido}
                  defaultValue={(filaEnEdicion?.[campo.key] as string) ?? ""}
                  className="input-field w-full"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <button type="submit" className="btn-accent px-5 py-2">
              {filaEnEdicion ? "Guardar cambios" : "Agregar"}
            </button>
            {filaEnEdicion && (
              <Link href={`/catalogos/${recurso}`} className="px-5 py-2 text-text-muted">
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
