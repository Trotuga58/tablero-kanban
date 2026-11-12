import { describe, expect, it } from 'vitest';
import { columnTasks, endPosition, isStatus, moveTask, positionBetween, type Task } from './kanban';

const tasks: Task[] = [
  { id: 'a', title: 'A', status: 'todo', position: 1000 },
  { id: 'b', title: 'B', status: 'todo', position: 2000 },
  { id: 'c', title: 'C', status: 'todo', position: 3000 },
  { id: 'd', title: 'D', status: 'doing', position: 1000 },
];

const ids = (list: Task[]) => list.map((t) => t.id);

describe('positionBetween', () => {
  it('empieza en 1000 en una columna vacía', () => expect(positionBetween()).toBe(1000));
  it('deja margen al principio y al final', () => {
    expect(positionBetween(undefined, 1000)).toBe(0);
    expect(positionBetween(3000, undefined)).toBe(4000);
  });
  it('usa el punto medio entre dos vecinas', () => expect(positionBetween(1000, 2000)).toBe(1500));
});

describe('columnTasks', () => {
  it('filtra por estado y ordena por posición', () => {
    const shuffled = [tasks[2], tasks[3], tasks[0], tasks[1]];
    expect(ids(columnTasks(shuffled, 'todo'))).toEqual(['a', 'b', 'c']);
  });
});

describe('endPosition', () => {
  it('va detrás de la última tarea', () => expect(endPosition(tasks, 'todo')).toBe(4000));
  it('vale 1000 en una columna vacía', () => expect(endPosition(tasks, 'done')).toBe(1000));
});

describe('moveTask', () => {
  it('mueve al final de otra columna', () => {
    const r = moveTask(tasks, 'a', 'doing')!;
    expect(r.position).toBe(2000);
    expect(ids(columnTasks(r.tasks, 'doing'))).toEqual(['d', 'a']);
    expect(ids(columnTasks(r.tasks, 'todo'))).toEqual(['b', 'c']);
  });

  it('coloca delante de otra tarea', () => {
    const r = moveTask(tasks, 'c', 'todo', 'b')!;
    expect(r.position).toBe(1500);
    expect(ids(columnTasks(r.tasks, 'todo'))).toEqual(['a', 'c', 'b']);
  });

  it('coloca al principio de la columna', () => {
    const r = moveTask(tasks, 'c', 'todo', 'a')!;
    expect(ids(columnTasks(r.tasks, 'todo'))).toEqual(['c', 'a', 'b']);
  });

  it('mueve a una columna vacía', () => {
    const r = moveTask(tasks, 'b', 'done')!;
    expect(r.position).toBe(1000);
    expect(ids(columnTasks(r.tasks, 'done'))).toEqual(['b']);
  });

  it('no muta la lista original', () => {
    moveTask(tasks, 'a', 'done');
    expect(tasks[0].status).toBe('todo');
  });

  it('ignora tareas inexistentes o soltar sobre sí misma', () => {
    expect(moveTask(tasks, 'x', 'done')).toBeNull();
    expect(moveTask(tasks, 'a', 'todo', 'a')).toBeNull();
  });
});

describe('isStatus', () => {
  it('solo acepta los tres estados', () => {
    expect(isStatus('doing')).toBe(true);
    expect(isStatus('archived')).toBe(false);
    expect(isStatus(undefined)).toBe(false);
  });
});
