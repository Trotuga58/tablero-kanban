import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { Board } from '@/components/Board';
import type { Task } from '@/lib/kanban';
import { deleteBoard } from '../actions';

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getUser();

  const [{ data: board }, { data: tasks }] = await Promise.all([
    supabase.from('boards').select('id, name').eq('id', id).maybeSingle(),
    supabase.from('tasks').select('id, title, status, position').eq('board_id', id),
  ]);
  if (!board) notFound();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/boards" className="text-sm text-stone-500 hover:text-stone-900">
            ← Mis tableros
          </Link>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
        <form action={deleteBoard.bind(null, board.id)}>
          <button className="rounded-md px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Borrar tablero</button>
        </form>
      </div>
      <Board boardId={board.id} initialTasks={(tasks ?? []) as Task[]} />
    </section>
  );
}
