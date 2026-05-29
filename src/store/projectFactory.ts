import { nanoid } from 'nanoid';
import { MarkerType } from '@xyflow/react';
import type {
  TaskPriority,
  TaskStatus,
  TraceEdge,
  TraceNode,
  TraceNodeData,
  TraceNodeKind,
  TraceProject
} from '../types/project';
import { nowIso } from '../utils/date';

const normalizedKind = (kind: TraceNodeKind): TraceNodeKind => {
  return ['text', 'image', 'todo', 'link'].includes(kind) ? kind : 'text';
};

const defaultBodyByKind: Record<TraceNodeKind, string> = {
  text: '<p>Новая заметка. Выделяйте отдельные слова и форматируйте их прямо в карточке.</p>',
  image: 'Добавьте изображение через кнопку в карточке.',
  todo: 'Список задач для проверки версии или проекта.',
  link: 'https://example.com',
  quote: '<p>Новая заметка.</p>',
  source: '<p>Новая заметка.</p>',
  evidence: '<p>Новая заметка.</p>',
  hypothesis: '<p>Новая заметка.</p>',
  group: '<p>Новая заметка.</p>'
};

const defaultTitleByKind: Record<TraceNodeKind, string> = {
  text: 'Заметка',
  image: 'Изображение',
  todo: 'TODO-блок',
  link: 'Ссылка',
  quote: 'Заметка',
  source: 'Заметка',
  evidence: 'Заметка',
  hypothesis: 'Заметка',
  group: 'Заметка'
};

const colorByKind: Record<TraceNodeKind, string> = {
  text: '#ffffff',
  image: '#e0f2fe',
  todo: '#dcfce7',
  link: '#dbeafe',
  quote: '#ffffff',
  source: '#ffffff',
  evidence: '#ffffff',
  hypothesis: '#ffffff',
  group: '#ffffff'
};

export function makeNodeData(kind: TraceNodeKind, overrides: Partial<TraceNodeData> = {}): TraceNodeData {
  const normalized = normalizedKind(kind);
  const now = nowIso();
  const baseTask = normalized === 'todo'
    ? {
        status: 'not-started' as TaskStatus,
        priority: 'medium' as TaskPriority,
        deadline: '',
        checklist: [
          { id: nanoid(8), text: 'Проверить источник', completed: false },
          { id: nanoid(8), text: 'Зафиксировать вывод', completed: false }
        ]
      }
    : undefined;

  return {
    title: defaultTitleByKind[normalized],
    body: defaultBodyByKind[normalized],
    tags: [],
    color: colorByKind[normalized],
    borderEnabled: false,
    borderColor: '#ef4444',
    comments: '',
    collapsed: false,
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
      bold: false,
      italic: false,
      underline: false,
      accent: false,
      highlight: ''
    },
    task: baseTask,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    kind: normalized
  };
}

export function makeNode(kind: TraceNodeKind, position = { x: 80, y: 80 }, overrides: Partial<TraceNodeData> = {}): TraceNode {
  const normalized = normalizedKind(kind);
  return {
    id: nanoid(10),
    type: 'traceNode',
    position,
    data: makeNodeData(normalized, overrides)
  };
}

export function makeEdge(source: string, target: string, label = ''): TraceEdge {
  return {
    id: nanoid(10),
    source,
    target,
    type: 'smoothstep',
    animated: false,
    label,
    data: { label },
    markerEnd: { type: MarkerType.ArrowClosed }
  } as TraceEdge;
}

export function createStarterProject(): TraceProject {
  const now = nowIso();
  const note = makeNode('text', { x: -220, y: -80 }, {
    title: 'Первая заметка',
    body: '<p>Начните с обычной заметки, изображения, ссылки или TODO-блока.</p>',
    tags: ['start']
  });
  const todo = makeNode('todo', { x: 230, y: -40 }, {
    title: 'План проверки',
    tags: ['todo']
  });

  return {
    id: nanoid(8),
    name: 'Новый проект canvasMD',
    nodes: [note, todo],
    edges: [makeEdge(note.id, todo.id, '')],
    viewport: { x: 0, y: 0, zoom: 1 },
    theme: 'dark',
    createdAt: now,
    updatedAt: now
  };
}
