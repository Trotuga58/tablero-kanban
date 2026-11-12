'use client';

import { useState, useTransition, type DragEvent, type FormEvent } from 'react';
import { createTask, deleteTask, moveTask as saveMove } from '@/app/boards/actions';
import { COLUMNS, columnTasks, endPosition, moveTask, type Status, type Task } from '@/lib/kanban';

export function Board({ boardId, initialTasks }: { boardId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  /** Aplica el cambio en pantalla al momento y lo deshace si el servidor falla. */
  function optimistic(next: Task[], save: () => Promise<unknown>) {
    const previous = tasks;
    setTasks(next);
    setError(null);
    startTransition(async () => {
      try {
        await save();
      } catch {
        setTasks(previous);
        setError('No se pudo guardar el cambio. Inténtalo de nuevo.');
      }
    });
  }

  function move(taskId: string, status: Status, beforeId?: string) {
    const result = moveTask(tasks, taskId, status, beforeId);
    if (result) optimistic(result.tasks, () => saveMove(taskId, status, result.position));
  }

  function shift(task: Task, delta: -1 | 1) {
    const index = COLUMNS.findIndex((c) => c.status === task.status) + delta;
    if (index >= 0 && index < COLUMNS.length) move(task.id, COLUMNS[index].status);
  }

  function remove(taskId: string) {
    optimistic(
      tasks.filter((t) => t.id !== taskId),
      () => deleteTask(taskId),
    );
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get('title') ?? '').trim();
    if (!title) return;
    form.reset();

    const tempId = `tmp-${crypto.randomUUID()}`;
    const position = endPosition(tasks, 'todo');
    setTasks((current) => [...current, { id: tempId, title, status: 'todo', position }]);
    startTransition(async () => {
      try {
        const saved = await createTask(boardId, position, title);
        setTasks((current) => current.map((t) => (t.id === tempId && saved ? (saved as Task) : t)));
      } catch {
        setTasks((current) => current.filter((t) => t.id !== tempId));
        setError('No se pudo crear la tarea.');
      }
    });
  }

  function onDrop(event: DragEvent, status: Status, beforeId?: string) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.dataTransfer.getData('text/plain') || dragId;
    setDragId(null);
    setOverColumn(null);
    if (id) move(id, status, beforeId);
  }

  return (
    <div>
      <form onSubmit={add} className="mb-6 flex max-w-md gap-2">
        <input
          name="title"
          maxLength={200}
          placeholder="Añade una tarea…"
          aria-label="Título de la tarea nueva"
          className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 focus:border-stone-900 focus:outline-none"
        />
        <button className="rounded-md bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700">Añadir</button>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column, columnIndex) => {
          const list = columnTasks(tasks, column.status);
          return (
            <section
              key={column.status}
              aria-label={column.title}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(column.status);
              }}
              onDragLeave={() => setOverColumn(null)}
              onDrop={(e) => onDrop(e, column.status)}
              className={`min-h-48 rounded-xl p-3 transition ${
                overColumn === column.status ? 'bg-stone-300/80' : 'bg-stone-200/70'
              }`}
            >
              <h2 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-stone-600">
                {column.title}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs">{list.length}</span>
              </h2>

              <ul className="space-y-2">
                {list.map((task) => {
                  const pending = task.id.startsWith('tmp-');
                  return (
                    <li
                      key={task.id}
                      draggable={!pending}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                        setDragId(task.id);
                      }}
                      onDragEnd={() => setDragId(null)}
                      onDrop={(e) => onDrop(e, column.status, task.id)}
                      className={`group rounded-lg bg-white p-3 shadow-sm ${pending ? 'opacity-60' : 'cursor-grab'} ${
                        dragId === task.id ? 'opacity-40' : ''
                      }`}
                    >
                      <p className={`break-words ${column.status === 'done' ? 'text-stone-400 line-through' : ''}`}>
                        {task.title}
                      </p>
                      {!pending && (
                        <div className="mt-2 flex gap-1 text-xs text-stone-500 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                          <button
                            onClick={() => shift(task, -1)}
                            disabled={columnIndex === 0}
                            aria-label={`Mover "${task.title}" a la columna anterior`}
                            className="rounded px-2 py-1 hover:bg-stone-100 disabled:invisible"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => shift(task, 1)}
                            disabled={columnIndex === COLUMNS.length - 1}
                            aria-label={`Mover "${task.title}" a la columna siguiente`}
                            className="rounded px-2 py-1 hover:bg-stone-100 disabled:invisible"
                          >
                            →
                          </button>
                          <button
                            onClick={() => remove(task.id)}
                            aria-label={`Borrar "${task.title}"`}
                            className="ml-auto rounded px-2 py-1 text-red-600 hover:bg-red-50"
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
