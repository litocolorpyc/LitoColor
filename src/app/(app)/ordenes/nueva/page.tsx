import { crearOrden } from "../actions";

export default async function NuevaOrdenPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Nueva orden de producción</h1>

      {error && (
        <div className="card p-3 mb-4 border-danger text-danger bg-red-50">{error}</div>
      )}

      <form action={crearOrden} className="card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Número de orden</label>
          <input
            type="number"
            name="numero_orden"
            required
            className="input-field w-full codigo"
            placeholder="ej. 5944"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <input
            type="text"
            name="cliente"
            required
            className="input-field w-full"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" name="fecha" defaultValue={hoy} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción general</label>
          <textarea name="descripcion_general" rows={3} className="input-field w-full" />
        </div>
        <button type="submit" className="btn-accent w-full py-3">
          Crear orden
        </button>
      </form>
    </div>
  );
}
