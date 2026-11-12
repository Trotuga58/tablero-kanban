import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';
import { createBoard } from './actions';

export const metadata = { title: 'Mis tableros · Tablero Kanban' };

export default async function BoardsPage() {
  const { supabase } = await getUser();
  const { data: boards } = await supabase
    .from('boards')
    .select('id, name, created_at, tasks(count)')
    .order('created_at', { ascending: true });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Mis tableros</h1>

      <form action={createBoard} className="mb-8 flex max-w-md gap-2">
        <input
          name="name"
          required
          maxLength={80}
          placeholder="Nombre del tablero nuevo"
          aria-label="Nombre del tablero nuevo"
          className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 focus:border-stone-900 focus:outline-none"
        />
        <button className="rounded-md bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700">Crear</button>
      </form>

      {boards && boards.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/boards/${b.id}`}
                className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold">{b.name}</p>
                <p className="mt-1 text-sm text-stone-500">{(b.tasks as unknown as { count: number }[])[0]?.count ?? 0} tareas</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-stone-500">Aún no tienes tableros. Crea el primero arriba.</p>
      )}
    </section>
  );
}
