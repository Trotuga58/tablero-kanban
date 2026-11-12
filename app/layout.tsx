import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { getUser } from '@/lib/supabase/server';
import { signOut } from './login/actions';

export const metadata: Metadata = {
  title: 'Tablero Kanban',
  description: 'Organiza tus tareas en tableros: por hacer, en curso y hecho.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();

  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href={user ? '/boards' : '/'} className="font-semibold tracking-tight">
              ▦ Tablero Kanban
            </Link>
            {user ? (
              <form action={signOut} className="flex items-center gap-3 text-sm">
                <span className="hidden text-stone-500 sm:inline">{user.email}</span>
                <button className="rounded-md px-3 py-1.5 hover:bg-stone-100">Cerrar sesión</button>
              </form>
            ) : (
              <Link href="/login" className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700">
                Entrar
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
