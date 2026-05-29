import { CalendarDays, CheckSquare } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import type { TaskStatus } from '../../types/project';
import { formatShortDate } from '../../utils/date';
import { getTaskProgress, taskStatusLabel } from '../../utils/tasks';

export function TasksPanel() {
  const nodes = useProjectStore((state) => state.project.nodes);
  const taskStatusFilter = useProjectStore((state) => state.taskStatusFilter);
  const setTaskStatusFilter = useProjectStore((state) => state.setTaskStatusFilter);
  const updateTodoItem = useProjectStore((state) => state.updateTodoItem);

  const todoNodes = nodes.filter((node) => node.data.kind === 'todo' && node.data.task);
  const filtered = taskStatusFilter === 'all'
    ? todoNodes
    : todoNodes.filter((node) => getTaskProgress(node.data.task).status === taskStatusFilter);

  const totalTasks = todoNodes.reduce((sum, node) => sum + (node.data.task?.checklist.length ?? 0), 0);
  const completedTasks = todoNodes.reduce(
    (sum, node) => sum + (node.data.task?.checklist.filter((item) => item.completed).length ?? 0),
    0
  );

  return (
    <aside className="tasks-panel glass-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Задачи</span>
          <h2>Панель TODO</h2>
        </div>
        <CheckSquare size={22} />
      </div>

      <div className="task-progress-card">
        <strong>{completedTasks}/{totalTasks}</strong>
        <span>выполнено</span>
        <div className="progress-line"><i style={{ width: `${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }} /></div>
      </div>

      <select
        className="select-field full"
        value={taskStatusFilter}
        onChange={(event) => setTaskStatusFilter(event.target.value as 'all' | TaskStatus)}
      >
        <option value="all">Все статусы</option>
        <option value="not-started">Не начато</option>
        <option value="in-progress">В процессе</option>
        <option value="done">Выполнено</option>
      </select>

      <div className="task-list">
        {filtered.map((node) => {
          const task = node.data.task!;
          const progress = getTaskProgress(task);
          return (
            <article className={`task-card task-card-${progress.status}`} key={node.id}>
              <div className="task-card-title">
                <strong>{node.data.title}</strong>
                <span className="task-status-mini">{taskStatusLabel(progress.status)}</span>
              </div>
              <div className="task-card-meta">
                <span>{progress.completed}/{progress.total} пунктов</span>
                <span><CalendarDays size={13} /> {formatShortDate(task.deadline)}</span>
              </div>
              <div className="progress-line"><i style={{ width: `${progress.percent}%` }} /></div>
              <div className="task-mini-list">
                {task.checklist.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(event) => updateTodoItem(node.id, item.id, { completed: event.target.checked })}
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </article>
          );
        })}
        {!filtered.length && <p className="empty-text">Задач с выбранным фильтром нет.</p>}
      </div>
    </aside>
  );
}
