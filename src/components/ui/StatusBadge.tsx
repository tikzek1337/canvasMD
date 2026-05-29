import clsx from 'clsx';
import type { TaskPriority, TaskStatus } from '../../types/project';

const statusText: Record<TaskStatus, string> = {
  'not-started': 'Не начато',
  'in-progress': 'В процессе',
  done: 'Готово'
};

const priorityText: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критичный'
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={clsx('badge', `status-${status}`)}>{statusText[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={clsx('badge', `priority-${priority}`)}>{priorityText[priority]}</span>;
}
