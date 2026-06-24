import Link from "next/link";
import { CATALOGOS } from "@/lib/catalogos/config";

export default function CatalogosPage() {
  const catalogos = Object.values(CATALOGOS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Catálogos maestros</h1>
        <p className="text-text-muted">
          Ingreso, modificación y retiro de cada lista. Los cambios aquí se reflejan de inmediato
          en los formularios de registro de tiempo y de órdenes.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/catalogos/tipos-producto"
          className="card p-5 hover:border-accent transition-colors border-accent"
        >
          <h2 className="font-semibold mb-1">Tipos de producto</h2>
          <p className="text-sm text-text-muted">
            Define las piezas y campos extra de cada producto (cuaderno, caja, afiche, mazo de
            cartas, calendario…) para que el ingreso de órdenes sea ágil.
          </p>
        </Link>
        {catalogos.map((c) => (
          <Link
            key={c.slug}
            href={`/catalogos/${c.slug}`}
            className="card p-5 hover:border-accent transition-colors"
          >
            <h2 className="font-semibold mb-1">{c.titulo}</h2>
            <p className="text-sm text-text-muted">{c.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
