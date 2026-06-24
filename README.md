# LitoColor — Control de Producción

Aplicativo de control de tiempos, máquinas y costos por orden de producción.
Construido con **Next.js 16 (App Router) + Supabase (Postgres) + Vercel**.

> Cotizaciones queda fuera de alcance de esta fase (ver propuesta).

## 0. Decisiones tomadas para esta primera versión

- **Acceso sin contraseña**: el operario solo selecciona su nombre de una lista (pensado para tablets/equipos compartidos en planta). No usa Supabase Auth todavía — el campo `operarios.user_id` queda previsto para cuando se quiera migrar a login real.
- **Costo de máquina**: NO se suma en cada registro de tiempo. Se calcula **una sola vez, al cerrar la orden** (botón "Cerrar orden"), sumando todo el histórico de esa orden (`tiempo_labor_horas × maquinas.valor_hora`). El costo de mano de obra sí se calcula en vivo, registro por registro.
- **Tipos de acabado**: catálogo editable (como cualquier otra lista maestra), ya no son casillas fijas en el código. Se administran en *Catálogos → Tipos de acabado*.
- **Catálogos**: todos (Áreas, Actividades, Máquinas, Operarios, Papeles, Tipos de acabado, Clientes) tienen una pantalla genérica de **alta, edición y retiro** (retiro = desactivar, no se borra el histórico). Ver `src/lib/catalogos/config.ts` — agregar un catálogo nuevo es agregar una entrada en ese archivo.

## 1. Requisitos

- Node 20+
- Una cuenta de Supabase (ya la tienes) y un repo en GitHub + proyecto en Vercel (ya los tienes).

## 2. Configurar Supabase

1. Entra al **SQL Editor** de tu proyecto de Supabase.
2. Ejecuta, **en este orden**, los archivos de `supabase/migrations/`:
   - `0001_init.sql` — esquema completo (catálogos, órdenes, subórdenes, registros de producción, vistas de reporte).
   - `0002_rls.sql` — seguridad por fila.
   - `0003_acabados_y_cierre_orden.sql` — tipos de acabado + función de cierre de orden.
   - `0004_rls_acabados.sql` — seguridad de las tablas nuevas.
   - `0005_es_admin.sql` — bandera de administrador en operarios (reemplaza la lógica anterior por `cargo`).
   - `0006_buscador_solo_vivas.sql` — el buscador de OPP solo muestra órdenes no cerradas.
   - `0007_tipos_producto.sql` — catálogo de Tipos de Producto, sus piezas y campos personalizados.
   - `0008_rls_tipos_producto.sql` — seguridad de esas tablas nuevas.
3. Ejecuta, en este orden, los archivos de `supabase/seed/` (datos reales extraídos de tu Excel actual):
   - `0001_catalogos.sql` — áreas, actividades, máquinas, operarios, papeles.
   - `0002_ordenes_historicas.sql` — clientes y las 170 órdenes / 458 subórdenes históricas (solo cliente/producto; la ficha técnica detallada de cada una se completa desde la app si la orden sigue activa).
   - `0003_tipos_acabado.sql` — lista inicial de acabados (editable luego desde *Catálogos*).
   - `0004_tipos_producto.sql` — 3 tipos de producto de ejemplo (Cuaderno argollado, Caja plegadiza, Afiche) con sus piezas.

> Estos seeds se generaron automáticamente desde tus archivos `Reporte_Diario_de_Producción.xlsx` (hojas `Desplegables` y `Pedidos`). Se normalizaron 3 variantes de nombre de cliente con espacios/mayúsculas inconsistentes (ej. "EcoMasilla" / "Eco Masilla").

4. En **Project Settings → API**, copia la `URL` y la `service_role` key (no la `anon`).

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Repite lo mismo en Vercel → Project Settings → Environment Variables.

**Por qué Service Role y no Anon**: toda escritura pasa por Server Actions de Next.js (nunca desde el navegador), así que la app controla qué se puede insertar/editar. RLS queda como segunda capa de protección por si en el futuro se expone una API pública. Ver el comentario en `supabase/migrations/0002_rls.sql`.

## 4. Correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` — te manda a `/login`.

## 5. Desplegar

```bash
git init && git add -A && git commit -m "MVP control de producción"
git remote add origin <tu-repo-de-github>
git push -u origin main
```

Luego en Vercel: *Import Project* desde ese repo (o si ya está conectado, el push ya dispara el deploy). Configura las dos variables de entorno antes del primer deploy.

## 6. Estructura del proyecto

```
src/app/login/                  Login (selección de nombre, sin contraseña)
src/app/(app)/registro/         Registro de tiempo — reemplaza el formulario de Microsoft Forms
src/app/(app)/ordenes/          Crear orden, agregar subórdenes (ficha técnica), cerrar orden
src/app/(app)/dashboard/        Tableros (equivalente a Resumen / Horas por semana)
src/app/(app)/catalogos/        Módulo genérico: alta, edición y retiro de cada lista maestra
src/components/BuscadorOPP.tsx  Buscador de OPP (reemplaza el campo de texto libre del formulario actual)
src/lib/catalogos/config.ts     Configuración declarativa de catálogos administrables
supabase/migrations/            Esquema SQL, en orden
supabase/seed/                  Datos reales migrados desde tus Excel, en orden
```

## 7. Lo que falta para una v2 (no incluido en este alcance)

- Adjuntar documentos al registro de tiempo (la columna `documento_url` ya existe; falta conectar Supabase Storage).
- Edición/anulación de registros de producción ya guardados (hoy solo se crean).
- Reportes exportables a Excel/PDF.
- Módulo de cotizaciones (alimentado por el histórico real de costos que esta app empieza a capturar).
