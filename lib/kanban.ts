export type Status = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  status: Status;
  position: number;
}

export const COLUMNS: { status: Status; title: string }[] = [
  { status: 'todo', title: 'Por hacer' },
  { status: 'doing', title: 'En curso' },
  { status: 'done', title: 'Hecho' },
];

export function isStatus(value: unknown): value is Status {
  return value === 'todo' || value === 'doing' || value === 'done';
}

/** Tareas de una columna, ordenadas por posición. */
export function columnTasks(tasks: Task[], status: Status): Task[] {
  return tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);
}

/**
 * Posición entre dos vecinas, para no tener que renumerar la columna entera al mover una tarea.
 * Sin vecinas, empieza en 1000; al principio o al final deja 1000 de margen.
 */
export function positionBetween(before?: number, after?: number): number {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! - 1000;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
}

/** Posición para colocar una tarea al final de una columna. */
export function endPosition(tasks: Task[], status: Status): number {
  const col = columnTasks(tasks, status);
  return positionBetween(col.at(-1)?.position, undefined);
}

/**
 * Mueve una tarea a `status`, delante de la tarea `beforeId` (o al final si no se indica).
 * Devuelve la lista nueva y la posición calculada, sin mutar la original.
 */
export function moveTask(
  tasks: Task[],
  taskId: string,
  status: Status,
  beforeId?: string,
): { tasks: Task[]; position: number } | null {
  const moving = tasks.find((t) => t.id === taskId);
  if (!moving || taskId === beforeId) return null;

  const col = columnTasks(tasks, status).filter((t) => t.id !== taskId);
  const index = beforeId ? col.findIndex((t) => t.id === beforeId) : -1;
  const position =
    index === -1
      ? positionBetween(col.at(-1)?.position, undefined)
      : positionBetween(col[index - 1]?.position, col[index].position);

  return {
    position,
    tasks: tasks.map((t) => (t.id === taskId ? { ...t, status, position } : t)),
  };
}
