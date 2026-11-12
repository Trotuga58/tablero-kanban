'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { isStatus } from '@/lib/kanban';

// Las políticas de la base de datos (RLS) garantizan que cada usuario solo toca lo suyo;
// aquí además se valida la entrada y se exige sesión.
async function session() {
  const { supabase, user } = await getUser();
  if (!user) redirect('/login');
  return supabase;
}

const text = (formData: FormData, key: string, max: number) => String(formData.get(key) ?? '').trim().slice(0, max);

export async function createBoard(formData: FormData) {
  const name = text(formData, 'name', 80);
  if (!name) return;
  const supabase = await session();
  const { data, error } = await supabase.from('boards').insert({ name }).select('id').single();
  if (error) throw new Error('No se pudo crear el tablero.');
  redirect(`/boards/${data.id}`);
}

export async function deleteBoard(boardId: string) {
  const supabase = await session();
  await supabase.from('boards').delete().eq('id', boardId);
  revalidatePath('/boards');
  redirect('/boards');
}

export async function createTask(boardId: string, position: number, title: string) {
  title = title.trim().slice(0, 200);
  if (!title || !Number.isFinite(position)) return null;
  const supabase = await session();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ board_id: boardId, title, status: 'todo', position })
    .select('id, title, status, position')
    .single();
  if (error) throw new Error('No se pudo crear la tarea.');
  return data;
}

export async function moveTask(taskId: string, status: string, position: number) {
  if (!isStatus(status) || !Number.isFinite(position)) throw new Error('Movimiento no válido.');
  const supabase = await session();
  const { error } = await supabase.from('tasks').update({ status, position }).eq('id', taskId);
  if (error) throw new Error('No se pudo mover la tarea.');
}

export async function deleteTask(taskId: string) {
  const supabase = await session();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw new Error('No se pudo borrar la tarea.');
}
