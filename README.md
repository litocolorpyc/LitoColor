# Litocolor · Control de Producción

App web progresiva (PWA) para control de tiempo, insumos y producción diaria.

## Stack
- React 18 + Vite
- Supabase (base de datos + auth)
- Vercel (hosting)

## Módulos
| # | Nombre | Descripción |
|---|--------|-------------|
| 1 | **Captura** | Registro de tiempo por operario: actividad, máquina, OPP, cantidades, paros, reprocesos |
| 2 | **Dashboard** | Vista en tiempo real: eficiencia, paros activos, producción por OPP y máquina |
| 3 | **Insumos** | Control de consumo de papel: hojas entrada/salida, maculatura, merma |
| 4 | **Informe** | Resumen diario completo + despachos + exportación CSV |

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Iniciar en desarrollo
npm run dev
```

## Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el esquema en `src/lib/supabase.js`
3. Copiar la **Project URL** y **anon key** a `.env.local`

## Desplegar en Vercel

```bash
# Conectar repositorio en vercel.com
# Agregar variables de entorno:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
```

## Operarios y PINs

| Operario | PIN |
|----------|-----|
| James Rodriguez | 2501 |
| Andres Moreno | 2502 |
| Juliana Cortes | 2503 |
| Teresa Sierra | 2504 |
| Alejandro Rodriguez | 2505 |
| Juan Carlos Quintero | 2509 |

> Los PINs se configuran en Supabase y se pueden cambiar desde allí.
