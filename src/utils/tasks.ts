import type { TaskStatus, TraceTaskMeta } from '../types/project';

export interface TaskProgressInfo {
  completed: number;
  total: number;
  percent: number;
  status: TaskStatus;
}

export function getTaskProgress(task?: TraceTaskMeta): TaskProgressInfo {
  const total = task?.checklist.length ?? 0;
  const completed = task?.checklist.filter((item) => item.completed).length ?? 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  let status: TaskStatus = 'not-started';
  if (total > 0 && completed === total) status = 'done';
  else if (completed > 0) status = 'in-progress';

  return { completed, total, percent, status };
}

export function taskStatusLabel(status: TaskStatus) {
  if (status === 'done') return 'Выполнено';
  if (status === 'in-progress') return 'В процессе';
  return 'Не начато';
}
