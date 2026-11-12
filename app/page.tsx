import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { COLUMNS } from '@/lib/kanban';

export default async function Home() {
  const { user } = await getUser();
  if (user) redirect('/boards');

  return (
    <section className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Tus tareas, en columnas.</h1>
      <p className="mt-4 text-lg text-stone-600">
        Crea tableros, añade tareas y arrástralas entre {COLUMNS.map((c) => c.title.toLowerCase()).join(', ')}.
        Todo se guarda en tu cuenta.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-block rounded-lg bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-700"
      >
        Empezar gratis
      </Link>
      <div className="mt-12 grid grid-cols-3 gap-3 text-left" aria-hidden>
        {COLUMNS.map((c, i) => (
          <div key={c.status} className="rounded-xl bg-stone-200/70 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-stone-500">{c.title}</p>
            {Array.from({ length: 3 - i }).map((_, j) => (
              <div key={j} className="mb-2 h-8 rounded-md bg-white shadow-sm" />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
