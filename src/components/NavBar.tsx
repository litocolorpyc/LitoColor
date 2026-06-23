import Link from "next/link";
import { getSesion } from "@/lib/auth/sesion";
import { cerrarSesionAction } from "@/app/(app)/actions";

export async function NavBar() {
  const sesion = await getSesion();

  return (
    <header className="bg-ink text-paper">
      <div className="registro-bar">
        <span /><span /><span /><span />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight">LitoColor</span>
          <nav className="hidden sm:flex gap-4 text-sm text-paper/80">
            <Link href="/registro" className="hover:text-paper">Registrar tiempo</Link>
            {sesion?.esAdmin && (
              <>
                <Link href="/ordenes" className="hover:text-paper">Órdenes (crear / avance)</Link>
                <Link href="/dashboard" className="hover:text-paper">Tableros</Link>
                <Link href="/catalogos" className="hover:text-paper">Catálogos (maestros)</Link>
              </>
            )}
          </nav>
        </div>
        {sesion && (
          <form action={cerrarSesionAction} className="flex items-center gap-3">
            <span className="text-sm text-paper/70">{sesion.nombre}</span>
            <button className="text-sm underline text-paper/70 hover:text-paper" type="submit">
              Salir
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
