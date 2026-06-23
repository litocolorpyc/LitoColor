"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { buscarSubordenes } from "@/app/(app)/registro/actions";

type Resultado = {
  id: string;
  opp: string;
  cliente: string | null;
  pieza: string | null;
  producto: string | null;
  numero_orden: number;
};

export function BuscadorOPP({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Resultado | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [pending, startTransition] = useTransition();

  const queryLimpia = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (seleccionado || queryLimpia.length < 1) return;

    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarSubordenes(queryLimpia);
        setResultados(r);
        setAbierto(true);
      });
    }, 250);

    return () => clearTimeout(t);
  }, [queryLimpia, seleccionado]);

  return (
    <div className="relative">
      <input type="hidden" name={name} value={seleccionado?.id ?? ""} />
      <input
        className="input-field w-full"
        placeholder="Busca por cliente, OPP o producto…"
        value={seleccionado ? `${seleccionado.opp} — ${seleccionado.cliente ?? ""}` : query}
        onChange={(e) => {
          setSeleccionado(null);
          setResultados([]);
          setQuery(e.target.value);
        }}
        onFocus={() => resultados.length > 0 && setAbierto(true)}
      />
      {seleccionado && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted underline"
          onClick={() => {
            setSeleccionado(null);
            setQuery("");
          }}
        >
          cambiar
        </button>
      )}
      {abierto && !seleccionado && (
        <ul className="absolute z-10 mt-1 w-full card max-h-64 overflow-auto shadow-lg">
          {pending && <li className="px-3 py-2 text-sm text-text-muted">Buscando…</li>}
          {!pending && resultados.length === 0 && queryLimpia.length > 0 && (
            <li className="px-3 py-2 text-sm text-text-muted">
              Sin coincidencias. Esta labor puede quedar sin OPP (ej. aseo, espera).
            </li>
          )}
          {resultados.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent-soft border-b border-line last:border-0"
                onClick={() => {
                  setSeleccionado(r);
                  setAbierto(false);
                }}
              >
                <span className="codigo font-semibold">{r.opp}</span>{" "}
                <span className="text-sm text-text-muted">
                  {r.cliente} · {r.producto || r.pieza}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
