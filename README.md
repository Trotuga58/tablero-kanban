# Tablero Kanban

[![CI](https://github.com/Trotuga58/tablero-kanban/actions/workflows/ci.yml/badge.svg)](https://github.com/Trotuga58/tablero-kanban/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-green)](LICENSE)

Aplicación web para organizar tareas en tableros con tres columnas (**Por hacer**, **En curso** y **Hecho**).
Cada persona tiene su cuenta y sus tableros se guardan en la nube.

<!-- Demo en vivo: https://tablero-kanban.vercel.app -->

## Qué hace

- **Cuentas de usuario** con email y contraseña (Supabase Auth), sesión en cookies y rutas protegidas.
- **Varios tableros por usuario**, con contador de tareas.
- **Arrastrar y soltar** tareas entre columnas y dentro de una columna, con la API nativa de HTML (sin librerías).
- **Accesible con teclado**: cada tarea tiene botones para moverla de columna o borrarla.
- **Actualizaciones optimistas**: los cambios se ven al momento y se deshacen si el servidor falla.

## Cómo está hecho

```
app/                 rutas de Next.js (App Router)
  login/             formulario y Server Actions de entrada, registro y salida
  auth/confirm/      destino del enlace de confirmación del email
  boards/            lista de tableros, tablero y Server Actions de tableros y tareas
components/          componentes de cliente (tablero con arrastrar y soltar, formulario de login)
lib/kanban.ts        lógica pura del tablero: ordenar columnas, calcular posiciones, mover tareas
lib/supabase/        clientes de Supabase para el servidor y el middleware
supabase/migrations/ esquema SQL con Row Level Security
```

Decisiones principales:

- **Seguridad en la base de datos**: las políticas de Row Level Security de Postgres hacen que cada usuario solo pueda leer y
  modificar sus tableros y tareas, aunque alguien llame a la API directamente. Las Server Actions además validan la entrada.
- **Posiciones fraccionarias**: al mover una tarea solo se actualiza esa fila, con una posición entre sus dos vecinas,
  en lugar de renumerar toda la columna.
- **Lógica separada de la interfaz**: el cálculo de posiciones y movimientos vive en `lib/kanban.ts` y tiene tests unitarios.
- **CI en GitHub Actions**: comprobación de tipos, tests y build de producción en cada push.

## Ejecutarlo en local

Requiere Node.js 22 y un proyecto gratuito de [Supabase](https://supabase.com).

1. En Supabase, abre **SQL Editor** y ejecuta [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
2. Copia las claves de **Project Settings → API**:

   ```bash
   cp .env.example .env.local   # y rellena la URL y la clave anon
   ```

3. Arranca:

   ```bash
   npm install
   npm run dev        # http://localhost:3000
   ```

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm test` | tests unitarios (Vitest) |
| `npm run typecheck` | comprobación de tipos |
| `npm run build` | build de producción |

## Desplegar

1. Importa el repositorio en [Vercel](https://vercel.com/new).
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en las variables de entorno.
3. En Supabase, **Authentication → URL Configuration**, pon la URL de Vercel como *Site URL*.

## Licencia

[MIT](LICENSE)
